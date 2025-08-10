# IoT Dashboard - Production-Ready Full-Stack Application

## 📖 Project Overview

This is a **production-ready IoT Dashboard** built with **Next.js**, **NestJS**, and **MongoDB**. It provides real-time monitoring, user management, and sensor configuration capabilities for IoT devices.

### 🏗️ Architecture & Design Decisions

**Why This Architecture?**
- **Frontend (Next.js)**: Provides server-side rendering, excellent developer experience, and optimized performance
- **Backend (NestJS)**: Offers enterprise-grade structure with decorators, dependency injection, and TypeScript support
- **MongoDB**: NoSQL database perfect for IoT data with flexible schema and high write throughput
- **Docker**: Ensures consistent development and deployment environments

## 📁 Project Structure

```
iot-dashboard-v2/
├── 📁 frontend/                 # Next.js React application
│   ├── 📁 src/
│   │   ├── 📁 app/             # Next.js App Router pages
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 contexts/        # React Context providers
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 types/           # TypeScript type definitions
│   │   └── 📁 utils/           # Utility functions and API clients
│   └── 📄 README.md           # Frontend documentation
├── 📁 backend/                  # NestJS API server
│   ├── 📁 src/
│   │   ├── 📁 auth/           # Authentication & authorization
│   │   ├── 📁 iot/            # IoT sensor management
│   │   ├── 📁 users/          # User management
│   │   └── 📁 websocket/      # Real-time WebSocket communication
│   └── 📄 README.md           # Backend documentation
├── 📄 docker-compose.yml      # Multi-container Docker setup
├── 📄 mongodb-init.js         # Database initialization script
└── 📄 README.md              # This file
```

### 🎯 Why This Structure?

1. **Separation of Concerns**: Frontend and backend are clearly separated, allowing independent scaling and deployment
2. **Feature-Based Organization**: Each folder represents a specific domain (auth, iot, users)
3. **Reusability**: Components, hooks, and utilities are abstracted for maximum reuse
4. **Maintainability**: Clear naming conventions and logical grouping make the codebase easy to navigate

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **Node.js 18+** and **Yarn** (for local development)
- **MongoDB 7+** (if running without Docker)

### 🐳 Docker Setup (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd iot-dashboard-v2
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **GraphQL Playground**: http://localhost:3001/graphql

### 🛠️ Local Development Setup

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend && yarn install
   
   # Frontend
   cd ../frontend && yarn install
   ```

2. **Start services:**
   ```bash
   # Terminal 1 - Backend
   cd backend && yarn start:dev
   
   # Terminal 2 - Frontend
   cd frontend && yarn dev
   
   # Terminal 3 - MongoDB (if not using Docker)
   mongod
   ```

## 🔧 Key Features

### ✅ **User Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, User)
- Secure password hashing
- Session management

### ✅ **Real-Time IoT Monitoring**
- Live sensor data visualization
- WebSocket-based real-time updates
- Historical data analysis
- Alert threshold monitoring

### ✅ **Admin Panel**
- User management (roles, status)
- Sensor configuration (CRUD operations)
- System monitoring
- Mobile-responsive design

### ✅ **Data Visualization**
- Interactive charts with Recharts
- Time-series data display
- Custom tooltips with proper date formatting
- Responsive design for all screen sizes

## 🏗️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Declarative charts for React
- **React Hook Form** - Performant forms with easy validation
- **React Hot Toast** - Beautiful notifications

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Full type safety
- **MongoDB & Mongoose** - NoSQL database with object modeling
- **JWT** - JSON Web Token authentication
- **Socket.IO** - Real-time bidirectional communication
- **GraphQL** - Query language for APIs

### DevOps & Infrastructure
- **Docker & Docker Compose** - Containerization
- **ESLint & Prettier** - Code quality and formatting
- **Jest** - Testing framework

## 🔐 Environment Variables

Create `.env.local` files in both frontend and backend directories:

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

**Backend (.env):**
```env
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb://localhost:27017/iot-dashboard
PORT=3001
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Kill processes on ports
   npx kill-port 3000 3001 27017
   ```

2. **Docker containers not starting:**
   ```bash
   # Clean up and rebuild
   docker-compose down -v
   docker-compose up --build
   ```

3. **Frontend not connecting to backend:**
   - Check environment variables
   - Ensure backend is running on correct port
   - Verify CORS settings

## 📚 Documentation Structure

Each folder contains its own `README.md` with detailed explanations:

- **`/frontend/README.md`** - Frontend architecture, components, and development guide
- **`/backend/README.md`** - Backend architecture, APIs, and database schema
- **`/frontend/src/components/README.md`** - Component library documentation
- **`/frontend/src/hooks/README.md`** - Custom hooks documentation
- **`/backend/src/auth/README.md`** - Authentication system documentation
- **`/backend/src/iot/README.md`** - IoT functionality documentation

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Write clean, documented code** following the project structure
4. **Add README.md** for any new folders or major features
5. **Test thoroughly** (unit tests, integration tests)
6. **Update Docker configuration** if needed
7. **Submit a pull request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Create GitHub issues for bugs or feature requests
- **Documentation**: Check folder-specific README.md files
- **Architecture**: Review this file for overall project structure

---

*Built with ❤️ for the IoT community*
