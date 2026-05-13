import apiClient from "./apiClient";

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
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth);
    if (data.avatarFile) formData.append("avatarFile", data.avatarFile);

    const response = await apiClient.post<{ message: string }>("/api/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
