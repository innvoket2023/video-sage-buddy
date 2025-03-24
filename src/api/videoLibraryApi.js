import axios from "axios";
import { tokenManager } from "./authApi";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export const fetchVideos = async () => {
  try {
    const authHeader = tokenManager.getAuthHeader();

    const response = await axios.get(`${API_URL}/preview`, {
      headers: {
        ...authHeader, //^ Add JWT authorization header
      },
      withCredentials: true,
    });

    if (response.data.videos && Array.isArray(response.data.videos)) {
      return response.data.videos.map((video, index) => ({
        id: index + 1,
        title: video.publicID || "Untitled Video",
        description: video.description || "",
        thumbnail: parseThumbnailUrl(video.video_url),
        videoUrl: video.video_url,
        date: new Date().toISOString().split("T")[0], // Today's date
        status: video.processed ? "Processed" : "Processing",
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    // Handle unauthorized errors (401) by potentially redirecting to login
    if (error.response && error.response.status === 401) {
      tokenManager.removeToken(); // Clear invalid token
      // You might want to handle redirection to login here or in a higher component
    }
    throw error;
  }
};

export const deleteVideo = async (videoId) => {
  try {
    // Get authorization header from token manager
    const authHeader = tokenManager.getAuthHeader();

    await axios.delete(`${API_URL}/delete-video`, {
      data: { videoId }, // Added videoId for identifying which video to delete
      headers: {
        ...authHeader, // Add JWT authorization header
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      tokenManager.removeToken(); // Clear invalid token
    }
    throw error;
  }
};

export const parseThumbnailUrl = (videoUrl) => {
  if (!videoUrl) return "/placeholder.svg";
  const lastDotIndex = videoUrl.lastIndexOf(".");
  const versionRegex = /\/v\d+/g;
  const versionResult = videoUrl.match(versionRegex);
  const reqIndex = videoUrl.lastIndexOf(versionResult);
  if (lastDotIndex === -1) return videoUrl;
  let finalUrl = videoUrl.substring(0, lastDotIndex) + ".jpg";
  finalUrl =
    finalUrl.slice(0, reqIndex) + "/c_fill/so_auto" + finalUrl.slice(reqIndex);
  return finalUrl;
};
