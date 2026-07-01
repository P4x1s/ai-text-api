-- Run this in Supabase SQL Editor to create the api_keys table

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access)
CREATE POLICY "Service role can do everything" ON api_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
