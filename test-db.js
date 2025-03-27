require('dotenv').config();
const { supabase } = require('./models/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test chats table
    const { data: chatsData, error: chatsError } = await supabase.from('chats').select('count');
    if (chatsError) {
      console.error('Error connecting to chats table:', chatsError.message);
    } else {
      console.log('Connected to chats table successfully!');
    }
    
    // Test presentations table
    const { data: presData, error: presError } = await supabase.from('presentations').select('count');
    if (presError) {
      console.error('Error connecting to presentations table:', presError.message);
    } else {
      console.log('Connected to presentations table successfully!');
    }
    
    console.log('Database test completed.');
  } catch (error) {
    console.error('Error testing database:', error.message);
  }
}

testDatabase();
