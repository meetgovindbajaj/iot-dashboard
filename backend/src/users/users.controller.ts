import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
} from "@nestjs/common";
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from "class-validator";
import { JwtAuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UsersService } from "./users.service";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(["admin", "manager", "user", "viewer"])
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsEnum(["light", "dark"])
  @IsOptional()
  theme?: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class UpdateRoleDto {
  @IsEnum(["admin", "manager", "user", "viewer"])
  @IsNotEmpty()
  role: string;

  @IsOptional()
  permissions?: string[];
}

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("admin")
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  findAll() {
    return this.usersService.findAll();
  }

  @Get("profile")
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.sub);
  }

  @Put("profile")
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, updateProfileDto);
  }

  @Put("change-password")
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    await this.usersService.changePassword(
      req.user.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
    return { message: "Password changed successfully" };
  }

  @Get("stats")
  @UseGuards(RolesGuard)
  @Roles("admin")
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get("role/:role")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  findByRole(@Param("role") role: string) {
    return this.usersService.findByRole(role);
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  findOne(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("admin")
  update(@Param("id") id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(":id/role")
  @UseGuards(RolesGuard)
  @Roles("admin")
  updateUserRole(
    @Param("id") id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.usersService.updateUserRole(
      id,
      updateRoleDto.role,
      updateRoleDto.permissions
    );
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("admin")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
