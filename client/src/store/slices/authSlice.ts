import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API Base URL - Python LLM Server
const API_BASE_URL = "http://localhost:8001";

// Types
export interface User {
  id: number;
  firstName: string;
  username: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  jwtToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  jwtToken: localStorage.getItem("jwtToken"),
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Login to Python LLM Server - it handles MCP integration internally
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: credentials.username,
        password: credentials.password,
      });

      if (!loginResponse.data.success) {
        return rejectWithValue(loginResponse.data.error || "Login failed");
      }

      const { token, user } = loginResponse.data.data;

      return {
        user,
        token,
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      const axiosError = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.error || "Network error occurred"
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.jwtToken = null;
      state.error = null;
      localStorage.removeItem("jwtToken");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.jwtToken = action.payload.token;
        state.error = null;
        localStorage.setItem("jwtToken", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
