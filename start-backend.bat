@echo off
echo 🚀 Starting Campus Connect Backend...

REM Check if backend directory exists
if not exist backend (
    echo ❌ Backend directory not found. Please run setup-backend.bat first.
    pause
    exit /b 1
)

REM Check if node_modules exists in backend
if not exist backend\node_modules (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

REM Start the backend server
echo 🖥️ Starting backend server on port 3000...
cd backend
start "Campus Connect Backend" cmd /k "npm run dev"

echo ✅ Backend server starting...
echo 🌐 Backend will be available at: http://localhost:3000
echo 📊 API endpoints will be available at: http://localhost:3000/api
echo.
echo Press any key to continue...
pause > nul
