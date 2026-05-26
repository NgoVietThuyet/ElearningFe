import apiClient from "./apiClient";

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  teachingExperienceYears?: number;
  shortBio?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const profileApi = {
  getProfile: () => apiClient.get<UserProfile>("/api/profile"),
  updateProfile: (formData: FormData) => 
    apiClient.put<{ message: string; user: UserProfile }>("/api/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};
