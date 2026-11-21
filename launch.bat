@echo off
setlocal
title ORION Launcher
cd /d "%~dp0"

echo =====================================================
echo           ORION Management System Launcher
echo =====================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Verify npm is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm was not found in your PATH.
    echo.
    pause
    exit /b 1
)

:: 3. Check and install dependencies if node_modules is missing
if not exist "node_modules" (
    echo [INFO] Dependencies not found. Installing node packages...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
    echo.
)

:: 4. Check if port 3000 is already active
netstat -ano | findstr /R /C:":3000 " >nul 2>nul
if not errorlevel 1 (
    echo [WARNING] Port 3000 appears to be already in use.
    echo Opening browser to http://localhost:3000 ...
    start "" "http://localhost:3000"
    ping 127.0.0.1 -n 3 >nul
    exit /b 0
)

:: 5. Launch the backend and frontend server in a dedicated window
echo [INFO] Starting ORION server...
start "ORION Server Console" cmd /k "cd /d ""%~dp0"" && npm start"

:: 6. Wait briefly for server initialization (3 seconds)
echo [INFO] Waiting for server to initialize...
ping 127.0.0.1 -n 4 >nul

:: 7. Launch the frontend in the user's default browser
echo [OK] Launching browser at http://localhost:3000 ...
start "" "http://localhost:3000"

echo.
echo =====================================================
echo  ORION is now running!
echo  - Backend API: http://localhost:3000/api/v1
echo  - Frontend UI: http://localhost:3000/
echo.
echo  Keep the "ORION Server Console" window open.
echo  Closing this launcher will not stop the server.
echo =====================================================
echo.
ping 127.0.0.1 -n 4 >nul
exit /b 0
