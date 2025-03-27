const express = require("express");
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { createClient } = require("@supabase/supabase-js");
const { google } = require("googleapis");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const { createPresentation } = require("./services/presentationService.js");
const { auth } = require("./services/presentationService.js");

// Ensure required environment variables exist
if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.GOOGLE_REDIRECT_URI
) {
  throw new Error("Missing required Google OAuth environment variables.");
}

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Create Express server for OAuth flow
const app = express();

// Add health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Missing authorization code.");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
      fs.appendFileSync(
        ".env",
        `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`
      );
      console.log("Refresh token saved to .env file.");
    }

    res.send("Authentication successful! You can close this window.");
  } catch (error) {
    console.error("OAuth authentication failed:", error);
    res.status(500).send("Authentication failed: " + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OAuth server running on port ${PORT}`);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/presentations"],
  });
  console.log("Authorize this app by visiting this URL:", authUrl);
});

// Initialize Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Track conversation state for users
const userStates = {};

// Initialize WhatsApp client
const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp Client is ready!");
});

// Helper function to check if a message is a greeting
function isGreeting(message) {
  const greetings = ["hello", "hi", "hey", "hola", "greetings", "howdy", "good morning", "good afternoon", "good evening"];
  return greetings.some(greeting => message.toLowerCase().includes(greeting));
}

// Helper function to provide guidance on creating presentations
function getHelpMessage() {
  return `Hello! I'm your presentation assistant. 👋

To create a Google Slides presentation, send me a message in this format:

/presentation Your Presentation Title
Slide 1 content
Slide 2 content
Slide 3 content

I'll create the presentation and send you the link when it's ready!`;
}

// Handle incoming messages
client.on("message", async (msg) => {
  const userId = msg.from;
  const messageContent = msg.body.trim();
  
  // Initialize user state if not exists
  if (!userStates[userId]) {
    userStates[userId] = {
      awaitingPresentation: false,
      presentationTitle: null,
      slides: [],
    };
  }
  
  // Check for greetings
  if (isGreeting(messageContent)) {
    msg.reply(getHelpMessage());
    return;
  }
  
  // Check for help command
  if (messageContent.toLowerCase() === "/help") {
    msg.reply(getHelpMessage());
    return;
  }
  
  // Handle presentation creation command
  if (messageContent.toLowerCase().startsWith("/presentation")) {
    try {
      // Store user input in Supabase
      const { data, error } = await supabase.from("presentations").insert([
        {
          user_id: userId,
          content: messageContent,
        },
      ]);

      if (error)
        throw new Error("Error storing data in Supabase: " + error.message);

      // Generate presentation
      const presentationLink = await createPresentation(messageContent);

      // Send the link back to the user
      msg.reply(
        `Your presentation is ready! Here's the link: ${presentationLink}\n\nYou can create another presentation anytime by sending a new message starting with /presentation.`
      );
    } catch (error) {
      msg.reply("Sorry, there was an error creating your presentation. Please try again or type /help for instructions.");
      console.error(error);
    }
    return;
  }
  
  // If user is in conversation but message doesn't match any command
  msg.reply("I'm not sure what you're asking. Type /help to see how to create a presentation.");
});

client.initialize();
