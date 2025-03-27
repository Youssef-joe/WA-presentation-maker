-- Add missing columns to chats table
ALTER TABLE chats
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS is_incoming BOOLEAN,
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);

-- Check if presentations table exists and create it if not
CREATE TABLE IF NOT EXISTS presentations (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  presentation_id TEXT NOT NULL,
  presentation_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for presentations table
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
