import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./user.schema";

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
    updateUserDto: Partial<User>
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

  async updateProfile(
    id: string,
    updateData: Partial<User>
  ): Promise<UserDocument> {
    // Remove sensitive fields that shouldn't be updated via profile
    const { password, role, permissions, ...profileData } = updateData;

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, profileData, { new: true })
      .select("-password")
      .exec();

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }
    return updatedUser;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { lastLogin: new Date() })
      .exec();
  }

  async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const bcrypt = require("bcryptjs");
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid current password");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel
      .findByIdAndUpdate(id, { password: hashedNewPassword })
      .exec();
  }

  async findByRole(role: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ role, isActive: true })
      .select("-password")
      .exec();
  }

  async updateUserRole(
    id: string,
    role: string,
    permissions: string[] = []
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { role, permissions }, { new: true })
      .select("-password")
      .exec();

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }
    return updatedUser;
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await this.userModel
      .countDocuments({ isActive: true })
      .exec();
    const adminCount = await this.userModel
      .countDocuments({ role: "admin", isActive: true })
      .exec();
    const managerCount = await this.userModel
      .countDocuments({ role: "manager", isActive: true })
      .exec();
    const userCount = await this.userModel
      .countDocuments({ role: "user", isActive: true })
      .exec();
    const viewerCount = await this.userModel
      .countDocuments({ role: "viewer", isActive: true })
      .exec();

    return {
      total: totalUsers,
      byRole: {
        admin: adminCount,
        manager: managerCount,
        user: userCount,
        viewer: viewerCount,
      },
    };
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
        department: "IT",
        permissions: [
          "read",
          "write",
          "delete",
          "manage_users",
          "manage_sensors",
        ],
        timezone: "UTC",
      });
    }

    if (!userExists) {
      const bcrypt = require("bcryptjs");
      await this.create({
        email: "user@example.com",
        password: await bcrypt.hash("user123", 10),
        name: "Regular User",
        role: "user",
        department: "Operations",
        permissions: ["read"],
        timezone: "UTC",
      });
    }
  }
}
