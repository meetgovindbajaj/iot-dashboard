import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ObjectType, Field, ID } from "@nestjs/graphql";

export type SensorDocument = Sensor & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Sensor {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true, unique: true })
  sensorId: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true, enum: ["temperature", "humidity", "power"] })
  type: string;

  @Field()
  @Prop({ required: true })
  location: string;

  @Field()
  @Prop({ required: true })
  unit: string;

  @Field()
  @Prop({ default: true })
  isActive: boolean;

  @Field()
  @Prop({ default: Date.now })
  lastUpdated: Date;
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);
