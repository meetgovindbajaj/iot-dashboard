export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "user" | "viewer";
  department?: string;
  phoneNumber?: string;
  lastLogin?: string;
  permissions: string[];
  profilePicture?: string;
  timezone?: string;
  theme: "light" | "dark";
  isActive: boolean;
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
  role?: "admin" | "manager" | "user" | "viewer";
  department?: string;
  phoneNumber?: string;
}

export interface Sensor {
  _id: string;
  sensorId: string;
  name: string;
  type: "temperature" | "humidity" | "power" | "pressure";
  location: string;
  unit: string;
  minValue?: number;
  maxValue?: number;
  alertThreshold?: {
    min: number;
    max: number;
  };
  isActive: boolean;
  lastUpdated: string;
  description?: string;
  calibrationDate?: string;
  maintenanceInterval?: number;
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

export interface SensorAlert {
  sensor: Sensor;
  latestValue: number;
  alertType: "high" | "low";
  timestamp: string;
}

export interface SensorStats {
  average: number;
  min: number;
  max: number;
  count: number;
  trend: "up" | "down" | "stable";
}

export interface UserProfile {
  name: string;
  department?: string;
  phoneNumber?: string;
  timezone?: string;
  theme: "light" | "dark";
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface CreateSensorData {
  sensorId: string;
  name: string;
  type: "temperature" | "humidity" | "power" | "pressure";
  location: string;
  unit: string;
  minValue?: number;
  maxValue?: number;
  alertThreshold?: {
    min: number;
    max: number;
  };
  description?: string;
  maintenanceInterval?: number;
}

export interface UpdateSensorData {
  name?: string;
  location?: string;
  minValue?: number;
  maxValue?: number;
  alertThreshold?: {
    min: number;
    max: number;
  };
  description?: string;
  maintenanceInterval?: number;
  isActive?: boolean;
}

export interface UserStats {
  total: number;
  byRole: {
    admin: number;
    manager: number;
    user: number;
    viewer: number;
  };
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
