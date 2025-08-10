import { UsersService } from "./users.service";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: any): Promise<import("./user.schema").UserDocument>;
    findAll(): Promise<import("./user.schema").UserDocument[]>;
    findOne(id: string): Promise<import("./user.schema").UserDocument>;
    update(id: string, updateUserDto: any): Promise<import("./user.schema").UserDocument>;
    remove(id: string): Promise<void>;
}
