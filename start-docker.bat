@echo off
echo IoT Dashboard Docker Setup
echo =========================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and wait for it to be ready.
    echo Look for "Docker Desktop is running" in your system tray.
    pause
    exit /b 1
)

echo [OK] Docker is running!
echo.

echo Stopping existing containers...
docker-compose down

echo.
echo Building and starting all services...
echo This may take a few minutes for the first build...
echo.

REM Start MongoDB first
echo Starting MongoDB...
docker-compose up -d mongodb

echo Waiting for MongoDB to be ready...
timeout /t 10 /nobreak >nul

REM Start backend
echo Starting backend...
docker-compose up -d backend

echo Waiting for backend to be ready...
timeout /t 15 /nobreak >nul

REM Start frontend
echo Starting frontend...
docker-compose up -d frontend

echo.
echo ================================
echo   IoT Dashboard is ready!
echo ================================
echo.
echo Services:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   MongoDB:  mongodb://localhost:27017
echo.
echo Demo credentials:
echo   Admin: admin@example.com / admin123
echo   User:  user@example.com / user123
echo.
echo View logs: docker-compose logs -f
echo Stop all:  docker-compose down
echo.
pause
