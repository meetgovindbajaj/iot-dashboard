import { Model } from "mongoose";
import { User, UserDocument } from './user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(createUserDto: Partial<User>): Promise<UserDocument>;
    findAll(): Promise<UserDocument[]>;
    findById(id: string): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    update(id: string, updateUserDto: Partial<User>): Promise<UserDocument>;
    remove(id: string): Promise<void>;
    seedDefaultUsers(): Promise<void>;
}
