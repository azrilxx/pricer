/**
 * Test script to verify Supabase connection and create database tables
 * Run with: node test-supabase-connection.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Client } = require('pg');

// SQL schema from database-schema.md
const sqlSchema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFQs table
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFQ Items table
CREATE TABLE IF NOT EXISTS rfq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  material_code TEXT,
  line_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Runs table
CREATE TABLE IF NOT EXISTS pricing_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft',
  total_price NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Run Items table
CREATE TABLE IF NOT EXISTS pricing_run_items (
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
CREATE TABLE IF NOT EXISTS agreement_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricing_run_id UUID NOT NULL REFERENCES pricing_runs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_project_id ON rfqs(project_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_pricing_runs_rfq_id ON pricing_runs(rfq_id);
CREATE INDEX IF NOT EXISTS idx_pricing_run_items_pricing_run_id ON pricing_run_items(pricing_run_id);
CREATE INDEX IF NOT EXISTS idx_pricing_run_items_rfq_item_id ON pricing_run_items(rfq_item_id);
CREATE INDEX IF NOT EXISTS idx_agreement_drafts_pricing_run_id ON agreement_drafts(pricing_run_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rfqs_updated_at ON rfqs;
CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON rfqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rfq_items_updated_at ON rfq_items;
CREATE TRIGGER update_rfq_items_updated_at BEFORE UPDATE ON rfq_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_runs_updated_at ON pricing_runs;
CREATE TRIGGER update_pricing_runs_updated_at BEFORE UPDATE ON pricing_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_run_items_updated_at ON pricing_run_items;
CREATE TRIGGER update_pricing_run_items_updated_at BEFORE UPDATE ON pricing_run_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agreement_drafts_updated_at ON agreement_drafts;
CREATE TRIGGER update_agreement_drafts_updated_at BEFORE UPDATE ON agreement_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function testConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    console.log('   Make sure backend/.env exists and contains DATABASE_URL');
    process.exit(1);
  }

  // Show connection info (mask password)
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@');
  console.log('🔌 Connecting to:', maskedUrl);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('   Attempting connection...');
    await client.connect();
    console.log('✅ Successfully connected to Supabase!');

    console.log('\n📊 Creating database tables...');
    await client.query(sqlSchema);
    console.log('✅ All tables, indexes, and triggers created successfully!');

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📋 Created tables:');
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log('\n✅ Database setup complete!');
    console.log(`\n📝 Total tables created: ${result.rows.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed.');
  }
}

// Run the test
testConnection();

