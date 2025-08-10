# Contexts - Global State Management

## 📖 Overview

This folder contains **React Context providers** that manage global application state. Contexts are used for data that needs to be accessed by many components across the application tree.

### 🎯 Why React Context?

**Instead of prop drilling** (passing props through many component levels), contexts provide:
- **Global Access**: Any component can access context data
- **Performance**: Only components that use context re-render when it changes
- **Clean Code**: No need to pass props through intermediate components
- **Type Safety**: TypeScript ensures context usage is correct

## 📁 Context Structure

```
contexts/
├── 📄 AuthContext.tsx          # Authentication and user management
├── 📄 ThemeContext.tsx         # Theme preferences and UI settings
└── 📄 WebSocketContext.tsx     # Real-time WebSocket connection
```

## 🔐 AuthContext - User Authentication

**File**: `AuthContext.tsx`

### **Purpose**
Manages user authentication state, login/logout functionality, and user permissions across the entire application.

### **What It Provides**
```typescript
interface AuthContextType {
  user: User | null;              // Current logged-in user
  loading: boolean;               // Authentication loading state
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
}
```

### **Why This Design?**

1. **Centralized Auth Logic**: All authentication logic in one place
2. **Automatic Token Management**: Handles JWT tokens automatically
3. **Persistent Sessions**: Remembers user across browser sessions
4. **Type Safety**: TypeScript ensures correct usage everywhere

### **How It Works**

```typescript
// Provider wraps the entire app
function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}

// Any component can access auth state
function Dashboard() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <LoginPrompt />;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### **Key Features**

- **Auto Login**: Checks for saved tokens on app startup
- **Route Protection**: Redirects to login if not authenticated
- **Role-Based Access**: Different permissions for admin vs regular users
- **Error Handling**: Graceful handling of authentication errors

### **Token Storage Strategy**
```typescript
// Secure token storage
const saveToken = (token: string) => {
  // In production, consider httpOnly cookies for better security
  localStorage.setItem('auth_token', token);
};

const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};
```

**Why localStorage?**
- **Persistence**: Tokens survive browser restarts
- **Simplicity**: Easy to implement and debug
- **Client-Side**: No server-side session management needed

**Security Note**: In production, consider HTTP-only cookies for enhanced security.

## 🎨 ThemeContext - UI Preferences

**File**: `ThemeContext.tsx`

### **Purpose**
Manages user interface preferences like dark/light mode, language settings, and layout preferences.

### **What It Provides**
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';        // Current theme
  setTheme: (theme: string) => void;
  language: string;               // Current language
  setLanguage: (lang: string) => void;
  preferences: UserPreferences;   // Other UI preferences
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}
```

### **Why Separate Theme Context?**

1. **Performance**: Theme changes don't need to re-render auth-related components
2. **Persistence**: Theme preferences saved to localStorage
3. **System Integration**: Can detect system dark/light mode preference
4. **Customization**: Easy to add more UI preferences

### **How It Works**

```typescript
// Automatic theme detection
const getInitialTheme = (): string => {
  // Check saved preference first
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
};

// Apply theme to document
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}, [theme]);
```

### **CSS Integration**
```css
/* Tailwind CSS dark mode classes */
.light-mode {
  @apply bg-white text-gray-900;
}

.dark-mode {
  @apply bg-gray-900 text-white;
}
```

## 🔄 WebSocketContext - Real-Time Data

**File**: `WebSocketContext.tsx`

### **Purpose**
Manages the WebSocket connection for real-time sensor data updates and live notifications.

### **What It Provides**
```typescript
interface WebSocketContextType {
  socket: Socket | null;          // Socket.io connection
  isConnected: boolean;           // Connection status
  sensorData: SensorData[];       // Latest sensor readings
  subscribe: (sensorId: string) => void;
  unsubscribe: (sensorId: string) => void;
  sendMessage: (event: string, data: any) => void;
}
```

### **Why WebSocket Context?**

1. **Real-Time Updates**: Instant sensor data without polling
2. **Efficient**: One connection shared across all components
3. **Automatic Reconnection**: Handles connection drops gracefully
4. **Event Management**: Centralized WebSocket event handling

### **How It Works**

```typescript
// Initialize WebSocket connection
const socket = useMemo(() => {
  const newSocket = io(WS_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });
  
  return newSocket;
}, []);

// Handle incoming sensor data
useEffect(() => {
  socket.on('sensor-data', (data: SensorData) => {
    setSensorData(prev => updateSensorData(prev, data));
  });
  
  socket.on('connect', () => {
    setIsConnected(true);
    console.log('✅ WebSocket connected');
  });
  
  socket.on('disconnect', () => {
    setIsConnected(false);
    console.log('❌ WebSocket disconnected');
  });
  
  return () => {
    socket.off('sensor-data');
    socket.off('connect');
    socket.off('disconnect');
  };
}, [socket]);
```

