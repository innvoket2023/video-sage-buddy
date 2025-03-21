import axios from "axios";

const CLOUDINARY_UPLOAD_PRESET = "video_uploads";
const CLOUDINARY_CLOUD_NAME = "dmumfcdka";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

/**
 * Uploads a video file to Cloudinary.
 * @param {File} file - The video file to upload.
 * @param {string} title - The title of the video.
 * @param {string} description - The description of the video.
 * @param {function} onUploadProgress - Callback to track upload progress.
 * @returns {Promise<Object>} - The response from Cloudinary.
 */
export const uploadToCloudinary = async (
  file,
  title,
  description,
  onUploadProgress
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("resource_type", "video");
  formData.append("public_id", title.trim() || file.name);

  if (description.trim()) {
    formData.append("context", `description=${description.trim()}`);
  }

  const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
};

/**
 * Sends video information to the backend for processing.
 * @param {string} videoUrl - The URL of the uploaded video.
 * @param {string} publicId - The public ID of the video.
 * @param {string} title - The title of the video.
 * @param {string} description - The description of the video.
 * @param {function} onUploadProgress - Callback to track upload progress.
 * @returns {Promise<Object>} - The response from the backend.
 */
export const sendToBackend = async (
  videoUrl,
  publicId,
  title,
  description,
  onUploadProgress
) => {
  const backendData = {
    video_url: videoUrl,
    public_id: publicId,
    title,
    description: description.trim(),
  };

  const response = await axios.post(
    `${API_URL}/upload-and-store`,
    backendData,
    {
      headers: {
        "Content-Type": "application/json",
      },
      onUploadProgress,
    }
  );

  return response.data;
};
