import { Document } from "mongoose";
export type SensorDataDocument = SensorData & Document;
export declare class SensorData {
    _id: string;
    sensorId: string;
    value: number;
    timestamp: Date;
    metadata?: string;
}
export declare const SensorDataSchema: import("mongoose").Schema<SensorData, import("mongoose").Model<SensorData, any, any, any, Document<unknown, any, SensorData> & SensorData & Required<{
    _id: string;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SensorData, Document<unknown, {}, import("mongoose").FlatRecord<SensorData>> & import("mongoose").FlatRecord<SensorData> & Required<{
    _id: string;
}>>;
