# IoT Dashboard Docker Setup Instructions

## Prerequisites

✅ Docker Desktop is installed
⏳ Docker Desktop needs to be fully running

## Step 1: Start Docker Desktop

1. Look for Docker Desktop in your Start menu and launch it
2. Wait for Docker Desktop to show "Docker Desktop is running" in your system tray
3. This usually takes 2-5 minutes after installation

## Step 2: Verify Docker is Ready

Open PowerShell/Command Prompt and run:

```bash
docker --version
docker ps
```

Both commands should work without errors.

## Step 3: Start IoT Dashboard

Once Docker is ready, you have two options:

### Option A: Use the automated script (Recommended)

Double-click on `start-docker.bat` in this folder, or run:

```bash
.\start-docker.bat
```

### Option B: Manual setup

```bash
# Start MongoDB first
docker-compose up -d mongodb

# Wait 30 seconds for MongoDB to initialize
# Then start backend
docker-compose up -d backend

# Wait 30 seconds for backend to be ready
# Then start frontend
docker-compose up -d frontend
```

## Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB**: mongodb://localhost:27017

## Demo Credentials

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## Useful Commands

```bash
# View all services status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart all services
docker-compose restart
```

## Troubleshooting

If you get "Docker is not running" errors:

1. Make sure Docker Desktop is open and running
2. Look for the whale icon in your system tray
3. If Docker Desktop shows errors, try restarting it
4. Some systems may require a restart after Docker installation

## What Each Service Does

- **MongoDB**: Database for storing sensor data and user information
- **Backend**: NestJS API server with authentication and real-time data
- **Frontend**: Next.js web application with dashboard and charts

The complete setup includes:

- User authentication (JWT)
- Real-time sensor data via WebSocket
- Data visualization with charts
- Responsive design with dark/light themes
