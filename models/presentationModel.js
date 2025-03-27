const { supabase } = require('./database');

/**
 * Save a new presentation to the database
 * @param {string} userId - WhatsApp user ID
 * @param {string} title - Presentation title
 * @param {string} content - Raw presentation content
 * @param {string} presentationId - Google Slides presentation ID
 * @param {string} presentationUrl - Google Slides presentation URL
 * @returns {Promise<Object>} - The saved presentation data
 */
async function savePresentation(userId, title, content, presentationId, presentationUrl) {
  const { data, error } = await supabase
    .from('presentations')
    .insert([
      {
        user_id: userId,
        title: title,
        content: content,
        presentation_id: presentationId,
        presentation_url: presentationUrl,
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) throw new Error(`Error saving presentation: ${error.message}`);
  return data[0];
}

/**
 * Get all presentations for a specific user
 * @param {string} userId - WhatsApp user ID
 * @returns {Promise<Array>} - Array of presentation objects
 */
async function getUserPresentations(userId) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching presentations: ${error.message}`);
  return data;
}

/**
 * Get a specific presentation by ID
 * @param {number} id - Presentation database ID
 * @returns {Promise<Object>} - The presentation data
 */
async function getPresentationById(id) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Error fetching presentation: ${error.message}`);
  return data;
}

module.exports = {
  savePresentation,
  getUserPresentations,
  getPresentationById
};
