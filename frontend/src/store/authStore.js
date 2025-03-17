import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,

  // Send OTP for registration
  sendOtp: async (rollNumber) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/send-otp`, { rollNumber });
      set({ isLoading: false });
      toast.success("OTP sent successfully");
      return response.data; // Should include masked phone number
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send OTP";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Verify OTP for registration
  verifyOtp: async (rollNumber, otp, metamaskKey) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, { rollNumber, otp, metamaskKey });
      
      // Store token in localStorage for persistence
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid OTP";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      console.log(error);
      throw error;
    }
  },

  // Login with roll number (checks if metamask key exists)
  login: async (rollNumber) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, { rollNumber });
      
      // Store token in localStorage for persistence
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false
      });
      toast.success("Login successful");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post(`${API_URL}/logout`);
      // Clear token from localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem("processedTxs");
      set({ user: null, isAuthenticated: false, isLoading: false });
      toast.success("Logged out successfully");
    } catch (error) {
      set({ isLoading: false });
      toast.error("Error logging out");
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      
      // If no token exists, user is not authenticated
      if (!token) {
        set({ isCheckingAuth: false, isAuthenticated: false });
        return;
      }
      
      // Set token in headers for the request
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get(`${API_URL}/check-auth`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false
      });
    } catch (error) {
      // Clear token on auth error
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      set({ isCheckingAuth: false, isAuthenticated: false });
    }
  }
}));