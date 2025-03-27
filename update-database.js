const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function updateDatabase() {
  try {
    console.log('Starting database update...');
    
    // Read SQL file
    const sqlContent = fs.readFileSync('./database/update-schema.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        // If the RPC method doesn't exist, we'll need to use another approach
        console.error('Error executing SQL:', error.message);
        console.log('Trying alternative approach...');
        
        // For alter table statements
        if (statement.toLowerCase().includes('alter table chats')) {
          console.log('Adding missing columns to chats table...');
          
          // Add message column
          if (!statement.toLowerCase().includes('message text')) {
            const { error: msgError } = await supabase.rpc('alter_table_add_column', { 
              table_name: 'chats', 
              column_name: 'message', 
              column_type: 'TEXT' 
            });
            if (msgError) console.error('Error adding message column:', msgError.message);
          }
          
          // Add is_incoming column
          if (!statement.toLowerCase().includes('is_incoming boolean')) {
            const { error: incomingError } = await supabase.rpc('alter_table_add_column', { 
              table_name: 'chats', 
              column_name: 'is_incoming', 
              column_type: 'BOOLEAN' 
            });
            if (incomingError) console.error('Error adding is_incoming column:', incomingError.message);
          }
          
          // Add timestamp column
          if (!statement.toLowerCase().includes('timestamp timestamp')) {
            const { error: timeError } = await supabase.rpc('alter_table_add_column', { 
              table_name: 'chats', 
              column_name: 'timestamp', 
              column_type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' 
            });
            if (timeError) console.error('Error adding timestamp column:', timeError.message);
          }
        }
      }
    }
    
    console.log('Database update completed!');
    
    // Verify the changes
    const { data: chatsData, error: chatsError } = await supabase.from('chats').select('*').limit(1);
    if (chatsError) {
      console.error('Error verifying chats table:', chatsError.message);
    } else {
      console.log('Chats table columns:', Object.keys(chatsData[0] || {}));
    }
    
    const { data: presData, error: presError } = await supabase.from('presentations').select('*').limit(1);
    if (presError) {
      console.error('Error verifying presentations table:', presError.message);
    } else {
      console.log('Presentations table columns:', Object.keys(presData[0] || {}));
    }
    
  } catch (error) {
    console.error('Error updating database:', error.message);
  }
}

updateDatabase();
