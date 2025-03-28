# PowerShell script to create a fly.io volume for WhatsApp session data

# Create a 1GB volume named whatsapp_data
fly volumes create whatsapp_data --size 1 --region fra

# Note: Run this script before deploying your application
# After creating the volume, deploy your application with:
# fly deploy