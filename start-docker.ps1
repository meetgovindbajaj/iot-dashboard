# IoT Dashboard Docker Setup Script
# Run this script once Docker Desktop is fully running

Write-Host "IoT Dashboard Docker Setup" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Write-Host "Wait for Docker Desktop to show 'Docker Desktop is running' in system tray" -ForegroundColor Yellow
    exit 1
}

# Stop existing containers if any
Write-Host "`nStopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Build and start all services
Write-Host "`nBuilding and starting all services..." -ForegroundColor Yellow
Write-Host "This may take a few minutes for the first build..." -ForegroundColor Cyan

# Start MongoDB first
Write-Host "`nStarting MongoDB..." -ForegroundColor Yellow
docker-compose up -d mongodb

# Wait for MongoDB to be healthy
Write-Host "Waiting for MongoDB to be ready..." -ForegroundColor Cyan
$maxAttempts = 30
$attempts = 0
do {
    Start-Sleep -Seconds 2
    $attempts++
    $mongoStatus = docker-compose ps mongodb --format "{{.Health}}"
    Write-Host "MongoDB status: $mongoStatus (attempt $attempts/$maxAttempts)" -ForegroundColor Gray
} while ($mongoStatus -ne "healthy" -and $attempts -lt $maxAttempts)

if ($mongoStatus -eq "healthy") {
    Write-Host "✓ MongoDB is ready!" -ForegroundColor Green
    
    # Start backend
    Write-Host "`nStarting backend..." -ForegroundColor Yellow
    docker-compose up -d backend
    
    # Wait for backend to be healthy
    Write-Host "Waiting for backend to be ready..." -ForegroundColor Cyan
    $attempts = 0
    do {
        Start-Sleep -Seconds 3
        $attempts++
        $backendStatus = docker-compose ps backend --format "{{.Health}}"
        Write-Host "Backend status: $backendStatus (attempt $attempts/$maxAttempts)" -ForegroundColor Gray
    } while ($backendStatus -ne "healthy" -and $attempts -lt $maxAttempts)
    
    if ($backendStatus -eq "healthy") {
        Write-Host "✓ Backend is ready!" -ForegroundColor Green
        
        # Start frontend
        Write-Host "`nStarting frontend..." -ForegroundColor Yellow
        docker-compose up -d frontend
        
        Write-Host "`n🎉 IoT Dashboard is starting up!" -ForegroundColor Green
        Write-Host "`nServices:" -ForegroundColor White
        Write-Host "  📊 Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  🔧 Backend API: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "  🗄️  MongoDB: mongodb://localhost:27017" -ForegroundColor Cyan
        
        Write-Host "`nDemo credentials:" -ForegroundColor Yellow
        Write-Host "  Admin: admin@example.com / admin123" -ForegroundColor Gray
        Write-Host "  User: user@example.com / user123" -ForegroundColor Gray
        
        Write-Host "`nView logs with:" -ForegroundColor White
        Write-Host "  docker-compose logs -f" -ForegroundColor Gray
        
        Write-Host "`nStop services with:" -ForegroundColor White
        Write-Host "  docker-compose down" -ForegroundColor Gray
        
    } else {
        Write-Host "✗ Backend failed to start. Check logs with: docker-compose logs backend" -ForegroundColor Red
    }
} else {
    Write-Host "✗ MongoDB failed to start. Check logs with: docker-compose logs mongodb" -ForegroundColor Red
}

Write-Host "`nSetup complete!" -ForegroundColor Green
