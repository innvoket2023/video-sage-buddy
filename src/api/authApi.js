import axios from "axios";
import Cookies from "js-cookie";
const API_BASE_URL = "http://localhost:5000/api";

const tokenManager = {
  setToken: (token) => {
    Cookies.set("authToken", token, {
      expires: 1,
      // httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
  },
  getToken: () => {
    return Cookies.get("authToken");
  },
  removeToken: () => {
    Cookies.remove("authToken");
  },
  getAuthHeader: () => {
    const token = Cookies.get("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

export const signUp = async (userName, email, password) => {
  if (userName && email && password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        username: userName,
        email,
        password,
      });
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

      //^ Store the token after successful login
      if (response.data.token) {
        tokenManager.setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  } else {
    console.log("All fields are required");
  }
};

export const signOut = () => {
  tokenManager.removeToken();
  return true;
};

export { tokenManager };
