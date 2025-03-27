const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkTableStructure() {
  try {
    // Get chats table structure
    const { data: chatsData, error: chatsError } = await supabase
      .rpc('get_table_structure', { table_name: 'chats' });
    
    if (chatsError) {
      console.error('Error getting chats table structure:', chatsError.message);
      // If the RPC function doesn't exist, try a simple query
      const { data, error } = await supabase.from('chats').select('*').limit(1);
      if (error) {
        console.error('Error querying chats table:', error.message);
      } else {
        console.log('Chats table exists with these columns:', Object.keys(data[0] || {}));
      }
    } else {
      console.log('Chats table structure:', chatsData);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTableStructure();
