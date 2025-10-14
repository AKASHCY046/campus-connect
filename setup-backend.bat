@echo off
echo 🚀 Setting up Campus Connect Backend...

REM Create backend directory
if not exist backend mkdir backend
cd backend

REM Copy package.json for backend
copy ..\package-server.json package.json

REM Install backend dependencies
echo 📦 Installing backend dependencies...
npm install

REM Create .env file for backend
echo 🔧 Creating environment configuration...
(
echo PORT=3000
echo MONGODB_URI=mongodb://localhost:27017/campus-connect
echo NODE_ENV=development
) > .env

echo ✅ Backend setup complete!
echo.
echo To start the backend server:
echo   cd backend ^&^& npm run dev
echo.
echo To start the frontend:
echo   npm run dev
echo.
echo Make sure MongoDB is running on your system!
pause
