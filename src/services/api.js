import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Replace with your Flask server URL

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
};

export const storeTranscript = async (transcript, videoName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/store`, {
      transcript,
      video_name: videoName,
    });
    return response.data;
  } catch (error) {
    console.error("Error storing transcript:", error);
    throw error;
  }
};

export const queryVideo = async (query) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/query`, {
      query,
    });
    return response.data;
  } catch (error) {
    console.error("Error querying video:", error);
    throw error;
  }
};
