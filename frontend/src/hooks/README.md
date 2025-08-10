# Hooks - Custom React Logic

## 📖 Overview

This folder contains **custom React hooks** that encapsulate reusable logic for data fetching, state management, and side effects. Custom hooks follow the "use" naming convention and help keep components clean and focused.

### 🎯 Why Custom Hooks?

1. **Reusability**: Same logic can be used across multiple components
2. **Separation of Concerns**: Components focus on UI, hooks handle logic
3. **Testability**: Business logic can be tested independently
4. **Clean Components**: Reduces component complexity and makes them easier to read

## 📁 Hook Structure

```
hooks/
└── 📄 useSensorData.ts         # Sensor data fetching and management
```

## 📊 useSensorData - Sensor Data Management

**File**: `useSensorData.ts`

### **Purpose**
Manages fetching, caching, and real-time updates for sensor data. This hook encapsulates all the complex logic needed to work with IoT sensor information.

### **What It Provides**
```typescript
interface UseSensorDataReturn {
  // Data states
  sensors: Sensor[];              // All available sensors
  sensorData: SensorData[];       // Latest sensor readings
  historicalData: SensorData[];   // Historical data for charts
  
  // Loading states
  loading: boolean;               // Initial data loading
  refreshing: boolean;            // Data refresh in progress
  
  // Error states
  error: string | null;           // Error message if any
  
  // Actions
  refreshData: () => Promise<void>;
  fetchSensorHistory: (sensorId: string, timeRange: TimeRange) => Promise<void>;
  clearError: () => void;
}
```

### **Why This Hook Design?**

1. **Single Responsibility**: Only handles sensor data concerns
2. **Real-time Integration**: Automatically subscribes to WebSocket updates
3. **Error Handling**: Centralized error management for all sensor operations
4. **Caching**: Intelligent caching to avoid unnecessary API calls
5. **Type Safety**: Full TypeScript support for all data operations

### **How It Works**

```typescript
export function useSensorData(sensorId?: string) {
  // State management
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // WebSocket integration for real-time updates
  const { socket, isConnected } = useWebSocket();
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [sensorsResponse, dataResponse] = await Promise.all([
          iotApi.getSensors(),
          iotApi.getLatestSensorData()
        ]);
        
        setSensors(sensorsResponse.data);
        setSensorData(dataResponse.data);
      } catch (err) {
        setError('Failed to load sensor data');
        console.error('Sensor data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    const handleSensorUpdate = (newData: SensorData) => {
      setSensorData(prev => updateSensorReading(prev, newData));
    };
    
    // Subscribe to specific sensor or all sensors
    if (sensorId) {
      socket.on(`sensor-${sensorId}`, handleSensorUpdate);
    } else {
      socket.on('sensor-data', handleSensorUpdate);
    }
    
    return () => {
      if (sensorId) {
        socket.off(`sensor-${sensorId}`, handleSensorUpdate);
      } else {
        socket.off('sensor-data', handleSensorUpdate);
      }
    };
  }, [socket, isConnected, sensorId]);
  
  return {
    sensors,
    sensorData,
    loading,
    error,
    refreshData,
    fetchSensorHistory,
    clearError
  };
}
```

### **Data Update Strategy**

```typescript
// Efficient sensor data updates
const updateSensorReading = (
  prevData: SensorData[], 
  newReading: SensorData
): SensorData[] => {
  const existingIndex = prevData.findIndex(
    item => item.sensorId === newReading.sensorId
  );
  
  if (existingIndex >= 0) {
    // Update existing sensor reading
    const updated = [...prevData];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...newReading,
      lastUpdated: new Date().toISOString()
    };
    return updated;
  }
  
  // Add new sensor reading
  return [...prevData, { ...newReading, lastUpdated: new Date().toISOString() }];
};
```

**Why This Approach?**
- **Immutability**: Never mutate existing state arrays
- **Performance**: Only updates changed data, not entire array
- **Consistency**: All updates follow the same pattern

