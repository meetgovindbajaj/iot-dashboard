import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("Authentication (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("/auth/login (POST)", () => {
    it("should login with valid credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin@example.com",
          password: "admin123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("admin@example.com");
    });

    it("should reject invalid credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin@example.com",
          password: "wrongpassword",
        })
        .expect(401);
    });
  });

  describe("/auth/register (POST)", () => {
    it("should register a new user", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "newuser@example.com",
          password: "password123",
          name: "New User",
          role: "user",
        })
        .expect(201);

      expect(response.body.email).toBe("newuser@example.com");
      expect(response.body).not.toHaveProperty("password");
    });

    it("should not register duplicate email", async () => {
      // First registration
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "password123",
          name: "First User",
        })
        .expect(201);

      // Duplicate registration
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "password456",
          name: "Second User",
        })
        .expect(401);
    });
  });
});
