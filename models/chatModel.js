const { supabase } = require('./database');

/**
 * Save a chat message to the database
 * @param {string} userId - WhatsApp user ID
 * @param {string} message - Message content
 * @param {boolean} isIncoming - Whether the message is from the user (true) or the bot (false)
 * @returns {Promise<Object>} - The saved chat data
 */
async function saveChatMessage(userId, message, isIncoming) {
  const { data, error } = await supabase
    .from('chats')
    .insert([
      {
        user_id: userId,
        title: message, // Using title column to store the message content
        created_at: new Date().toISOString() // Using created_at for timestamp
        // is_incoming field is not available in the existing schema
      }
    ])
    .select();

  if (error) throw new Error(`Error saving chat message: ${error.message}`);
  return data[0];
}

/**
 * Get chat history for a specific user
 * @param {string} userId - WhatsApp user ID
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<Array>} - Array of chat message objects
 */
async function getUserChatHistory(userId, limit = 50) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Error fetching chat history: ${error.message}`);
  return data;
}

/**
 * Delete chat history for a specific user
 * @param {string} userId - WhatsApp user ID
 * @returns {Promise<void>}
 */
async function clearUserChatHistory(userId) {
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('user_id', userId);

  if (error) throw new Error(`Error clearing chat history: ${error.message}`);
}

module.exports = {
  saveChatMessage,
  getUserChatHistory,
  clearUserChatHistory
};
