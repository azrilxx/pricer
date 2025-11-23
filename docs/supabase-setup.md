# Supabase Setup Guide

## Quick Setup Checklist

### 1. Get Your Supabase Project URL

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Project Settings** → **API**
4. Copy the **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
5. Update `SUPABASE_URL` in `backend/.env`

### 2. Get Your Database Connection String

1. In Supabase dashboard, go to **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Select the **URI** tab
4. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Update `DATABASE_URL` in `backend/.env`

### 3. Verify Your Keys

Your keys are already in `backend/.env`:
- ✅ `SUPABASE_ANON_KEY` - Already filled in
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Already filled in

### 4. Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the SQL from `docs/database-schema.md`
4. Paste and run it
5. Verify tables were created in **Table Editor**

## Current Status

✅ Supabase keys added to `backend/.env`
⏳ Supabase Project URL - **Need to fill in**
⏳ Database Connection String - **Need to fill in**
⏳ Database tables - **Run SQL schema after filling URLs**

## Security Notes

- The `.env` file is in `.gitignore` and will NOT be committed
- Never commit real secrets to the repository
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges - keep it secure
- Use `SUPABASE_ANON_KEY` for client-side operations
- Use `SUPABASE_SERVICE_ROLE_KEY` only for server-side admin operations

