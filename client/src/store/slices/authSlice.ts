import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// API Base URL - adjust based on your backend server
const API_BASE_URL = "http://localhost:3000";

// Types
export interface User {
  id: number;
  firstName: string;
  username: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Only present at creation time
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  jwtToken: string | null;
  openaiApiKey: string | null;
  mcpApiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  jwtToken: localStorage.getItem("jwtToken"),
  openaiApiKey: localStorage.getItem("openaiApiKey"),
  mcpApiKeys: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { username: string; password: string; openaiApiKey: string },
    { rejectWithValue }
  ) => {
    try {
      // Login to backend
      const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
        username: credentials.username,
        password: credentials.password,
      });

      if (!loginResponse.data.success) {
        return rejectWithValue(loginResponse.data.error || "Login failed");
      }

      const { token, user } = loginResponse.data.data;

      // Generate MCP API key
      const apiKeyResponse = await axios.post(
        `${API_BASE_URL}/api-keys`,
        { name: "Default MCP Key" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!apiKeyResponse.data.success) {
        return rejectWithValue(
          apiKeyResponse.data.error || "Failed to generate API key"
        );
      }

      return {
        user,
        token,
        openaiApiKey: credentials.openaiApiKey,
        mcpApiKey: apiKeyResponse.data.data,
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

export const generateApiKey = createAsyncThunk(
  "auth/generateApiKey",
  async (name: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.jwtToken;

      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api-keys`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        return rejectWithValue(
          response.data.error || "Failed to generate API key"
        );
      }

      return response.data.data;
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

export const fetchApiKeys = createAsyncThunk(
  "auth/fetchApiKeys",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.jwtToken;

      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${API_BASE_URL}/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.success) {
        return rejectWithValue(
          response.data.error || "Failed to fetch API keys"
        );
      }

      return response.data.data;
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

export const revokeApiKey = createAsyncThunk(
  "auth/revokeApiKey",
  async (keyId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.jwtToken;

      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.put(
        `${API_BASE_URL}/api-keys/${keyId}/revoke`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        return rejectWithValue(
          response.data.error || "Failed to revoke API key"
        );
      }

      return keyId;
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

export const deleteApiKey = createAsyncThunk(
  "auth/deleteApiKey",
  async (keyId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.jwtToken;

      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.delete(`${API_BASE_URL}/api-keys/${keyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.success) {
        return rejectWithValue(
          response.data.error || "Failed to delete API key"
        );
      }

      return keyId;
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
      state.openaiApiKey = null;
      state.mcpApiKeys = [];
      state.error = null;
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("openaiApiKey");
    },
    clearError: (state) => {
      state.error = null;
    },
    updateOpenaiApiKey: (state, action: PayloadAction<string>) => {
      state.openaiApiKey = action.payload;
      localStorage.setItem("openaiApiKey", action.payload);
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
        state.openaiApiKey = action.payload.openaiApiKey;
        state.mcpApiKeys = [action.payload.mcpApiKey];
        state.error = null;
        localStorage.setItem("jwtToken", action.payload.token);
        localStorage.setItem("openaiApiKey", action.payload.openaiApiKey);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate API key
    builder
      .addCase(generateApiKey.fulfilled, (state, action) => {
        state.mcpApiKeys.push(action.payload);
      })
      .addCase(generateApiKey.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch API keys
    builder
      .addCase(fetchApiKeys.fulfilled, (state, action) => {
        state.mcpApiKeys = action.payload;
      })
      .addCase(fetchApiKeys.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Revoke API key
    builder
      .addCase(revokeApiKey.fulfilled, (state, action) => {
        const keyIndex = state.mcpApiKeys.findIndex(
          (key) => key.id === action.payload
        );
        if (keyIndex !== -1) {
          state.mcpApiKeys[keyIndex].isActive = false;
        }
      })
      .addCase(revokeApiKey.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete API key
    builder
      .addCase(deleteApiKey.fulfilled, (state, action) => {
        state.mcpApiKeys = state.mcpApiKeys.filter(
          (key) => key.id !== action.payload
        );
      })
      .addCase(deleteApiKey.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, updateOpenaiApiKey } = authSlice.actions;
export default authSlice.reducer;
