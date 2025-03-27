const { google } = require("googleapis");
require("dotenv").config();

// Ensure required environment variables exist
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI || !process.env.GOOGLE_REFRESH_TOKEN) {
  throw new Error("Missing required Google OAuth environment variables.");
}

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set initial credentials
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Handle token refresh
oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
    require('fs').appendFileSync('.env', `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("Updated refresh token saved.");
  }
});

const auth = {
  getClient: async () => {
    try {
      await oauth2Client.getAccessToken();
      return oauth2Client;
    } catch (error) {
      console.error('Authentication error:', error.message);
      throw new Error('Failed to authenticate with Google Services');
    }
  },
};

// Initialize Google Slides API
const slides = google.slides({ version: "v1", auth: oauth2Client });

// Import presentation model
const { savePresentation } = require('../models/presentationModel');

async function createPresentation(content, userId = 'unknown') {
  try {
    // Parse content to extract presentation details
    const presentationData = parseContent(content);

    // Create a new presentation
    const presentation = await slides.presentations.create({
      requestBody: {
        title: presentationData.title,
      },
    });

    console.log("Created presentation:", presentation.data.presentationId);

    // Add slides based on the content
    await addSlides(presentation.data.presentationId, presentationData);

    const presentationUrl = `https://docs.google.com/presentation/d/${presentation.data.presentationId}`;
    
    // Save presentation to database
    try {
      await savePresentation(
        userId,
        presentationData.title, // This won't be used in the updated model
        content,
        presentation.data.presentationId, // This won't be used in the updated model
        presentationUrl
      );
      console.log('Presentation saved to database');
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // Continue even if database save fails
    }

    return presentationUrl;
  } catch (error) {
    console.error("Error creating presentation:", error);
    throw new Error("Failed to create presentation.");
  }
}

async function addSlides(presentationId, presentationData) {
  try {
    const requests = [];

    // Add a slide for each content item
    presentationData.slides.forEach((slide, index) => {
      // Create a new slide
      requests.push({
        createSlide: {
          objectId: `slide_${index}`,
          insertionIndex: index,
          slideLayoutReference: {
            predefinedLayout: "TITLE_AND_BODY",
          },
        },
      });
    });

    // First create all slides
    if (requests.length > 0) {
      await slides.presentations.batchUpdate({
        presentationId: presentationId,
        requestBody: { requests },
      });

      // Get the slide details to find placeholder IDs
      const presentation = await slides.presentations.get({
        presentationId: presentationId,
      });

      // Now update the text in placeholders
      const textRequests = [];
      presentation.data.slides.forEach((slide, index) => {
        const titleElement = slide.pageElements.find(el => el.shape && el.shape.placeholder && el.shape.placeholder.type === 'TITLE');
        const bodyElement = slide.pageElements.find(el => el.shape && el.shape.placeholder && el.shape.placeholder.type === 'BODY');

        if (titleElement && bodyElement) {
          textRequests.push({
            insertText: {
              objectId: titleElement.objectId,
              insertionIndex: 0,
              text: presentationData.slides[index].title,
            },
          });

          textRequests.push({
            insertText: {
              objectId: bodyElement.objectId,
              insertionIndex: 0,
              text: presentationData.slides[index].content,
            },
          });
        }
      });

      // Execute text insertion
      if (textRequests.length > 0) {
        await slides.presentations.batchUpdate({
          presentationId: presentationId,
          requestBody: { requests: textRequests },
        });
      }
    }
  } catch (error) {
    console.error("Error adding slides:", error);
    throw new Error("Failed to add slides to the presentation.");
  }
}

function parseContent(content) {
  // Check if content is an object (with userId) or a string
  const messageText = typeof content === 'object' ? content.toString() : content;
  
  // Parse the message content to extract presentation structure
  const lines = messageText.split("\n").filter(line => line.trim() !== "");
  
  // Extract title from first line
  const title = lines[0].replace("/presentation", "").trim();
  
  // Process remaining lines as slides
  const slides = [];
  for (let i = 1; i < lines.length; i++) {
    const slideContent = lines[i].trim();
    if (slideContent) {
      // Create a title from the first few words of the content
      const slideTitle = slideContent.split(" ").slice(0, 3).join(" ") + "...";
      slides.push({
        title: slideTitle,
        content: slideContent
      });
    }
  }
  
  return {
    title: title || "Untitled Presentation",
    slides: slides.length > 0 ? slides : [{ title: "Slide 1", content: "No content provided" }],
  };
}

module.exports = { createPresentation, auth };
