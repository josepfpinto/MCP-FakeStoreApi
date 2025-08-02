import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    href: "http://localhost:5173",
    origin: "http://localhost:5173",
    pathname: "/",
    search: "",
    hash: "",
  },
  writable: true,
});
