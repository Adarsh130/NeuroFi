@echo off
echo ========================================
echo    NeuroFi - AI Trading Platform
echo ========================================
echo.

REM Kill any existing processes on common ports
echo 🔄 Cleaning up existing processes...
for %%p in (3000 5000 5173 8000) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p 2^>nul') do (
        if not "%%a"=="" (
            if not "%%a"=="0" (
                taskkill /PID %%a /F >nul 2>&1
            )
        )
    )
)

echo ✅ Cleanup completed
echo.

REM Check Node.js
echo 🔄 Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check MongoDB (optional - app will work without it initially)
echo 🔄 Checking MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ MongoDB not found - install from https://www.mongodb.com/try/download/community
    echo 💡 App will start but database features will be limited
) else (
    echo ✅ MongoDB found
    REM Try to start MongoDB service
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo 💡 Starting MongoDB manually...
        if not exist "C:\data\db" mkdir "C:\data\db" >nul 2>&1
        start "MongoDB" cmd /k "mongod --dbpath C:\data\db"
        timeout /t 5 /nobreak >nul
    )
)

echo.
echo 📦 Installing dependencies...

REM Install frontend dependencies
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

REM Install backend dependencies
if not exist "backend\api\node_modules" (
    echo Installing backend dependencies...
    cd backend\api
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..\..
)

echo ✅ Dependencies ready

echo.
echo 🚀 Starting NeuroFi...

REM Start backend
echo 📡 Starting backend server...
cd backend\api
start "NeuroFi Backend" cmd /k "npm run dev"
cd ..\..

REM Wait for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend...
start "NeuroFi Frontend" cmd /k "npm run dev"

REM Wait for frontend to start
echo ⏳ Waiting for frontend to initialize...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo    NeuroFi Started Successfully! 🚀
echo ========================================
echo.
echo 🌐 Application URLs:
echo   Frontend:     http://localhost:5173
echo   Backend API:  http://localhost:5000
echo   Health Check: http://localhost:5000/health
echo.
echo 🗄️ Database:
echo   MongoDB URI:  mongodb://localhost:27017/neurofi
echo   (Install MongoDB for full functionality)
echo.
echo 🎯 Features:
echo   ✅ Real cryptocurrency data from Binance API
echo   ✅ Virtual trading wallet ($10,000 starting balance)
echo   ✅ User authentication and registration
echo   ✅ Portfolio management and tracking
echo   ✅ AI price predictions and recommendations
echo.
echo 🔐 Getting Started:
echo   1. Open http://localhost:5173 in your browser
echo   2. Register a new account
echo   3. Start trading with virtual money!
echo.

REM Open browser
echo 🌐 Opening application...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo 📝 Notes:
echo   - Both backend and frontend run in separate windows
echo   - Close all windows to stop the application
echo   - Install MongoDB for database persistence
echo.
pause