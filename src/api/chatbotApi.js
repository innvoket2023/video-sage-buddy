import axios from "axios";
import { tokenManager } from "./authApi";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const apiInstance = axios.create({
  baseURL: API_URL,
});

//^ Add an interceptor to include the auth token in every request
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

export const fetchVideos = async () => {
  try {
    const response = await apiInstance.get("/preview");
    return response.data.videos || [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

export const queryVideo = async (query, videoName) => {
  try {
    const response = await apiInstance.post(
      "/query",
      {
        query,
        video_name: videoName,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error querying video:", error);
    throw error;
  }
};

export const sendVideoURL = async (videoUrl) => {
  try {
    const response = await apiInstance.post("/create_clone", {
      cloudinary_url: videoUrl,
    });
    console.log(response);
    return response;
  } catch (error) {
    if (error.response.status == 409) {
      console.log("voice clone already exists");
    } else {
      console.error("Error Sending video url:", error);
      throw error;
    }
  }
};

export const readMessage = async (videoUrl, message) => {
  try {
    const response = await apiInstance.post(
      "/speak_message",
      {
        cloudinary_url: videoUrl,
        message: message,
      },
      {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error reading the message:", error);
    throw error;
  }
};
