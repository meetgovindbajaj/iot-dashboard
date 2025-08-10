"use client";

import React, { useState } from "react";
import { Sensor } from "@/types";
import { iotApi } from "@/utils/api";
import { toast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SensorConfigModalProps {
  sensor: Sensor | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedSensor: Sensor) => void;
}

export default function SensorConfigModal({
  sensor,
  isOpen,
  onClose,
  onUpdate,
}: SensorConfigModalProps) {
  const [formData, setFormData] = useState({
    name: sensor?.name || "",
    location: sensor?.location || "",
    minValue: sensor?.minValue?.toString() || "",
    maxValue: sensor?.maxValue?.toString() || "",
    alertMin: sensor?.alertThreshold?.min?.toString() || "",
    alertMax: sensor?.alertThreshold?.max?.toString() || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (sensor) {
      setFormData({
        name: sensor.name || "",
        location: sensor.location || "",
        minValue: sensor.minValue?.toString() || "",
        maxValue: sensor.maxValue?.toString() || "",
        alertMin: sensor.alertThreshold?.min?.toString() || "",
        alertMax: sensor.alertThreshold?.max?.toString() || "",
      });
    }
  }, [sensor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sensor) return;

    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        location: formData.location,
        minValue: formData.minValue ? parseFloat(formData.minValue) : undefined,
        maxValue: formData.maxValue ? parseFloat(formData.maxValue) : undefined,
        alertThreshold: {
          min: formData.alertMin ? parseFloat(formData.alertMin) : 0,
          max: formData.alertMax ? parseFloat(formData.alertMax) : 100,
        },
      };

      const response = await iotApi.updateSensor(sensor.sensorId, updateData);
      onUpdate(response.data);
      toast.success("Sensor configuration updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update sensor configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen || !sensor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Configure {sensor.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sensor Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Value ({sensor.unit})
                  </label>
                  <input
                    type="number"
                    name="minValue"
                    value={formData.minValue}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Value ({sensor.unit})
                  </label>
                  <input
                    type="number"
                    name="maxValue"
                    value={formData.maxValue}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alert Min ({sensor.unit})
                  </label>
                  <input
                    type="number"
                    name="alertMin"
                    value={formData.alertMin}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alert Max ({sensor.unit})
                  </label>
                  <input
                    type="number"
                    name="alertMax"
                    value={formData.alertMax}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Type: {sensor.type}</p>
                <p>Sensor ID: {sensor.sensorId}</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
