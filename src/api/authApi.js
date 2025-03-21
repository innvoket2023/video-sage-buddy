import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Replace with your Flask server URL

// export const uploadVideo = async (file) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   try {
//     const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error uploading video:", error);
//     throw error;
//   }
// };

// export const storeTranscript = async (transcript, videoName) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/store`, {
//       transcript,
//       video_name: videoName,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error storing transcript:", error);
//     throw error;
//   }
// };

// export const queryVideo = async (query) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/query`, {
//       query,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error querying video:", error);
//     throw error;
//   }
// };

export const signUp = async (userName, email, password) => {
  if (userName && email && password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        username: userName,
        email,
        password,
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error in sign up");
      throw error;
    }
  } else {
    console.log("All fields are required");
  }
};

export const signIn = async (user, password) => {
  if (user && password) {
    try {
      const loginData = user.includes("@")
        ? { email: user, password }
        : { username: user, password };

      const response = await axios.post(`${API_BASE_URL}/login`, loginData);

      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("All fields are required");
  }
};
