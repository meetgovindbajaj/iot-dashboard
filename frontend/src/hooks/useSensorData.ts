import { useState, useEffect } from "react";
import { SensorData, DateRange } from "@/types";
import { iotApi } from "@/utils/api";
import { toast } from "react-hot-toast";

export const useSensorData = (sensorId: string, limit: number = 100) => {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!sensorId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await iotApi.getSensorData(sensorId, limit);
        setData(response.data);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch sensor data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sensorId, limit]);

  const refetch = () => {
    if (sensorId) {
      setLoading(true);
      setError(null);

      iotApi
        .getSensorData(sensorId, limit)
        .then((response) => setData(response.data))
        .catch((err) => {
          const errorMessage =
            err.response?.data?.message || "Failed to fetch sensor data";
          setError(errorMessage);
          toast.error(errorMessage);
        })
        .finally(() => setLoading(false));
    }
  };

  return { data, loading, error, refetch };
};

export const useHistoricalData = (
  sensorId: string,
  dateRange: DateRange | null
) => {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!sensorId || !dateRange) return;

      try {
        setLoading(true);
        setError(null);
        const response = await iotApi.getHistoricalData(
          sensorId,
          dateRange.start,
          dateRange.end
        );
        setData(response.data);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch historical data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [sensorId, dateRange]);

  return { data, loading, error };
};
