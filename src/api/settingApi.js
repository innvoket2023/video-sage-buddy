import axios from "axios";
import { tokenManager } from "./authApi";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const apiInstance = axios.create({
  baseURL: API_URL,
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
const fetchCredentials = async () => {
  try {
    const res = await apiInstance.get("/api/get_email_uname");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const changeCredentials = async (username, email) => {
  try {
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    if (Object.keys(updateData).length > 0) {
      const res = await apiInstance.put("/api/reset-email-uname", updateData);
      return res.data;
    }
  } catch (error) {
    console.error(
      "Error updating credentials:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export { changeCredentials, fetchCredentials };
