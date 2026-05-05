import axios from "axios";

const apiClient = axios.create({
  // baseURL: "http://localhost:5081", // Backend URL from launchSettings.json
  baseURL: "https://elearningbe-nq9w.onrender.com", // Backend URL from Render
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
