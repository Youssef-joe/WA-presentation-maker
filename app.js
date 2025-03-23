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

// Initialize WhatsApp client
const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp Client is ready!");
});

// Handle incoming messages
client.on("message", async (msg) => {
  if (msg.body.toLowerCase().startsWith("/presentation")) {
    try {
      // Store user input in Supabase
      const { data, error } = await supabase.from("presentations").insert([
        {
          user_id: msg.from,
          content: msg.body,
        },
      ]);

      if (error)
        throw new Error("Error storing data in Supabase: " + error.message);

      // Generate presentation
      const presentationLink = await createPresentation(msg.body);

      // Send the link back to the user
      msg.reply(
        `Your presentation is ready! Here's the link: ${presentationLink}`
      );
    } catch (error) {
      msg.reply("Sorry, there was an error creating your presentation.");
      console.error(error);
    }
  }
});

client.initialize();
