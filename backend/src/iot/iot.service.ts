import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sensor, SensorDocument } from "./sensor.schema";
import { SensorData, SensorDataDocument } from "./sensor-data.schema";

@Injectable()
export class IotService implements OnModuleInit {
  constructor(
    @InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,
    @InjectModel(SensorData.name)
    private sensorDataModel: Model<SensorDataDocument>
  ) {}

  async onModuleInit() {
    await this.initializeSensors();
  }

  private async initializeSensors() {
    const existingSensors = await this.sensorModel.countDocuments();
    if (existingSensors === 0) {
      const defaultSensors = [
        {
          sensorId: "TEMP_001",
          name: "Temperature Sensor 1",
          type: "temperature",
          location: "Server Room",
          unit: "°C",
        },
        {
          sensorId: "TEMP_002",
          name: "Temperature Sensor 2",
          type: "temperature",
          location: "Office Area",
          unit: "°C",
        },
        {
          sensorId: "HUM_001",
          name: "Humidity Sensor 1",
          type: "humidity",
          location: "Server Room",
          unit: "%",
        },
        {
          sensorId: "HUM_002",
          name: "Humidity Sensor 2",
          type: "humidity",
          location: "Office Area",
          unit: "%",
        },
        {
          sensorId: "POW_001",
          name: "Power Monitor 1",
          type: "power",
          location: "Main Panel",
          unit: "kW",
        },
        {
          sensorId: "POW_002",
          name: "Power Monitor 2",
          type: "power",
          location: "UPS System",
          unit: "kW",
        },
      ];

      await this.sensorModel.insertMany(defaultSensors);
      console.log("🔧 Default sensors initialized");
    }
  }

  async getAllSensors(): Promise<SensorDocument[]> {
    return this.sensorModel.find({ isActive: true }).exec();
  }

  async getSensorById(sensorId: string): Promise<SensorDocument | null> {
    return this.sensorModel.findOne({ sensorId, isActive: true }).exec();
  }

  async addSensorData(
    sensorId: string,
    value: number,
    metadata?: string
  ): Promise<SensorDataDocument> {
    const sensorData = new this.sensorDataModel({
      sensorId,
      value,
      metadata,
      timestamp: new Date(),
    });

    const savedData = await sensorData.save();

    // Update sensor's lastUpdated timestamp
    await this.sensorModel.updateOne({ sensorId }, { lastUpdated: new Date() });

    return savedData;
  }

  async getSensorData(
    sensorId: string,
    limit: number = 100
  ): Promise<SensorDataDocument[]> {
    return this.sensorDataModel
      .find({ sensorId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getHistoricalData(
    sensorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SensorDataDocument[]> {
    return this.sensorDataModel
      .find({
        sensorId,
        timestamp: { $gte: startDate, $lte: endDate },
      })
      .sort({ timestamp: 1 })
      .exec();
  }

  async getLatestReadings(): Promise<
    Array<{ sensor: SensorDocument; data: SensorDataDocument | null }>
  > {
    const sensors = await this.getAllSensors();
    const readings: Array<{
      sensor: SensorDocument;
      data: SensorDataDocument | null;
    }> = [];

    for (const sensor of sensors) {
      const latestData = await this.sensorDataModel
        .findOne({ sensorId: sensor.sensorId })
        .sort({ timestamp: -1 })
        .exec();

      readings.push({
        sensor,
        data: latestData,
      });
    }

    return readings;
  }

  // Sensor configuration methods
  async updateSensorConfig(
    sensorId: string,
    config: Partial<Sensor>
  ): Promise<SensorDocument> {
    const updatedSensor = await this.sensorModel
      .findOneAndUpdate(
        { sensorId },
        { ...config, lastUpdated: new Date() },
        { new: true }
      )
      .exec();

    if (!updatedSensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    return updatedSensor;
  }

  async createSensor(sensorData: Partial<Sensor>): Promise<SensorDocument> {
    const newSensor = new this.sensorModel({
      ...sensorData,
      lastUpdated: new Date(),
    });
    return newSensor.save();
  }

  async deleteSensor(sensorId: string): Promise<void> {
    await this.sensorModel
      .findOneAndUpdate({ sensorId }, { isActive: false }, { new: true })
      .exec();

    // Optionally, you might want to stop data collection for this sensor
    // This would depend on your data simulation service
  }

  async getSensorAlerts(): Promise<
    Array<{
      sensor: SensorDocument;
      latestValue: number;
      alertType: "high" | "low";
      timestamp: Date;
    }>
  > {
    const sensors = await this.getAllSensors();
    const alerts: Array<{
      sensor: SensorDocument;
      latestValue: number;
      alertType: "high" | "low";
      timestamp: Date;
    }> = [];

    for (const sensor of sensors) {
      if (!sensor.alertThreshold) continue;

      const latestData = await this.sensorDataModel
        .findOne({ sensorId: sensor.sensorId })
        .sort({ timestamp: -1 })
        .exec();

      if (latestData) {
        if (latestData.value > sensor.alertThreshold.max) {
          alerts.push({
            sensor,
            latestValue: latestData.value,
            alertType: "high",
            timestamp: latestData.timestamp,
          });
        } else if (latestData.value < sensor.alertThreshold.min) {
          alerts.push({
            sensor,
            latestValue: latestData.value,
            alertType: "low",
            timestamp: latestData.timestamp,
          });
        }
      }
    }

    return alerts;
  }

  async getSensorStats(
    sensorId: string,
    days: number = 7
  ): Promise<{
    average: number;
    min: number;
    max: number;
    count: number;
    trend: "up" | "down" | "stable";
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.sensorDataModel
      .find({
        sensorId,
        timestamp: { $gte: startDate },
      })
      .sort({ timestamp: 1 })
      .exec();

    if (data.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0, trend: "stable" };
    }

    const values = data.map((d) => d.value);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate trend (compare first 25% vs last 25% of data)
    const quarterSize = Math.floor(data.length / 4);
    const firstQuarter = data.slice(0, quarterSize);
    const lastQuarter = data.slice(-quarterSize);

    if (firstQuarter.length > 0 && lastQuarter.length > 0) {
      const firstAvg =
        firstQuarter.reduce((a, b) => a + b.value, 0) / firstQuarter.length;
      const lastAvg =
        lastQuarter.reduce((a, b) => a + b.value, 0) / lastQuarter.length;
      const difference = lastAvg - firstAvg;
      const threshold = average * 0.05; // 5% threshold

      const trend =
        difference > threshold
          ? "up"
          : difference < -threshold
          ? "down"
          : "stable";

      return { average, min, max, count: data.length, trend };
    }

    return { average, min, max, count: data.length, trend: "stable" };
  }

  async toggleSensorStatus(sensorId: string): Promise<SensorDocument> {
    const sensor = await this.sensorModel.findOne({ sensorId }).exec();
    if (!sensor) {
      throw new Error(`Sensor ${sensorId} not found`);
    }

    const updatedSensor = await this.sensorModel
      .findOneAndUpdate(
        { sensorId },
        { isActive: !sensor.isActive, lastUpdated: new Date() },
        { new: true }
      )
      .exec();

    if (!updatedSensor) {
      throw new Error(`Failed to update sensor ${sensorId}`);
    }

    return updatedSensor;
  }
}
