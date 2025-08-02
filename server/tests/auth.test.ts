import request from "supertest";
import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import authRouter from "../src/routes/auth";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock jwt
jest.mock("jsonwebtoken");
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("Authentication Endpoints - Unit Tests", () => {
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
    it("should authenticate valid credentials successfully", async () => {
      // Mock JWT payload that will be returned by jwt.decode
      const mockJwtPayload = {
        sub: "1",
        user: "johnd",
        iat: 1516239022,
      };

      // Mock jwt.decode to return our payload
      mockedJwt.decode.mockReturnValueOnce(mockJwtPayload);

      // Mock successful Fake Store API response with any token
      mockedAxios.post.mockResolvedValueOnce({
        data: { token: "any-token-will-work-now" },
      });

      // Mock user details response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 1,
          username: "johnd",
          email: "john@gmail.com",
          name: { firstname: "john", lastname: "doe" },
        },
      });

      const response = await request(app).post("/login").send({
        username: "johnd",
        password: "m38rmF$",
      });

      // Debug output if test fails
      if (response.status !== 200) {
        console.log("Test Debug - Response Status:", response.status);
        console.log("Test Debug - Response Body:", response.body);
        console.log(
          "Test Debug - Axios Mock Call Count (post):",
          mockedAxios.post.mock.calls.length
        );
        console.log(
          "Test Debug - Axios Mock Call Count (get):",
          mockedAxios.get.mock.calls.length
        );
        console.log("Test Debug - Mock calls:", mockedAxios.post.mock.calls);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.username).toBe("johnd");
      expect(response.body.data.token).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      // Mock failed Fake Store API response
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          statusText: "Unauthorized",
        },
      });

      const response = await request(app)
        .post("/login")
        .send({
          username: "invalid",
          password: "wrong",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("EXTERNAL_API_ERROR");
      expect(response.body.error.message).toContain("Authentication failed");
    });

    it("should reject requests with missing credentials", async () => {
      const response = await request(app)
        .post("/login")
        .send({
          username: "johnd",
          // missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("MISSING_PARAMETERS");
      expect(response.body.error.message).toContain(
        "Username and password are required"
      );
    });

    it("should handle network errors gracefully", async () => {
      // Mock network error
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      const response = await request(app)
        .post("/login")
        .send({
          username: "johnd",
          password: "m38rmF$",
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
    });

    it("should handle malformed token responses", async () => {
      // Mock response without token
      mockedAxios.post.mockResolvedValueOnce({
        data: { message: "Login successful" }, // missing token
      });

      const response = await request(app)
        .post("/login")
        .send({
          username: "johnd",
          password: "m38rmF$",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("no token received");
    });
  });
});
