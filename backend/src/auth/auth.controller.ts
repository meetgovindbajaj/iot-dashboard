import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { IsEmail, IsString, IsNotEmpty, IsOptional } from "class-validator";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // Find user by email
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      // For demo purposes, also check plain text passwords (admin123, user123)
      let isPasswordValid = false;

      // Try hashed password comparison first
      if (user.password && user.password.startsWith("$2b$")) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // For demo: also allow plain text comparison
        isPasswordValid = password === user.password;
      }

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid credentials");
      }

      // Generate JWT token
      const payload = { email: user.email, sub: user._id, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      // Update last login
      await this.usersService.updateLastLogin(user._id);

      return {
        access_token: accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          permissions: user.permissions,
          theme: user.theme,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new UnauthorizedException("Invalid credentials");
    }
  }

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new UnauthorizedException("User already exists");
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await this.usersService.create({
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        role: "user",
        isActive: true,
      });

      // Generate JWT token
      const payload = {
        email: newUser.email,
        sub: newUser._id,
        role: newUser.role,
      };
      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new UnauthorizedException("Registration failed");
    }
  }
}
