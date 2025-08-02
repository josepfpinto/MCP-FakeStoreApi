import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Navigation from "./index";
import authSlice from "../../store/slices/authSlice";

// Mock window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: {
          id: 1,
          username: "johnd",
          firstName: "John",
          ...initialState,
        },
        isLoading: false,
        error: null,
        jwtToken: "mock-token",
      },
    },
  });
};

// Helper component to wrap Navigation with providers
const NavigationWrapper = ({ store }: { store: any }) => (
  <Provider store={store}>
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  </Provider>
);

describe("Navigation Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with user information", () => {
    const store = createMockStore();
    render(<NavigationWrapper store={store} />);

    expect(screen.getByText("MCP")).toBeInTheDocument();
    expect(screen.getByText("Shopping Assistant")).toBeInTheDocument();
    expect(screen.getByText("💬 Chat")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("@johnd")).toBeInTheDocument();
  });

  it("displays user avatar with first letter of firstName", () => {
    const store = createMockStore();
    render(<NavigationWrapper store={store} />);

    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("displays default avatar when firstName is not available", () => {
    const store = createMockStore({ firstName: null });
    render(<NavigationWrapper store={store} />);

    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("handles logout confirmation - user confirms", () => {
    mockConfirm.mockReturnValue(true);
    const store = createMockStore();
    render(<NavigationWrapper store={store} />);

    const logoutButton = screen.getByTitle("Logout");
    fireEvent.click(logoutButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      "Are you sure you want to logout?"
    );
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("handles logout cancellation - user cancels", () => {
    mockConfirm.mockReturnValue(false);
    const store = createMockStore();
    render(<NavigationWrapper store={store} />);

    const logoutButton = screen.getByTitle("Logout");
    fireEvent.click(logoutButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      "Are you sure you want to logout?"
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders brand section as clickable link to chat", () => {
    const store = createMockStore();
    render(<NavigationWrapper store={store} />);

    const brandLink = screen.getByRole("link", {
      name: /MCP Shopping Assistant/i,
    });
    expect(brandLink).toHaveAttribute("href", "/chat");
  });

  it("renders chat link with proper navigation", () => {
    const store = createMockStore();
    render(<NavigationWrapper store={store} />);

    const chatLink = screen.getByRole("link", { name: /💬 Chat/i });
    expect(chatLink).toHaveAttribute("href", "/chat");
  });
});
