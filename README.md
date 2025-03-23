# WhatsApp Presentation Maker

This application allows users to create Google Slides presentations through WhatsApp messages.

## Features

- Create presentations by sending a WhatsApp message
- Google Slides integration
- Supabase database for storing presentation data

## Deployment on Render

### Prerequisites

1. A Render account
2. Google Cloud Platform account with Google Slides API enabled
3. Supabase account with a project set up

### Steps to Deploy

1. Fork or clone this repository to your GitHub account
2. Connect your GitHub repository to Render
3. Create a new Web Service in Render
4. Use the following settings:

   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

5. Add the following environment variables in Render dashboard:

   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `GOOGLE_REDIRECT_URI`: Your redirect URI (should be your Render app URL + /callback)
   - `GOOGLE_REFRESH_TOKEN`: Your Google OAuth refresh token
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

6. Deploy the application

### WhatsApp Authentication

After deployment, you'll need to scan the QR code that appears in the logs to authenticate the WhatsApp client. This needs to be done once after each deployment.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Run the application: `npm start`

## Usage

Send a message to the connected WhatsApp number with the following format:

```
/presentation Title of Presentation
Slide 1 content
Slide 2 content
Slide 3 content
```

The bot will create a presentation and reply with a link to the Google Slides document.
