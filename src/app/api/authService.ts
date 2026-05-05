import apiClient from "./apiClient";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
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
    const response = await apiClient.post<{ message: string }>("/api/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};
