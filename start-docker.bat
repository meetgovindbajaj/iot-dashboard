@echo off
echo ========================================
echo IoT Dashboard - Docker Startup Script
echo ========================================
echo.

REM Check if Docker is running
echo [1/5] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and wait for it to be ready.
    echo Then run this script again.
    pause
    exit /b 1
)
echo ✓ Docker is running

REM Create environment file if it doesn't exist
echo [2/5] Checking environment configuration...
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env >nul
    echo ✓ Environment file created
    echo WARNING: Please review and update .env with your settings
) else (
    echo ✓ Environment file exists
)

REM Create data directories
echo [3/5] Creating data directories...
if not exist "docker\data\mongodb" mkdir "docker\data\mongodb"
if not exist "docker\data\uploads" mkdir "docker\data\uploads"
echo ✓ Data directories ready

REM Pull latest images
echo [4/5] Pulling latest Docker images...
docker-compose pull

REM Stop any existing containers
echo Stopping existing containers...
docker-compose down

REM Start services with dependency management
echo [5/5] Starting IoT Dashboard services...
echo.
echo Starting MongoDB...
docker-compose up -d mongodb

echo Waiting for MongoDB to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

echo Starting Backend API...
docker-compose up -d backend

echo Waiting for Backend to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

echo Starting Frontend...
docker-compose up -d frontend

echo.
echo ========================================
echo 🚀 IoT Dashboard is starting up!
echo ========================================
echo.
echo Services Status:
docker-compose ps
echo.
echo Application URLs:
echo 🌐 Frontend:    http://localhost:3000
echo 🔗 Backend API: http://localhost:3001
echo 📊 API Docs:    http://localhost:3001/api
echo.
echo 📝 Default Login:
echo    Email:    admin@example.com
echo    Password: admin123
echo.
echo ⚠️  IMPORTANT: Change default passwords before production use!
echo.
echo To stop the application: docker-compose down
echo To view logs: docker-compose logs -f
echo.
echo Waiting for services to be fully ready...
timeout /t 30 /nobreak >nul

REM Health check
echo Checking service health...
echo Testing frontend...
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { $null = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5; Write-Host '✓ Frontend is responding' -ForegroundColor Green } catch { Write-Host '⚠️ Frontend might still be starting up' -ForegroundColor Yellow } }"

echo Testing backend...
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { $null = Invoke-WebRequest -Uri 'http://localhost:3001/auth/login' -Method POST -ContentType 'application/json' -Body '{}' -UseBasicParsing -TimeoutSec 5 } catch { if ($_.Exception.Response.StatusCode -eq 'BadRequest') { Write-Host '✓ Backend is responding' -ForegroundColor Green } else { Write-Host '⚠️ Backend might still be starting up' -ForegroundColor Yellow } } }"

echo.
echo 🎉 Setup complete! You can now access the IoT Dashboard.
echo.
pause
