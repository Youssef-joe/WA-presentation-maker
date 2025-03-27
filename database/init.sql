-- SQL functions to create tables if they don't exist

-- Function to create presentations table
CREATE OR REPLACE FUNCTION create_presentations_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS presentations (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    presentation_id TEXT NOT NULL,
    presentation_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create index on user_id for faster lookups
  CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to create chats table
CREATE OR REPLACE FUNCTION create_chats_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_incoming BOOLEAN NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Create index on user_id for faster lookups
  CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
END;
$$ LANGUAGE plpgsql;
