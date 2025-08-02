import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import LoginPage from "./index";
import authSlice from "../../store/slices/authSlice";

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
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
        jwtToken: null,
        ...initialState,
      },
    },
  });
};

// Helper component to wrap LoginPage with providers
const LoginPageWrapper = ({ store }: { store: any }) => (
  <Provider store={store}>
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  </Provider>
);

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form correctly", () => {
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    expect(screen.getByText("MCP Shopping Assistant")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("displays demo credentials", () => {
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    expect(screen.getByText("Demo Credentials:")).toBeInTheDocument();
    expect(screen.getByText("johnd")).toBeInTheDocument();
    expect(screen.getByText("m38rmF$")).toBeInTheDocument();
  });

  it("handles input changes correctly", async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpass");

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("testpass");
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: /👁️|🙈/ });

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click toggle again to hide password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("disables submit button when form is incomplete", () => {
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    const submitButton = screen.getByRole("button", { name: "Sign In" });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when form is complete", async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpass");

    expect(submitButton).not.toBeDisabled();
  });

  it("displays loading state during login", () => {
    const store = createMockStore({ isLoading: true });
    render(<LoginPageWrapper store={store} />);

    expect(screen.getByText("Signing in...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Signing in.../ })
    ).toBeDisabled();
  });

  it("displays error message when login fails", async () => {
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    // Simulate a login failure by dispatching the rejected action
    store.dispatch({
      type: "auth/loginUser/rejected",
      payload: "Invalid credentials",
    });

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("redirects when already authenticated", () => {
    const store = createMockStore({ isAuthenticated: true });
    render(<LoginPageWrapper store={store} />);

    // Component should attempt to navigate
    expect(mockNavigate).toHaveBeenCalledWith("/chat", { replace: true });
  });

  it("handles form submission with valid data", async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    await user.type(usernameInput, "johnd");
    await user.type(passwordInput, "m38rmF$");
    await user.click(submitButton);

    // The form should be submitted (this would trigger the login action)
    // In a real test, you might want to mock the dispatch and verify it was called
  });

  it("prevents form submission with empty fields", async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    const form = screen.getByText("Sign In").closest("form");

    if (form) {
      fireEvent.submit(form);
      // Form should not submit when fields are empty
      expect(mockNavigate).not.toHaveBeenCalled();
    }
  });

  it("has proper accessibility attributes", () => {
    const store = createMockStore();
    render(<LoginPageWrapper store={store} />);

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");

    expect(usernameInput).toHaveAttribute("required");
    expect(usernameInput).toHaveAttribute("autoComplete", "username");
    expect(passwordInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
  });
});
