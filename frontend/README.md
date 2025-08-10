# Frontend - Next.js IoT Dashboard

## 📖 Overview

This is the **frontend application** built with **Next.js 14** using the **App Router**. It provides a modern, responsive interface for IoT data visualization, user management, and real-time monitoring.

### 🎯 Why Next.js?

- **Server-Side Rendering (SSR)**: Improves SEO and initial page load performance
- **App Router**: Modern routing with layouts, loading states, and error boundaries
- **TypeScript Integration**: Built-in TypeScript support for type safety
- **Automatic Code Splitting**: Only loads the JavaScript needed for each page
- **Image Optimization**: Built-in image optimization for better performance

## 📁 Project Structure

```
frontend/src/
├── 📁 app/                     # Next.js App Router pages
│   ├── 📄 layout.tsx          # Root layout with common providers
│   ├── 📄 page.tsx            # Home page (redirects to dashboard)
│   ├── 📄 globals.css         # Global Tailwind CSS styles
│   ├── 📁 admin/              # Admin panel page
│   ├── 📁 dashboard/          # Main dashboard page
│   ├── 📁 login/              # Authentication page
│   └── 📁 register/           # User registration page
├── 📁 components/              # Reusable UI components
│   ├── 📁 Admin/              # Admin-specific components
│   ├── 📁 Charts/             # Data visualization components
│   ├── 📁 Dashboard/          # Dashboard-specific components
│   └── 📁 Layout/             # Layout components
├── 📁 contexts/                # React Context providers
│   ├── 📄 AuthContext.tsx     # Authentication state management
│   ├── 📄 ThemeContext.tsx    # Theme and preferences
│   └── 📄 WebSocketContext.tsx # Real-time data connection
├── 📁 hooks/                   # Custom React hooks
│   └── 📄 useSensorData.ts    # Sensor data fetching logic
├── 📁 types/                   # TypeScript type definitions
│   └── 📄 index.ts            # All application types
└── 📁 utils/                   # Utility functions
    ├── 📄 api.ts              # API client functions
    └── 📄 helpers.ts          # General helper functions
```

### 🏗️ Architecture Decisions

#### **1. App Router vs Pages Router**
- **Chosen**: App Router
- **Why**: 
  - Modern React patterns (Server Components, Suspense)
  - Better developer experience with layouts
  - Improved performance with automatic code splitting
  - Future-proof choice from Next.js team

#### **2. State Management Strategy**
- **Global State**: React Context for authentication, theme, WebSocket
- **Server State**: API calls with built-in Next.js features
- **Local State**: useState for component-specific data
- **Why**: Keeps the bundle size small while providing enough functionality

#### **3. Styling Approach**
- **Chosen**: Tailwind CSS
- **Why**:
  - Utility-first approach reduces CSS bundle size
  - Consistent design system
  - Excellent responsive design utilities
  - Easy to maintain and customize

## 🧩 Component Architecture

### **Component Categories**

1. **Page Components** (`app/*/page.tsx`)
   - Top-level route components
   - Handle data fetching and error states
   - Compose multiple smaller components

2. **Layout Components** (`components/Layout/`)
   - Provide consistent structure across pages
   - Handle navigation and common UI elements

3. **Feature Components** (`components/Admin/`, `components/Dashboard/`)
   - Domain-specific functionality
   - Business logic and data presentation

4. **UI Components** (`components/Charts/`)
   - Reusable, presentation-focused components
   - No business logic, only display data

### **Component Design Principles**

- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Build complex UIs by combining simple components
- **Props Interface**: Clear TypeScript interfaces for all props
- **Error Boundaries**: Graceful error handling at component level

## 🔌 API Integration

### **API Client Structure** (`utils/api.ts`)

```typescript
// Centralized API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Typed API functions
export const iotApi = {
  getSensors: () => Promise<ApiResponse<Sensor[]>>,
  updateSensor: (id: string, data: UpdateSensorData) => Promise<ApiResponse<Sensor>>,
  // ... more methods
};
```

**Why This Approach?**
- **Type Safety**: All API calls are typed with TypeScript
- **Centralization**: All API logic in one place for easy maintenance
- **Error Handling**: Consistent error handling across all requests
- **Environment Flexibility**: Easy to switch between development and production APIs

## 🎨 Styling System

### **Tailwind CSS Configuration**

The styling system is built with:
- **Utility Classes**: For rapid development and consistency
- **Custom Components**: For complex, reusable patterns
- **Responsive Design**: Mobile-first approach with breakpoint utilities

```css
/* Example: Responsive grid system */
.sensor-grid {
  @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}
```

