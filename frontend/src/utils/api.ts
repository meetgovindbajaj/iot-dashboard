import axios from "axios";
import {
  LoginCredentials,
  RegisterData,
  LoginResponse,
  Sensor,
  SensorData,
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

// IoT API
export const iotApi = {
  getSensors: () => api.get<Sensor[]>("/iot/sensors"),

  getSensorById: (sensorId: string) =>
    api.get<Sensor>(`/iot/sensors/${sensorId}`),

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

  getLatestReadings: () => api.get("/iot/latest"),

  addSensorData: (sensorId: string, value: number, metadata?: string) =>
    api.post(`/iot/sensors/${sensorId}/data`, { value, metadata }),
};

export { api };
