# Components - Reusable UI Building Blocks

## 📖 Overview

This folder contains all **reusable UI components** for the IoT Dashboard. Each component is designed to be **modular**, **typed**, and **well-documented** for maximum reusability and maintainability.

### 🎯 Component Design Philosophy

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition over Inheritance**: Build complex UIs by combining simple components
3. **TypeScript First**: All components have strict type definitions
4. **Responsive by Default**: Mobile-first design approach
5. **Accessibility**: Following WCAG guidelines for inclusive design

## 📁 Component Structure

```
components/
├── 📁 Admin/                   # Admin panel specific components
│   └── 📄 SensorConfigModal.tsx # Sensor configuration modal
├── 📁 Charts/                  # Data visualization components
│   └── 📄 SensorChart.tsx     # Real-time sensor data charts
├── 📁 Dashboard/               # Dashboard specific components
│   └── 📄 SensorCard.tsx      # Individual sensor display cards
└── 📁 Layout/                  # Application layout components
    └── 📄 Layout.tsx          # Main application layout wrapper
```

## 🧩 Component Categories

### **1. Layout Components** (`Layout/`)

**Purpose**: Provide consistent structure and navigation across the application.

**Components**:
- `Layout.tsx` - Main application wrapper with navigation and responsive design

**Why Layout Components?**
- **Consistency**: Same navigation and structure across all pages
- **DRY Principle**: No code duplication for common UI elements
- **Responsive Design**: Centralized mobile/desktop layout logic

### **2. Dashboard Components** (`Dashboard/`)

**Purpose**: Display and interact with IoT sensor data in the main dashboard.

**Components**:
- `SensorCard.tsx` - Individual sensor data display with status indicators

**Key Features**:
- **Real-time Updates**: Automatically reflects live sensor data
- **Status Indicators**: Visual cues for sensor health and alerts
- **Mobile Responsive**: Optimized for all screen sizes

### **3. Chart Components** (`Charts/`)

**Purpose**: Visualize time-series sensor data with interactive charts.

**Components**:
- `SensorChart.tsx` - Line charts for historical sensor data

**Why Separate Chart Components?**
- **Reusability**: Same chart component for different sensor types
- **Performance**: Optimized rendering for large datasets
- **Customization**: Easy to modify chart appearance and behavior

### **4. Admin Components** (`Admin/`)

**Purpose**: Administrative interface components for system management.

**Components**:
- `SensorConfigModal.tsx` - Modal for sensor configuration and settings

**Security Considerations**:
- **Role-based Rendering**: Only shown to admin users
- **Validation**: Client-side validation with server-side verification
- **Error Handling**: Graceful handling of configuration errors

## 🔧 Component Implementation Patterns

### **1. Props Interface Pattern**

Every component has a clear TypeScript interface:

```typescript
interface SensorCardProps {
  sensor: Sensor;                    # Required sensor data
  onClick?: (sensor: Sensor) => void; # Optional click handler
  showActions?: boolean;             # Optional action buttons
  className?: string;                # Additional CSS classes
}
```

**Why This Pattern?**
- **Type Safety**: Prevents runtime errors from incorrect props
- **Documentation**: Interface serves as component documentation
- **IntelliSense**: Better developer experience with autocomplete

### **2. Composition Pattern**

Components are built to be composed together:

```typescript
// Good: Composable components
<Layout>
  <Dashboard>
    <SensorCard sensor={sensor} />
    <SensorChart data={sensorData} />
  </Dashboard>
</Layout>

// Avoid: Monolithic components
<DashboardWithEverything />
```

### **3. Custom Hook Integration**

Components use custom hooks for logic separation:

```typescript
export default function SensorChart({ sensorId }: Props) {
  const { data, loading, error } = useSensorData(sensorId);
  
  if (loading) return <ChartSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <Chart data={data} />;
}
```

**Benefits**:
- **Separation of Concerns**: Logic separated from presentation
- **Reusability**: Hooks can be used in multiple components
- **Testability**: Easier to test logic independently

## 🎨 Styling Conventions

### **Tailwind CSS Classes**

Components use consistent Tailwind patterns:

```typescript
// Base component classes
const baseClasses = "rounded-lg border bg-white p-4 shadow-sm";

// State-dependent classes
const statusClasses = {
  online: "border-green-200 bg-green-50",
  offline: "border-red-200 bg-red-50",
  warning: "border-yellow-200 bg-yellow-50"
};
```

### **Responsive Design Patterns**

```typescript
// Mobile-first responsive classes
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {sensors.map(sensor => (
    <SensorCard key={sensor.id} sensor={sensor} />
  ))}
</div>
```

**Breakpoint Strategy**:
- **Base (default)**: Mobile phones (< 640px)
- **sm**: Small tablets (≥ 640px)
- **md**: Tablets (≥ 768px)  
- **lg**: Laptops (≥ 1024px)
- **xl**: Desktop (≥ 1280px)

## 📊 Data Flow Patterns

### **Props Down, Events Up**

```typescript
// Parent component
function Dashboard() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  
  return (
    <div>
      {sensors.map(sensor => (
        <SensorCard 
          key={sensor.id}
          sensor={sensor}                           # Data flows down
          onSelect={setSelectedSensor}              # Events flow up
        />
      ))}
    </div>
  );
}
```

### **Context for Global State**

