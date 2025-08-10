import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({ isActive: true }).select("-password").exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, isActive: true }).exec();
  }

  async update(
    id: string,
    updateUserDto: Partial<User>,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select("-password")
      .exec();

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException("User not found");
    }
  }

  async seedDefaultUsers(): Promise<void> {
    const adminExists = await this.findByEmail("admin@example.com");
    const userExists = await this.findByEmail("user@example.com");

    if (!adminExists) {
      const bcrypt = require("bcryptjs");
      await this.create({
        email: "admin@example.com",
        password: await bcrypt.hash("admin123", 10),
        name: "Admin User",
        role: "admin",
      });
    }

    if (!userExists) {
      const bcrypt = require("bcryptjs");
      await this.create({
        email: "user@example.com",
        password: await bcrypt.hash("user123", 10),
        name: "Regular User",
        role: "user",
      });
    }
  }
}
