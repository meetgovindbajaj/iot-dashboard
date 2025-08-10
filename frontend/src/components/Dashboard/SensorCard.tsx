"use client";

import React from "react";
import { SensorReading } from "@/types";

interface SensorCardProps {
  reading: SensorReading;
  onClick: () => void;
}

export default function SensorCard({ reading, onClick }: SensorCardProps) {
  const { sensor, data } = reading;

  const getStatusColor = () => {
    if (!data) return "text-gray-500 bg-gray-100 border-gray-300";
    if (!sensor.isActive) return "text-red-700 bg-red-100 border-red-300";
    return "text-green-700 bg-green-100 border-green-300";
  };

  const getStatusText = () => {
    if (!data) return "No Data";
    if (!sensor.isActive) return "Inactive";
    return "Active";
  };

  const formatValue = (value: number | null) => {
    if (value === null || value === undefined) return "--";

    switch (sensor.type) {
      case "temperature":
        return `${value.toFixed(1)}°C`;
      case "humidity":
        return `${value.toFixed(1)}%`;
      case "power":
        return `${value.toFixed(2)} kW`;
      default:
        return value.toString();
    }
  };

  const getIcon = () => {
    switch (sensor.type) {
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

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getIcon()}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sensor.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {sensor.type} Sensor
            </p>
          </div>
        </div>

        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor()}`}
        >
          {getStatusText()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatValue(data?.value || null)}
          </span>
          {data && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {sensor.unit}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          📍 {sensor.location}
        </p>

        {data && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
