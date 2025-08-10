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
    private sensorDataModel: Model<SensorDataDocument>,
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
    metadata?: string,
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
    limit: number = 100,
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
    endDate: Date,
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
}
