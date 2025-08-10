"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SensorData } from "@/types";

interface SensorChartProps {
  data: SensorData[];
  sensorType: string;
  unit: string;
  height?: number;
}

interface ChartDataPoint {
  timestamp: string;
  value: number;
  formattedTime: string;
}

export default function SensorChart({
  data,
  sensorType,
  unit,
  height = 300,
}: SensorChartProps) {
  // Transform data for the chart
  const chartData: ChartDataPoint[] = data.map((item) => ({
    timestamp: item.timestamp,
    value: item.value,
    formattedTime: new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  // Get color based on sensor type
  const getLineColor = () => {
    switch (sensorType) {
      case "temperature":
        return "#ef4444"; // red
      case "humidity":
        return "#3b82f6"; // blue
      case "power":
        return "#10b981"; // green
      default:
        return "#6366f1"; // indigo
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue =
        sensorType === "temperature"
          ? `${value.toFixed(1)}°C`
          : sensorType === "humidity"
          ? `${value.toFixed(1)}%`
          : sensorType === "power"
          ? `${value.toFixed(2)} kW`
          : `${value} ${unit}`;

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(label).toLocaleString()}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Value: {formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="formattedTime"
            tick={{ fontSize: 12 }}
            className="fill-gray-600 dark:fill-gray-400"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="fill-gray-600 dark:fill-gray-400"
            label={{
              value: unit,
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={getLineColor()}
            strokeWidth={2}
            dot={{ fill: getLineColor(), strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
