#!/bin/bash

echo "🚀 Deploying Dawid Faith Webhook API to Vercel..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please copy .env.local.example to .env.local and fill in your values."
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel (assuming Vercel CLI is installed)
    if command -v vercel &> /dev/null; then
        echo "🌐 Deploying to Vercel..."
        vercel --prod
    else
        echo "📋 Vercel CLI not found. Please install it:"
        echo "npm i -g vercel"
        echo "Then run: vercel --prod"
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
