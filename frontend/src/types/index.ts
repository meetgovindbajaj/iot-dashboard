export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: "admin" | "user";
}

export interface Sensor {
  _id: string;
  sensorId: string;
  name: string;
  type: "temperature" | "humidity" | "power";
  location: string;
  unit: string;
  isActive: boolean;
  lastUpdated: string;
}

export interface SensorData {
  _id: string;
  sensorId: string;
  value: number;
  timestamp: string;
  metadata?: string;
}

export interface SensorReading {
  sensor: Sensor;
  data: SensorData | null;
}

export interface SensorUpdate {
  sensorId: string;
  sensorName: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
  location: string;
}

export interface Alert {
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: string;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface DashboardStats {
  totalSensors: number;
  activeSensors: number;
  alerts: number;
  lastUpdate: string;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// WebSocket event types
export interface WebSocketEvents {
  latestReadings: SensorReading[];
  sensorUpdate: SensorUpdate;
  alert: Alert;
  error: { message: string };
}

// Chart configuration types
export interface ChartConfig {
  type: "line" | "area" | "bar";
  dataKey: string;
  color: string;
  name: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}
