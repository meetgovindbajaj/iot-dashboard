import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: "user", enum: ["admin", "manager", "user", "viewer"] })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  department?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  lastLogin?: Date;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop()
  profilePicture?: string;

  @Prop()
  timezone?: string;

  @Prop({ default: "light", enum: ["light", "dark"] })
  theme: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
