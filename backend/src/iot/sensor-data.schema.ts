import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ObjectType, Field, Float, ID } from "@nestjs/graphql";

export type SensorDataDocument = SensorData & Document;

@ObjectType()
@Schema({ timestamps: true })
export class SensorData {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  sensorId: string;

  @Field(() => Float)
  @Prop({ required: true })
  value: number;

  @Field()
  @Prop({ default: Date.now })
  timestamp: Date;

  @Field({ nullable: true })
  @Prop()
  metadata?: string;
}

export const SensorDataSchema = SchemaFactory.createForClass(SensorData);
// Create index for efficient querying
SensorDataSchema.index({ sensorId: 1, timestamp: -1 });
