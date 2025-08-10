import { IotService } from "./iot.service";
import { Sensor } from "./sensor.schema";
import { SensorData } from "./sensor-data.schema";
export declare class IotResolver {
    private iotService;
    constructor(iotService: IotService);
    sensors(): Promise<Sensor[]>;
    sensor(sensorId: string): Promise<Sensor | null>;
    sensorData(sensorId: string, limit?: number): Promise<SensorData[]>;
    historicalData(sensorId: string, startDate: Date, endDate: Date): Promise<SensorData[]>;
}
