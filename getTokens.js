const { google } = require("googleapis");
require("dotenv").config();
const readline = require("readline");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/presentations"];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Get authorization URL
async function getAuthCode() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this URL:", authUrl);

  rl.question("Enter the code from that page here: ", async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Your refresh token:", tokens.refresh_token);
    rl.close();
  });
}

getAuthCode();
