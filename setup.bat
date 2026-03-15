@echo off
REM Anshita General Store - Setup Script for Windows

echo.
echo 🏪 Anshita General Store - Full Stack Setup
echo ==========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
cd backend
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Setup completed successfully!
echo.
echo 🚀 To start the server, run:
echo    npm start
echo.
echo 📱 Then open http://localhost:3000 in your browser
echo.
echo 🌱 To seed sample data, run:
echo    npm run seed
echo.
pause