```typescript
// Use context for widely-needed data
function SensorCard({ sensor }: Props) {
  const { user } = useAuth();                      # Global user state
  const { theme } = useTheme();                    # Global theme state
  
  const showAdminActions = user?.role === 'admin';
  
  return (
    <div className={theme === 'dark' ? 'dark-card' : 'light-card'}>
      {/* Card content */}
    </div>
  );
}
```

## 🔄 State Management in Components

### **Local State (useState)**
For component-specific data that doesn't need to be shared:

```typescript
function SensorConfigModal() {
  const [isLoading, setIsLoading] = useState(false);    # Loading state
  const [formData, setFormData] = useState(initialData); # Form data
  const [errors, setErrors] = useState<string[]>([]);   # Validation errors
}
```

### **Server State (API calls)**
For data fetched from the backend:

```typescript
function SensorChart({ sensorId }: Props) {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await iotApi.getSensorHistory(sensorId);
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load sensor data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sensorId]);
}
```

## 🧪 Component Testing Strategy

### **Testing Approach**
1. **Unit Tests**: Test individual component behavior
2. **Integration Tests**: Test component interactions
3. **Visual Tests**: Test responsive design and styling

### **Testing Example**
```typescript
describe('SensorCard', () => {
  it('displays sensor name and current value', () => {
    const sensor = { name: 'Temperature', value: 25, unit: '°C' };
    render(<SensorCard sensor={sensor} />);
    
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('25°C')).toBeInTheDocument();
  });
  
  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    const sensor = { id: '1', name: 'Temperature' };
    
    render(<SensorCard sensor={sensor} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Temperature'));
    
    expect(onSelect).toHaveBeenCalledWith(sensor);
  });
});
```

## 🔧 Performance Optimizations

### **React.memo for Pure Components**
```typescript
export default React.memo(function SensorCard({ sensor, onClick }: Props) {
  return (
    <div onClick={() => onClick?.(sensor)}>
      {/* Component content */}
    </div>
  );
});
```

### **useMemo for Expensive Calculations**
```typescript
function SensorChart({ data }: Props) {
  const chartData = useMemo(() => {
    return data.map(point => ({
      time: format(parseISO(point.timestamp), 'HH:mm'),
      value: point.value
    }));
  }, [data]);
  
  return <LineChart data={chartData} />;
}
```

### **useCallback for Event Handlers**
```typescript
function Dashboard() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  
  const handleSensorSelect = useCallback((sensor: Sensor) => {
    setSelectedSensor(sensor);
  }, []);
  
  return (
    <div>
      {sensors.map(sensor => (
        <SensorCard 
          key={sensor.id}
          sensor={sensor}
          onSelect={handleSensorSelect}    # Stable reference
        />
      ))}
    </div>
  );
}
```

## 🎯 Best Practices

### **1. Component Naming**
- **PascalCase**: `SensorCard`, `UserProfile`
- **Descriptive**: Name clearly indicates component purpose
- **Consistent**: Follow same naming patterns across project

### **2. File Organization**
- **One Component per File**: Easy to find and maintain
- **Index Files**: For easier imports when needed
- **Co-location**: Keep related files close together

### **3. Props Design**
- **Required vs Optional**: Use TypeScript to enforce required props
- **Sensible Defaults**: Provide good default values
- **Avoid Prop Drilling**: Use context for deeply nested props

### **4. Error Handling**
```typescript
function SensorChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <EmptyState message="No sensor data available" />;
  }
  
  return <Chart data={data} />;
}
```

## 🐛 Common Pitfalls & Solutions

### **1. Unnecessary Re-renders**
```typescript
// Problem: New object created on every render
<SensorCard style={{ backgroundColor: 'white' }} />

// Solution: Move outside component or use useMemo
const cardStyle = { backgroundColor: 'white' };
<SensorCard style={cardStyle} />
```

### **2. Missing Keys in Lists**
```typescript
// Problem: Using array index as key
{sensors.map((sensor, index) => (
  <SensorCard key={index} sensor={sensor} />
))}

// Solution: Use stable, unique identifier
{sensors.map(sensor => (
  <SensorCard key={sensor.id} sensor={sensor} />
))}
```

### **3. Side Effects in Render**
```typescript
// Problem: API call in render function
function SensorCard({ sensorId }: Props) {
  const data = fetchSensorData(sensorId);  // Wrong!
  return <div>{data}</div>;
}

// Solution: Use useEffect for side effects
function SensorCard({ sensorId }: Props) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchSensorData(sensorId).then(setData);
  }, [sensorId]);
  
  return <div>{data}</div>;
}
```

## 📚 Component Documentation

Each component file includes:

1. **JSDoc Comments**: Explain component purpose and usage
2. **Props Interface**: TypeScript definitions with comments
3. **Usage Examples**: Code examples in comments
4. **Performance Notes**: Any performance considerations

```typescript
/**
 * SensorCard displays individual sensor data with real-time updates
 * 
 * @example
 * <SensorCard 
 *   sensor={sensorData} 
 *   onSelect={(sensor) => console.log(sensor)}
 *   showActions={user.role === 'admin'}
 * />
 */
interface SensorCardProps {
  /** Sensor data to display */
  sensor: Sensor;
  /** Called when card is clicked */
  onSelect?: (sensor: Sensor) => void;
  /** Whether to show admin action buttons */
  showActions?: boolean;
}
```

---

*This component system provides a solid foundation for building scalable, maintainable user interfaces in the IoT Dashboard.*