### **Data Management**
```typescript
// Efficient sensor data updates
const updateSensorData = (
  prevData: SensorData[], 
  newData: SensorData
): SensorData[] => {
  // Replace existing sensor data or add new
  const existingIndex = prevData.findIndex(
    item => item.sensorId === newData.sensorId
  );
  
  if (existingIndex >= 0) {
    const updated = [...prevData];
    updated[existingIndex] = newData;
    return updated;
  }
  
  return [...prevData, newData];
};
```

**Why This Approach?**
- **Immutability**: Never mutate existing state
- **Performance**: Only update what changed
- **Predictability**: State changes are easy to track

## 🏗️ Context Provider Setup

### **Root Layout Integration**
```typescript
// app/layout.tsx
export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <WebSocketProvider>
              {children}
            </WebSocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### **Provider Order Matters**
1. **AuthProvider** - First, because other providers might need user data
2. **ThemeProvider** - Second, UI preferences available to all components
3. **WebSocketProvider** - Last, might need user auth for connection

## 🎯 Best Practices

### **1. Custom Hooks for Context Access**
```typescript
// Don't use context directly
const authContext = useContext(AuthContext);

// Do use custom hooks
const { user, login, logout } = useAuth();
```

**Why Custom Hooks?**
- **Type Safety**: Ensures context is used correctly
- **Error Prevention**: Throws helpful errors if used outside provider
- **Better DX**: Cleaner, more intuitive API

### **2. Context Value Optimization**
```typescript
// Avoid: New object on every render
const value = {
  user,
  login,
  logout
};

// Better: Memoize the context value
const value = useMemo(() => ({
  user,
  login,
  logout
}), [user]);
```

### **3. Split Large Contexts**
```typescript
// Avoid: One massive context
interface AppContextType {
  user: User;
  theme: string;
  sensorData: SensorData[];
  notifications: Notification[];
  settings: Settings;
  // ... many more properties
}

// Better: Multiple focused contexts
// AuthContext, ThemeContext, WebSocketContext, etc.
```

## 🔧 Performance Considerations

### **Context Splitting Strategy**

**Why Multiple Contexts?**
- **Reduced Re-renders**: Components only re-render when relevant context changes
- **Code Organization**: Each context has a single responsibility
- **Bundle Splitting**: Contexts can be lazy-loaded if needed

### **Memoization Pattern**
```typescript
function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  
  // Memoize expensive operations
  const permissions = useMemo(() => {
    return user ? calculatePermissions(user.role) : [];
  }, [user?.role]);
  
  // Memoize context value
  const value = useMemo(() => ({
    user,
    permissions,
    login,
    logout
  }), [user, permissions]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 🧪 Testing Contexts

### **Provider Testing**
```typescript
// Test utility for context providers
function renderWithAuth(ui: React.ReactElement, authState?: Partial<AuthState>) {
  const mockAuthValue = {
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    ...authState
  };
  
  return render(
    <AuthContext.Provider value={mockAuthValue}>
      {ui}
    </AuthContext.Provider>
  );
}

// Usage in tests
test('shows login button when not authenticated', () => {
  renderWithAuth(<Dashboard />, { user: null });
  expect(screen.getByText('Login')).toBeInTheDocument();
});
```

## 🐛 Common Issues & Solutions

### **1. Context Used Outside Provider**
```typescript
// Add helpful error messages
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
```

### **2. Stale Closures in Effects**
```typescript
// Problem: Stale context values in useEffect
useEffect(() => {
  if (user) {
    fetchUserData(user.id);  // Might use stale user
  }
}, []); // Empty dependency array

// Solution: Include context values in dependencies
useEffect(() => {
  if (user) {
    fetchUserData(user.id);
  }
}, [user]); // user in dependencies
```

### **3. Unnecessary Re-renders**
```typescript
// Problem: New functions on every render
const login = (email: string, password: string) => {
  // login logic
};

// Solution: Use useCallback
const login = useCallback((email: string, password: string) => {
  // login logic
}, []);
```

## 📚 Context Documentation Standards

Each context file includes:

```typescript
/**
 * AuthContext provides authentication state and methods throughout the app
 * 
 * Features:
 * - JWT token management
 * - Automatic login/logout
 * - Role-based permissions
 * - Persistent sessions
 * 
 * @example
 * function MyComponent() {
 *   const { user, login, logout } = useAuth();
 *   // Component logic
 * }
 */
```

---

*This context system provides a clean, performant way to manage global state while maintaining type safety and developer experience.*
