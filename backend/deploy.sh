#!/bin/bash

# FitTracker Backend Heroku Deployment Script
# Run this script from the backend/ directory

echo "🚀 Starting FitTracker Backend Deployment to Heroku..."

# Step 1: Check if we're in the right directory
if [ ! -f "server.py" ]; then
    echo "❌ Error: server.py not found. Please run this from the backend/ directory."
    exit 1
fi

# Step 2: Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
fi

# Step 3: Add and commit files
echo "📝 Adding files to Git..."
git add .
git commit -m "Deploy FitTracker backend to Heroku"

# Step 4: Create Heroku app (you'll need to replace 'your-app-name')
echo "🌐 Creating Heroku app..."
echo "⚠️  Please replace 'your-fittracker-backend' with your preferred app name"
read -p "Enter your Heroku app name: " APP_NAME

if [ -z "$APP_NAME" ]; then
    APP_NAME="fittracker-backend-$(date +%s)"
    echo "Using default app name: $APP_NAME"
fi

heroku create $APP_NAME

# Step 5: Set environment variables
echo "🔧 Setting up environment variables..."
echo "⚠️  You'll need to set up MongoDB Atlas first (see MONGODB_ATLAS_SETUP.md)"

read -p "Enter your MongoDB Atlas connection string: " MONGO_URL
read -p "Enter your JWT secret key (or press enter for default): " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET="your-super-secret-jwt-key-change-in-production-$(date +%s)"
fi

heroku config:set MONGO_URL="$MONGO_URL" --app $APP_NAME
heroku config:set JWT_SECRET_KEY="$JWT_SECRET" --app $APP_NAME
heroku config:set USDA_API_KEY="Nd8DOm1qWuH1Y2S7OLiXuvOjdsT1d38zYj4UlCMd" --app $APP_NAME
heroku config:set ALGORITHM="HS256" --app $APP_NAME
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES="30" --app $APP_NAME

# Step 6: Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git push heroku main

# Step 7: Open the app
echo "✅ Deployment complete!"
echo "🌐 Your backend is available at: https://$APP_NAME.herokuapp.com"
echo "🔗 API docs available at: https://$APP_NAME.herokuapp.com/docs"

# Step 8: Show next steps
echo ""
echo "📋 Next Steps:"
echo "1. Test your API at https://$APP_NAME.herokuapp.com/api/health"
echo "2. Update your frontend .env file:"
echo "   REACT_APP_BACKEND_URL=https://$APP_NAME.herokuapp.com"
echo "3. Deploy your frontend to GitHub Pages"

heroku open --app $APP_NAME