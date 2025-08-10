"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout/Layout";
import { iotApi, userApi } from "@/utils/api";
import { Sensor, User } from "@/types";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import SensorConfigModal from "@/components/Admin/SensorConfigModal";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"sensors" | "users">("sensors");
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  // Helper function to get user ID (handles both frontend id and backend _id)
  const getUserId = (user: any): string => {
    return user.id || user._id;
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sensorsResponse, usersResponse] = await Promise.all([
        iotApi.getSensors(),
        userApi.getAllUsers(),
      ]);
      setSensors(sensorsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const toggleSensorStatus = async (sensorId: string, isActive: boolean) => {
    try {
      await iotApi.toggleSensorStatus(sensorId);
      setSensors(
        sensors.map((sensor) =>
          sensor.sensorId === sensorId
            ? { ...sensor, isActive: !isActive }
            : sensor
        )
      );
      toast.success(
        `Sensor ${isActive ? "deactivated" : "activated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update sensor status");
    }
  };

  const handleConfigureSensor = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setConfigModalOpen(true);
  };

  const handleSensorUpdate = (updatedSensor: Sensor) => {
    setSensors(
      sensors.map((sensor) =>
        sensor.sensorId === updatedSensor.sensorId ? updatedSensor : sensor
      )
    );
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await userApi.updateUserRole(userId, newRole);
      setUsers(
        users.map((user) =>
          getUserId(user) === userId ? { ...user, role: newRole as any } : user
        )
      );
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Role update error:", error);
      toast.error("Failed to update user role");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await userApi.deleteUser(userId);
      setUsers(users.filter((user) => getUserId(user) !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage sensors and users
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("sensors")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "sensors"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
              }`}
            >
              Sensors
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
              }`}
            >
              Users
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Sensors Tab */}
            {activeTab === "sensors" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sensor Management
                  </h2>
                </div>
                
                {/* Mobile Card Layout */}
                <div className="block sm:hidden">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sensors.map((sensor) => (
                      <div key={sensor.sensorId} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {sensor.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {sensor.type} • {sensor.location}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              sensor.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {sensor.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleConfigureSensor(sensor)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                          >
                            Configure
                          </button>
                          <button
                            onClick={() =>
                              toggleSensorStatus(sensor.sensorId, sensor.isActive)
                            }
                            className={`text-sm ${
                              sensor.isActive
                                ? "text-red-600 hover:text-red-700 dark:text-red-400"
                                : "text-green-600 hover:text-green-700 dark:text-green-400"
                            }`}
                          >
                            {sensor.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Sensor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {sensors.map((sensor) => (
                        <tr key={sensor.sensorId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {sensor.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {sensor.sensorId}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white capitalize">
                              {sensor.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {sensor.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                sensor.isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {sensor.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleConfigureSensor(sensor)}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                                title="Configure Sensor"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() =>
                                  toggleSensorStatus(sensor.sensorId, sensor.isActive)
                                }
                                className={`${
                                  sensor.isActive
                                    ? "text-red-600 hover:text-red-700 dark:text-red-400"
                                    : "text-green-600 hover:text-green-700 dark:text-green-400"
                                } transition-colors`}
                              >
                                {sensor.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    User Management
                  </h2>
                </div>
                
                {/* Mobile Card Layout for Users */}
                <div className="block sm:hidden">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((u) => (
                      <div key={getUserId(u)} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {u.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {u.email}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              u.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Role:</span>
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(getUserId(u), e.target.value)}
                              className="ml-2 text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="user">User</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <button
                            onClick={() => deleteUser(getUserId(u))}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        {u.lastLogin && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Last login: {format(new Date(u.lastLogin), "MMM dd, yyyy HH:mm")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table Layout for Users */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((userItem) => (
                        <tr key={getUserId(userItem)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {userItem.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {userItem.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={userItem.role}
                              onChange={(e) =>
                                updateUserRole(getUserId(userItem), e.target.value)
                              }
                              className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="user">User</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                userItem.isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {userItem.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {userItem.lastLogin
                              ? format(new Date(userItem.lastLogin), "PPp")
                              : "Never"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {getUserId(userItem) !== getUserId(user) && (
                              <button
                                onClick={() => deleteUser(getUserId(userItem))}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <SensorConfigModal
        sensor={selectedSensor}
        isOpen={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setSelectedSensor(null);
        }}
        onUpdate={handleSensorUpdate}
      />
    </Layout>
  );
}
