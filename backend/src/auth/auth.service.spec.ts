import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: "user123",
    email: "test@example.com",
    password: "hashedpassword",
    name: "Test User",
    role: "user",
    toObject: () => ({
      _id: "user123",
      email: "test@example.com",
      password: "hashedpassword",
      name: "Test User",
      role: "user",
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should return user data without password when credentials are valid", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser("test@example.com", "password");

      expect(result).toEqual({
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
      });
      expect(result).not.toHaveProperty("password");
    });

    it("should return null when user does not exist", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser("test@example.com", "password");

      expect(result).toBeNull();
    });

    it("should return null when password is incorrect", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        "test@example.com",
        "wrongpassword",
      );

      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return access token and user data for valid credentials", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue("jwt-token");

      const result = await service.login("test@example.com", "password");

      expect(result).toEqual({
        access_token: "jwt-token",
        user: {
          id: "user123",
          email: "test@example.com",
          role: "user",
          name: "Test User",
        },
      });
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login("test@example.com", "wrongpassword"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
