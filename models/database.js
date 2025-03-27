const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables.');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    // Check if tables exist and create them if they don't
    const { error: presentationsError } = await supabase
      .from('presentations')
      .select('id')
      .limit(1);

    if (presentationsError && presentationsError.code === '42P01') {
      console.log('Creating presentations table...');
      // Create presentations table
      await supabase.rpc('create_presentations_table');
    }

    const { error: chatsError } = await supabase
      .from('chats')
      .select('id')
      .limit(1);

    if (chatsError && chatsError.code === '42P01') {
      console.log('Creating chats table...');
      // Create chats table
      await supabase.rpc('create_chats_table');
    }

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

module.exports = { supabase, initializeDatabase };
