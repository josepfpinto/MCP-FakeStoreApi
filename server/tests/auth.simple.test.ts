import request from "supertest";
import express from "express";
import axios from "axios";
import authRouter from "../src/routes/auth";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Authentication Endpoints - Simple Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    // Create test app
    app = express();
    app.use(express.json());
    app.use("/", authRouter);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("POST /login", () => {
    it("should handle missing credentials", async () => {
      const response = await request(app).post("/login").send({
        username: "johnd",
        // missing password
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should handle axios network errors", async () => {
      // Mock network error
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      const response = await request(app).post("/login").send({
        username: "johnd",
        password: "m38rmF$",
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it("should handle invalid credentials from API", async () => {
      // Mock failed Fake Store API response
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          statusText: "Unauthorized",
        },
      });

      const response = await request(app).post("/login").send({
        username: "invalid",
        password: "wrong",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