## 🎯 Hook Usage Examples

### **Basic Usage in Component**
```typescript
function Dashboard() {
  const {
    sensors,
    sensorData,
    loading,
    error,
    refreshData
  } = useSensorData();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={refreshData}
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sensors.map(sensor => {
        const currentData = sensorData.find(d => d.sensorId === sensor.id);
        return (
          <SensorCard 
            key={sensor.id}
            sensor={sensor}
            data={currentData}
          />
        );
      })}
    </div>
  );
}
```

### **Single Sensor Usage**
```typescript
function SensorDetailPage({ sensorId }: Props) {
  const {
    sensors,
    sensorData,
    historicalData,
    loading,
    fetchSensorHistory
  } = useSensorData(sensorId);  // Focus on specific sensor
  
  const sensor = sensors.find(s => s.id === sensorId);
  const currentData = sensorData.find(d => d.sensorId === sensorId);
  
  // Load historical data for charts
  useEffect(() => {
    fetchSensorHistory(sensorId, { hours: 24 });
  }, [sensorId, fetchSensorHistory]);
  
  return (
    <div>
      <SensorHeader sensor={sensor} currentData={currentData} />
      <SensorChart data={historicalData} />
    </div>
  );
}
```

### **With Error Handling**
```typescript
function SensorMonitor() {
  const {
    sensorData,
    error,
    clearError,
    refreshData
  } = useSensorData();
  
  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error, {
        action: {
          label: 'Retry',
          onClick: () => {
            clearError();
            refreshData();
          }
        }
      });
    }
  }, [error, clearError, refreshData]);
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

## 🔧 Hook Design Patterns

### **1. Return Object Pattern**
```typescript
// Good: Return an object with named properties
return {
  data,
  loading,
  error,
  refresh
};

// Avoid: Return array (harder to use)
return [data, loading, error, refresh];
```

**Why Object Return?**
- **Selective Usage**: Use only what you need
- **Clear Names**: No confusion about what each value represents
- **Extensible**: Easy to add new return values

### **2. Loading State Management**
```typescript
function useSensorData() {
  const [loading, setLoading] = useState(true);     // Initial load
  const [refreshing, setRefreshing] = useState(false); // Subsequent refreshes
  
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Fetch data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
}
```

**Why Multiple Loading States?**
- **Better UX**: Show different UI for initial load vs refresh
- **User Feedback**: Users know when data is being updated
- **Prevent Duplicate Requests**: Disable actions during loading

### **3. Error Boundary Integration**
```typescript
function useSensorData() {
  const [error, setError] = useState<string | null>(null);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const handleError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    setError(message);
    
    // Log error for debugging
    console.error('Sensor data error:', err);
  }, []);
  
  return { error, clearError };
}
```

## 🔄 Caching Strategy

### **Memory Caching**
```typescript
// Cache to avoid redundant API calls
const cache = new Map<string, { data: any; timestamp: number }>();

function useSensorData() {
  const getCachedData = useCallback((key: string): any | null => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    // Check if cache is still valid (5 minutes)
    const isValid = Date.now() - cached.timestamp < 5 * 60 * 1000;
    return isValid ? cached.data : null;
  }, []);
  
  const setCachedData = useCallback((key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  }, []);
}
```

### **WebSocket Data Freshness**
```typescript
// Prefer WebSocket data over cached data
useEffect(() => {
  if (socket && isConnected) {
    // Clear cache when WebSocket connects
    // Real-time data is more accurate
    cache.clear();
  }
}, [socket, isConnected]);
```

## 🧪 Testing Custom Hooks

### **Hook Testing with React Testing Library**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useSensorData } from './useSensorData';

// Mock API responses
jest.mock('@/utils/api', () => ({
  iotApi: {
    getSensors: jest.fn(),
    getLatestSensorData: jest.fn()
  }
}));

describe('useSensorData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('loads sensor data on mount', async () => {
    // Mock successful API response
    const mockSensors = [{ id: '1', name: 'Temperature' }];
    iotApi.getSensors.mockResolvedValue({ data: mockSensors });
    iotApi.getLatestSensorData.mockResolvedValue({ data: [] });
    
    const { result } = renderHook(() => useSensorData());
    
    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.sensors).toEqual([]);
    
    // Wait for data to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.sensors).toEqual(mockSensors);
  });
  
  test('handles API errors gracefully', async () => {
    // Mock API error
    iotApi.getSensors.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useSensorData());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load sensor data');
  });
});
```

