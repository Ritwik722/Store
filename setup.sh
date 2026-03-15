#!/bin/bash

# Anshita General Store - Setup Script

echo "🏪 Anshita General Store - Full Stack Setup"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd backend || exit
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the server, run:"
echo "   npm start"
echo ""
echo "📱 Then open http://localhost:3000 in your browser"
echo ""
echo "🌱 To seed sample data, run:"
echo "   npm run seed"
echo ""
