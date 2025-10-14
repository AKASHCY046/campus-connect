#!/bin/bash

echo "🚀 Setting up Campus Connect Backend..."

# Create backend directory
mkdir -p backend
cd backend

# Initialize package.json for backend
cp ../package-server.json package.json

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Create .env file for backend
echo "🔧 Creating environment configuration..."
cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/campus-connect
NODE_ENV=development
EOF

echo "✅ Backend setup complete!"
echo ""
echo "To start the backend server:"
echo "  cd backend && npm run dev"
echo ""
echo "To start the frontend:"
echo "  npm run dev"
echo ""
echo "Make sure MongoDB is running on your system!"
