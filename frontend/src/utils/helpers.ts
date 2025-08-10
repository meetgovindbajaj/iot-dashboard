import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export const formatTimestamp = (timestamp: string | Date): string => {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return `Today at ${format(date, "HH:mm")}`;
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "HH:mm")}`;
  }

  return format(date, "MMM dd, HH:mm");
};

export const formatRelativeTime = (timestamp: string | Date): string => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const formatSensorValue = (value: number, unit: string): string => {
  const roundedValue = Math.round(value * 100) / 100;
  return `${roundedValue}${unit}`;
};

export const getSensorIcon = (type: string): string => {
  switch (type) {
    case "temperature":
      return "🌡️";
    case "humidity":
      return "💧";
    case "power":
      return "⚡";
    default:
      return "📊";
  }
};

export const getSensorColor = (type: string): string => {
  switch (type) {
    case "temperature":
      return "#ef4444"; // red-500
    case "humidity":
      return "#3b82f6"; // blue-500
    case "power":
      return "#eab308"; // yellow-500
    default:
      return "#6b7280"; // gray-500
  }
};

export const getStatusColor = (value: number, type: string): string => {
  switch (type) {
    case "temperature":
      if (value > 30) return "text-red-500";
      if (value < 18) return "text-blue-500";
      return "text-green-500";
    case "humidity":
      if (value > 60 || value < 30) return "text-yellow-500";
      return "text-green-500";
    case "power":
      if (value > 15) return "text-red-500";
      if (value > 10) return "text-yellow-500";
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;

  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

export const generateMockData = (
  count: number,
  type: "temperature" | "humidity" | "power"
) => {
  const data = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000); // 5-minute intervals
    let value: number;

    switch (type) {
      case "temperature":
        value = 20 + Math.random() * 10 + Math.sin(i / 10) * 3;
        break;
      case "humidity":
        value = 40 + Math.random() * 30 + Math.sin(i / 15) * 10;
        break;
      case "power":
        value = 5 + Math.random() * 10 + Math.sin(i / 8) * 2;
        break;
    }

    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value * 100) / 100,
    });
  }

  return data;
};

export const calculateAverage = (data: number[]): number => {
  if (data.length === 0) return 0;
  return data.reduce((sum, value) => sum + value, 0) / data.length;
};

export const calculateMin = (data: number[]): number => {
  if (data.length === 0) return 0;
  return Math.min(...data);
};

export const calculateMax = (data: number[]): number => {
  if (data.length === 0) return 0;
  return Math.max(...data);
};

export const classNames = (
  ...classes: (string | undefined | null | boolean)[]
): string => {
  return classes.filter(Boolean).join(" ");
};
