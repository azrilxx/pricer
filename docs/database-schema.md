# NSC Pricer Database Schema

This document outlines the database structure for NSC Pricer v0.

## Tables Overview

1. **clients** - Client companies
2. **projects** - Projects belonging to clients
3. **rfqs** - Request for Quotations
4. **rfq_items** - Individual items within an RFQ
5. **pricing_runs** - Pricing calculations for an RFQ
6. **pricing_run_items** - Individual item prices from a pricing run
7. **agreement_drafts** - Draft price agreements generated from pricing runs

## SQL Schema

Run this SQL in your Supabase SQL Editor to create the tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFQs table
CREATE TABLE rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- draft, pricing, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFQ Items table
CREATE TABLE rfq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- e.g., 'pcs', 'lengths', 'kg'
  material_code TEXT, -- Optional material code
  line_number INTEGER, -- Order of items in the RFQ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Runs table
CREATE TABLE pricing_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft', -- draft, completed
  total_price NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Run Items table
CREATE TABLE pricing_run_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricing_run_id UUID NOT NULL REFERENCES pricing_runs(id) ON DELETE CASCADE,
  rfq_item_id UUID NOT NULL REFERENCES rfq_items(id) ON DELETE CASCADE,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agreement Drafts table
CREATE TABLE agreement_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricing_run_id UUID NOT NULL REFERENCES pricing_runs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- JSON or text content of the agreement
  status TEXT DEFAULT 'draft', -- draft, reviewed, sent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_rfqs_project_id ON rfqs(project_id);
CREATE INDEX idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX idx_pricing_runs_rfq_id ON pricing_runs(rfq_id);
CREATE INDEX idx_pricing_run_items_pricing_run_id ON pricing_run_items(pricing_run_id);
CREATE INDEX idx_pricing_run_items_rfq_item_id ON pricing_run_items(rfq_item_id);
CREATE INDEX idx_agreement_drafts_pricing_run_id ON agreement_drafts(pricing_run_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfq_items_updated_at BEFORE UPDATE ON rfq_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_runs_updated_at BEFORE UPDATE ON pricing_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_run_items_updated_at BEFORE UPDATE ON pricing_run_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agreement_drafts_updated_at BEFORE UPDATE ON agreement_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Next Steps

1. **Get your Supabase Project URL:**
   - Go to your Supabase dashboard
   - Navigate to Project Settings > API
   - Copy the "Project URL" (format: `https://[project-id].supabase.co`)
   - Update `SUPABASE_URL` in `backend/.env`

2. **Get your Database Connection String:**
   - In Supabase dashboard, go to Project Settings > Database
   - Under "Connection string", select "URI" tab
   - Copy the connection string
   - Update `DATABASE_URL` in `backend/.env`

3. **Run the SQL Schema:**
   - In Supabase dashboard, go to SQL Editor
   - Create a new query
   - Paste the SQL schema above
   - Run it to create all tables

4. **Set up Row Level Security (RLS):**
   - For v0, you may want to disable RLS initially for development
   - Later, you'll add authentication and RLS policies

