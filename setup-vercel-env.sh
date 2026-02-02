#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps you set up all required environment variables for Vercel deployment

echo "🚀 Digistore24 Automation - Vercel Environment Setup"
echo "===================================================="
echo ""
echo "This script will help you configure environment variables for Vercel."
echo "You can set variables for Production, Preview, and/or Development environments."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "Install it with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Login check
echo "Checking Vercel authentication..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "Please login to Vercel first:"
    vercel login
fi

echo ""
echo "Select environment(s) to configure:"
echo "1) Production only"
echo "2) Production, Preview, and Development (recommended)"
echo "3) Custom selection"
read -p "Choice [1-3]: " env_choice

case $env_choice in
    1)
        ENV_FLAGS="production"
        ;;
    2)
        ENV_FLAGS="production,preview,development"
        ;;
    3)
        read -p "Enter environments (comma-separated: production,preview,development): " ENV_FLAGS
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "📝 Enter your environment variable values:"
echo "(Press Enter to skip optional variables)"
echo ""

# Required variables
echo "=== Required Variables ==="
read -p "DIGISTORE24_API_KEY: " DIGISTORE24_API_KEY
read -p "DIGISTORE24_ID: " DIGISTORE24_ID
read -p "NEXT_PUBLIC_SUPABASE_URL: " NEXT_PUBLIC_SUPABASE_URL
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " NEXT_PUBLIC_SUPABASE_ANON_KEY
read -p "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
read -p "API_SECRET_KEY: " API_SECRET_KEY
read -p "CRON_SECRET: " CRON_SECRET

echo ""
echo "=== Optional Variables ==="
read -p "DISCORD_WEBHOOK_URL (optional): " DISCORD_WEBHOOK_URL
read -p "SENDGRID_API_KEY (optional): " SENDGRID_API_KEY
read -p "NOTIFICATION_EMAIL (optional): " NOTIFICATION_EMAIL

echo ""
echo "🔄 Setting environment variables in Vercel..."
echo ""

# Function to add env var
add_env_var() {
    local name=$1
    local value=$2
    
    if [ -n "$value" ]; then
        echo "Setting $name..."
        echo "$value" | vercel env add "$name" "$ENV_FLAGS"
    fi
}

# Set required variables
add_env_var "DIGISTORE24_API_KEY" "$DIGISTORE24_API_KEY"
add_env_var "DIGISTORE24_ID" "$DIGISTORE24_ID"
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
add_env_var "API_SECRET_KEY" "$API_SECRET_KEY"
add_env_var "CRON_SECRET" "$CRON_SECRET"

# Set optional variables
add_env_var "DISCORD_WEBHOOK_URL" "$DISCORD_WEBHOOK_URL"
add_env_var "SENDGRID_API_KEY" "$SENDGRID_API_KEY"
add_env_var "NOTIFICATION_EMAIL" "$NOTIFICATION_EMAIL"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel: vercel --prod"
echo "2. Configure Digistore24 webhook URL"
echo "3. Set up Supabase database tables"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
