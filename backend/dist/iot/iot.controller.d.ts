import { IotService } from "./iot.service";
export declare class IotController {
    private readonly iotService;
    constructor(iotService: IotService);
    getAllSensors(): Promise<import("./sensor.schema").SensorDocument[]>;
    getSensorById(sensorId: string): Promise<import("./sensor.schema").SensorDocument | null>;
    getSensorData(sensorId: string, limit?: number): Promise<import("./sensor-data.schema").SensorDataDocument[]>;
    getHistoricalData(sensorId: string, startDate: string, endDate: string): Promise<import("./sensor-data.schema").SensorDataDocument[]>;
    getLatestReadings(): Promise<{
        sensor: import("./sensor.schema").SensorDocument;
        data: import("./sensor-data.schema").SensorDataDocument | null;
    }[]>;
    addSensorData(sensorId: string, body: {
        value: number;
        metadata?: string;
    }): Promise<import("./sensor-data.schema").SensorDataDocument>;
}
