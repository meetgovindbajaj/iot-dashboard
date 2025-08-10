import { Document } from "mongoose";
export type SensorDocument = Sensor & Document;
export declare class Sensor {
    _id: string;
    sensorId: string;
    name: string;
    type: string;
    location: string;
    unit: string;
    isActive: boolean;
    lastUpdated: Date;
}
export declare const SensorSchema: import("mongoose").Schema<Sensor, import("mongoose").Model<Sensor, any, any, any, Document<unknown, any, Sensor> & Sensor & Required<{
    _id: string;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Sensor, Document<unknown, {}, import("mongoose").FlatRecord<Sensor>> & import("mongoose").FlatRecord<Sensor> & Required<{
    _id: string;
}>>;