### **Mocking WebSocket for Tests**
```typescript
// Create a mock WebSocket context for testing
const mockWebSocket = {
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  },
  isConnected: true
};

function renderHookWithWebSocket(hook: () => any) {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <WebSocketContext.Provider value={mockWebSocket}>
        {children}
      </WebSocketContext.Provider>
    )
  });
}
```

## 🎯 Performance Optimizations

### **Debounced API Calls**
```typescript
function useSensorData() {
  // Debounce rapid successive calls
  const debouncedFetch = useMemo(
    () => debounce(fetchSensorData, 500),
    []
  );
  
  const refreshData = useCallback(() => {
    debouncedFetch();
  }, [debouncedFetch]);
}
```

### **Memoized Computations**
```typescript
function useSensorData() {
  const [rawData, setRawData] = useState<SensorData[]>([]);
  
  // Expensive computation - only recalculate when rawData changes
  const processedData = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      status: calculateSensorStatus(item),
      trend: calculateTrend(item.history)
    }));
  }, [rawData]);
  
  return { data: processedData };
}
```

## 🐛 Common Pitfalls & Solutions

### **1. Stale Closures in Effects**
```typescript
// Problem: refreshData function becomes stale
const refreshData = () => {
  fetchData(); // This might reference old state
};

useEffect(() => {
  const interval = setInterval(refreshData, 5000);
  return () => clearInterval(interval);
}, []); // Empty deps - refreshData becomes stale

// Solution: Use useCallback or include in dependencies
const refreshData = useCallback(() => {
  fetchData();
}, [/* dependencies */]);
```

### **2. Memory Leaks from Unsubscribed Events**
```typescript
// Always clean up WebSocket listeners
useEffect(() => {
  if (!socket) return;
  
  const handleData = (data: SensorData) => {
    setSensorData(prev => updateData(prev, data));
  };
  
  socket.on('sensor-data', handleData);
  
  // Cleanup function is crucial
  return () => {
    socket.off('sensor-data', handleData);
  };
}, [socket]);
```

### **3. Unnecessary Re-renders**
```typescript
// Problem: New object reference on every render
const config = {
  refreshInterval: 5000,
  maxRetries: 3
};

// Solution: Move outside component or use useMemo
const DEFAULT_CONFIG = {
  refreshInterval: 5000,
  maxRetries: 3
};

// Or use useMemo for dynamic values
const config = useMemo(() => ({
  refreshInterval: userPreferences.refreshInterval,
  maxRetries: 3
}), [userPreferences.refreshInterval]);
```

## 📚 Hook Documentation Standards

Each hook file includes comprehensive documentation:

```typescript
/**
 * useSensorData - Custom hook for managing IoT sensor data
 * 
 * Handles:
 * - Initial data fetching
 * - Real-time WebSocket updates
 * - Error states and retry logic
 * - Caching for performance
 * 
 * @param sensorId - Optional specific sensor ID to focus on
 * @returns Object with sensor data, loading states, and actions
 * 
 * @example
 * function Dashboard() {
 *   const { sensors, sensorData, loading, error } = useSensorData();
 *   
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *   
 *   return <SensorGrid sensors={sensors} data={sensorData} />;
 * }
 */
```

---

*This hook system provides a clean separation between UI logic and data management, making components more focused and the codebase more maintainable.*
