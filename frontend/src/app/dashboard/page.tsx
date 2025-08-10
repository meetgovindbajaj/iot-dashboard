"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format, isValid, parseISO } from "date-fns";
import Layout from "@/components/Layout/Layout";
import SensorCard from "@/components/Dashboard/SensorCard";
import SensorChart from "@/components/Charts/SensorChart";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useSensorData } from "@/hooks/useSensorData";
import { Sensor, SensorReading } from "@/types";
import { iotApi } from "@/utils/api";

export default function DashboardPage() {
  const { latestReadings } = useWebSocket();
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const { data: historicalData, loading: chartLoading } = useSensorData(
    selectedSensor?.sensorId || "",
    50
  );

  // Merge historical data with real-time data for charts
  const chartData = useMemo(() => {
    if (!selectedSensor || !historicalData.length) return historicalData;

    // Find latest reading for selected sensor
    const latestReading = latestReadings.find(
      (reading) => reading.sensor.sensorId === selectedSensor.sensorId
    );

    if (!latestReading?.data) return historicalData;

    // Check if latest reading is newer than the most recent historical data
    const mostRecentHistorical = historicalData[historicalData.length - 1];
    const latestTimestamp = new Date(latestReading.data.timestamp);
    const mostRecentTimestamp = new Date(mostRecentHistorical.timestamp);

    if (latestTimestamp > mostRecentTimestamp) {
      // Add new real-time data point
      const newDataPoint = {
        _id: `realtime-${Date.now()}`,
        sensorId: selectedSensor.sensorId,
        value: latestReading.data.value,
        timestamp: latestReading.data.timestamp,
        metadata: latestReading.data.metadata,
      };

      // Keep only last 50 points for chart performance
      const updatedData = [...historicalData, newDataPoint].slice(-50);
      return updatedData;
    }

    return historicalData;
  }, [historicalData, latestReadings, selectedSensor]);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await iotApi.getSensors();
        setSensors(response.data);
        if (response.data.length > 0) {
          setSelectedSensor(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch sensors:", error);
      }
    };

    fetchSensors();
  }, []);

  const handleSensorClick = (reading: SensorReading) => {
    setSelectedSensor(reading.sensor);
  };

  const formatLastUpdate = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      if (!isValid(date)) {
        return "No recent updates";
      }
      return format(date, "HH:mm:ss");
    } catch (error) {
      return "No recent updates";
    }
  };

  const stats = {
    totalSensors: sensors.length,
    activeSensors: latestReadings.filter((r) => r.data).length,
    alerts: 0,
    lastUpdate: latestReadings[0]?.data?.timestamp || new Date().toISOString(),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring of your IoT devices
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalSensors}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Total Sensors
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.activeSensors}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Active Sensors
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.alerts}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Active Alerts
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              Last Update
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {formatLastUpdate(stats.lastUpdate)}
            </div>
          </div>
        </div>

        {/* Sensor Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sensor Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {latestReadings.map((reading) => (
              <SensorCard
                key={reading.sensor.sensorId}
                reading={reading}
                onClick={() => handleSensorClick(reading)}
              />
            ))}
          </div>
        </div>

        {/* Chart */}
        {selectedSensor && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedSensor.name} - Recent Data
              </h2>
              <div className="flex space-x-2">
                {sensors.map((sensor) => (
                  <button
                    key={sensor.sensorId}
                    onClick={() => setSelectedSensor(sensor)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedSensor.sensorId === sensor.sensorId
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {sensor.name}
                  </button>
                ))}
              </div>
            </div>

            {chartLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <SensorChart
                data={chartData}
                sensorType={selectedSensor.type}
                unit={selectedSensor.unit}
                height={300}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
