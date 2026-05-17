import apiClient from "./apiClient";
import { clearApiCache } from "./apiCache";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  avatarFile?: File;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}

export const authService = {
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<{ message: string }>("/api/auth/register", {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  },

  logout: () => {
    clearApiCache();
    localStorage.removeItem("token");
  },
};
