import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_URL,
  withCredentials: true,
  timeout: 10000, // Optional: request timeout in ms
});
// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token or modify headers
    const token = localStorage.getItem("token"); // Example: fetching token
    if (token) {
      // Ensure headers exist and set the Authorization header
      config.headers = config.headers || {};
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    console.log("Request sent:", config);
    return config;
  },
  (error) => {
    // Handle request errors
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful responses
    console.log("Response received:", response.data);
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // Maybe redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;
