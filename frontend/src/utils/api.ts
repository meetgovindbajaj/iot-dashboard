import axios from "axios";
import {
  LoginCredentials,
  RegisterData,
  LoginResponse,
  Sensor,
  SensorData,
  SensorAlert,
  SensorStats,
  UserProfile,
  ChangePasswordData,
  CreateSensorData,
  UpdateSensorData,
  User,
  UserStats,
} from "@/types";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove("token");
      Cookies.remove("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>("/auth/login", credentials),

  register: (data: RegisterData) => api.post("/auth/register", data),
};

// User API
export const userApi = {
  getProfile: () => api.get<User>("/users/profile"),

  updateProfile: (data: UserProfile) => api.put<User>("/users/profile", data),

  changePassword: (data: ChangePasswordData) =>
    api.put("/users/change-password", data),

  getAllUsers: () => api.get<User[]>("/users"),

  getUserById: (id: string) => api.get<User>(`/users/${id}`),

  getUserStats: () => api.get<UserStats>("/users/stats"),

  getUsersByRole: (role: string) => api.get<User[]>(`/users/role/${role}`),

  updateUserRole: (id: string, role: string, permissions?: string[]) =>
    api.put(`/users/${id}/role`, { role, permissions }),

  deleteUser: (id: string) => api.delete(`/users/${id}`),

  createUser: (data: RegisterData) => api.post<User>("/users", data),
};

// IoT API
export const iotApi = {
  getSensors: () => api.get<Sensor[]>("/iot/sensors"),

  getSensorById: (sensorId: string) =>
    api.get<Sensor>(`/iot/sensors/${sensorId}`),

  createSensor: (data: CreateSensorData) =>
    api.post<Sensor>("/iot/sensors", data),

  updateSensor: (sensorId: string, data: UpdateSensorData) =>
    api.put<Sensor>(`/iot/sensors/${sensorId}`, data),

  toggleSensorStatus: (sensorId: string) =>
    api.patch<Sensor>(`/iot/sensors/${sensorId}/toggle`),

  deleteSensor: (sensorId: string) => api.delete(`/iot/sensors/${sensorId}`),

  getSensorData: (sensorId: string, limit?: number) =>
    api.get<SensorData[]>(`/iot/sensors/${sensorId}/data`, {
      params: { limit },
    }),

  getHistoricalData: (sensorId: string, startDate: Date, endDate: Date) =>
    api.get<SensorData[]>(`/iot/sensors/${sensorId}/history`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    }),

  getSensorStats: (sensorId: string, days?: number) =>
    api.get<SensorStats>(`/iot/sensors/${sensorId}/stats`, {
      params: { days },
    }),

  getLatestReadings: () => api.get("/iot/latest"),

  getSensorAlerts: () => api.get<SensorAlert[]>("/iot/alerts"),

  addSensorData: (sensorId: string, value: number, metadata?: string) =>
    api.post(`/iot/sensors/${sensorId}/data`, { value, metadata }),
};

export { api };
