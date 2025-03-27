# WhatsApp Presentation Maker

A WhatsApp bot that allows users to create Google Slides presentations directly from WhatsApp messages. The bot now includes database storage for presentations and chat history, making it more robust and user-friendly.

## Features

- Create Google Slides presentations via WhatsApp
- Store presentation history in a database
- Track chat history for better user experience
- View presentation history with the `/history` command
- Clear chat history with the `/clear` command
- Deployable to fly.io for 24/7 availability

## Prerequisites

- Node.js (v14 or higher)
- A Supabase account for database storage
- Google Cloud Platform account with Google Slides API enabled
- WhatsApp account for the bot

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token_after_auth

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

PORT=3000
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd wa-presentation-maker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Google Cloud Platform

1. Create a project in Google Cloud Console
2. Enable the Google Slides API
3. Create OAuth credentials (Web application type)
4. Add the redirect URI (http://localhost:3000/callback)
5. Copy the Client ID and Client Secret to your `.env` file

### 4. Set up Supabase

1. Create a new project in Supabase
2. Get your project URL and anon key from the API settings
3. Add them to your `.env` file
4. Run the SQL in `database/init.sql` in the Supabase SQL Editor to create the necessary functions

### 5. Get Google Refresh Token

1. Start the application: `npm start`
2. Visit the authorization URL displayed in the console
3. Complete the OAuth flow
4. The refresh token will be automatically added to your `.env` file

### 6. Start the WhatsApp bot

1. Run `npm start`
2. Scan the QR code with WhatsApp to log in
3. The bot is now ready to use

## Usage

Send the following commands to the bot on WhatsApp:

- `/help` - Display help message
- `/presentation [Title]\n[Slide 1 content]\n[Slide 2 content]...` - Create a presentation
- `/history` - View your presentation history
- `/clear` - Clear your chat history

## Deploying to fly.io (24/7 Availability)

### 1. Install the Fly CLI

```bash
# For Windows (using PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Login to fly.io

```bash
fly auth login
```

### 3. Launch your app

```bash
fly launch
```

This will use the existing `fly.toml` configuration and guide you through the setup process.

### 4. Set secrets (environment variables)

```bash
fly secrets set GOOGLE_CLIENT_ID=your_google_client_id
fly secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret
fly secrets set GOOGLE_REDIRECT_URI=https://your-app-name.fly.dev/callback
fly secrets set GOOGLE_REFRESH_TOKEN=your_refresh_token
fly secrets set SUPABASE_URL=your_supabase_url
fly secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Deploy your app

```bash
fly deploy
```

### 6. Open your app

```bash
fly open
```

### 7. Monitor your app

```bash
fly status
fly logs
```

## Important Notes for Deployment

1. When deploying to fly.io, update your Google OAuth redirect URI to match your fly.io app URL
2. You may need to re-authenticate to get a new refresh token with the updated redirect URI
3. WhatsApp Web requires a browser environment, which fly.io provides through its VM-based deployment
4. For persistent WhatsApp sessions, consider using a volume to store the WhatsApp session data

```bash
fly volumes create whatsapp_data --size 1
```

Then update your `fly.toml` to mount this volume:

```toml
[mounts]
  source = "whatsapp_data"
  destination = "/app/.wwebjs_auth"
```

## License

MIT
