#!/bin/bash

# Intimate Companion App Deployment Script
echo "🚀 Deploying Intimate Companion App..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Check for required environment variables
required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set. Please check your .env file."
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations
echo "🗄️  Setting up database..."
if command -v supabase &> /dev/null; then
    supabase db reset --db-url "$VITE_SUPABASE_URL"
else
    echo "⚠️  Supabase CLI not found. Please ensure your database is set up manually."
fi

# Build the application
echo "🏗️  Building application..."
npm run build

# Start services with Docker Compose
echo "🐳 Starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if app is running
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access your intimate companion app at: http://localhost:3000"
    echo "🔒 Remember: This is a private, secure app for you and your partner only."
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Features available:"
echo "   • Secure appointment booking"
echo "   • Private chat with multimedia support"
echo "   • AI-powered scene generation"
echo "   • Fantasy exploration space"
echo "   • Educational position guides"
echo "   • Curated story library"
echo "   • Smart toy integration"
echo "   • AI companion for guidance"
echo "   • Mood tracking and analytics"
echo ""
echo "💝 Built with love for your intimate journey together."