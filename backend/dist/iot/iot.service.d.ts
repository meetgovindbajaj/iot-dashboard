import { OnModuleInit } from "@nestjs/common";
import { Model } from "mongoose";
import { SensorDocument } from "./sensor.schema";
import { SensorDataDocument } from "./sensor-data.schema";
export declare class IotService implements OnModuleInit {
    private sensorModel;
    private sensorDataModel;
    constructor(sensorModel: Model<SensorDocument>, sensorDataModel: Model<SensorDataDocument>);
    onModuleInit(): Promise<void>;
    private initializeSensors;
    getAllSensors(): Promise<SensorDocument[]>;
    getSensorById(sensorId: string): Promise<SensorDocument | null>;
    addSensorData(sensorId: string, value: number, metadata?: string): Promise<SensorDataDocument>;
    getSensorData(sensorId: string, limit?: number): Promise<SensorDataDocument[]>;
    getHistoricalData(sensorId: string, startDate: Date, endDate: Date): Promise<SensorDataDocument[]>;
    getLatestReadings(): Promise<Array<{
        sensor: SensorDocument;
        data: SensorDataDocument | null;
    }>>;
}