### **Color System**
- **Primary**: Blue tones for main actions and branding
- **Success**: Green for positive states and confirmations
- **Warning**: Yellow/Orange for alerts and cautions
- **Error**: Red for errors and destructive actions
- **Neutral**: Gray scale for text and backgrounds

## 🔄 Real-Time Features

### **WebSocket Integration** (`contexts/WebSocketContext.tsx`)

```typescript
// Real-time data connection
const WebSocketProvider = ({ children }) => {
  const socket = useMemo(() => io(WS_URL), []);
  
  useEffect(() => {
    socket.on('sensor-data', handleSensorData);
    return () => socket.disconnect();
  }, []);
  
  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
```

**Features**:
- **Automatic Reconnection**: Handles connection drops gracefully
- **Event Typing**: TypeScript interfaces for all WebSocket events
- **Context Integration**: Easy access to real-time data across components

## 📱 Responsive Design

### **Breakpoint Strategy**

```css
/* Tailwind breakpoints used throughout the app */
sm: 640px   /* Small tablets and large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### **Mobile-First Approach**
- Base styles target mobile devices
- Progressive enhancement for larger screens
- Touch-friendly interfaces on mobile
- Optimized navigation for different screen sizes

## 🔧 Development Workflow

### **Getting Started**

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server:**
   ```bash
   yarn dev
   ```

4. **Access the application:**
   - Open http://localhost:3000

### **Available Scripts**

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn type-check   # Run TypeScript checks
```

### **Code Quality Tools**

- **ESLint**: Catches common JavaScript/TypeScript errors
- **Prettier**: Consistent code formatting
- **TypeScript**: Static type checking
- **Husky**: Git hooks for pre-commit checks

## 🧪 Testing Strategy

### **Testing Approach**
- **Unit Tests**: Individual component testing with Jest
- **Integration Tests**: API integration and user flows
- **E2E Tests**: Critical user journeys with Playwright

### **Testing Commands**
```bash
yarn test          # Run unit tests
yarn test:watch    # Run tests in watch mode
yarn test:coverage # Generate coverage report
```

## 🚀 Build & Deployment

### **Production Build**

```bash
# Build the application
yarn build

# Start production server
yarn start
```

### **Docker Deployment**

The frontend is containerized for consistent deployment:

```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS deps
# ... dependency installation

FROM node:18-alpine AS builder
# ... build process

FROM node:18-alpine AS runner
# ... production runtime
```

**Why Multi-Stage Build?**
- **Smaller Image Size**: Only production dependencies in final image
- **Security**: No build tools in production image
- **Performance**: Optimized for runtime performance

## 🔐 Security Considerations

### **Authentication**
- **JWT Tokens**: Stored in HTTP-only cookies (when possible)
- **Auto Logout**: Sessions expire automatically
- **Route Protection**: Private routes check authentication status

### **API Security**
- **CORS Configuration**: Properly configured for production
- **Request Validation**: Client-side validation with server-side verification
- **Error Handling**: No sensitive information in error messages

## 📊 Performance Optimizations

### **Next.js Optimizations**
- **Automatic Code Splitting**: Pages load only required JavaScript
- **Image Optimization**: Built-in image optimization and lazy loading
- **Bundle Analysis**: Regular bundle size monitoring

### **React Optimizations**
- **useMemo/useCallback**: Prevent unnecessary re-renders
- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: For large data lists

### **Network Optimizations**
- **API Response Caching**: Intelligent caching for static data
- **WebSocket Connection Pooling**: Efficient real-time connections
- **Compression**: Gzip compression for all static assets

## 🐛 Common Issues & Solutions

### **Development Issues**

1. **Environment Variables Not Loading**
   ```bash
   # Ensure .env.local exists and has correct format
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. **API Connection Errors**
   ```bash
   # Check if backend is running
   curl http://localhost:3001/health
   ```

3. **TypeScript Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   yarn dev
   ```

### **Production Issues**

1. **Build Failures**
   - Check TypeScript errors: `yarn type-check`
   - Verify all environment variables are set
   - Ensure all dependencies are installed

2. **Performance Issues**
   - Analyze bundle size: `yarn build && yarn analyze`
   - Check for large images or assets
   - Review unnecessary re-renders with React DevTools

## 📈 Monitoring & Analytics

### **Performance Monitoring**
- **Core Web Vitals**: Built-in Next.js performance monitoring
- **Bundle Analysis**: Regular bundle size tracking
- **Error Tracking**: Client-side error reporting

### **User Analytics**
- **Page Views**: Track popular features and pages
- **User Interactions**: Monitor button clicks and form submissions
- **Performance Metrics**: Track load times and user experience

---

*This frontend provides a modern, performant, and maintainable foundation for IoT data visualization and management.*
