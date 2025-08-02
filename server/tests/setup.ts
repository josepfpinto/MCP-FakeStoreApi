// Test setup file
import { jest } from "@jest/globals";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "3001";
