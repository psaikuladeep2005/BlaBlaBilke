// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Helper function to handle and display API errors gracefully
const handleAuthError = (error, operation) => {
  let errorMessage = `${operation} failed: An unknown error occurred.`;

  if (error.response) {
    // Server replied with an error status (4xx, 5xx)
    console.error(`${operation} failed (Server Error):`, error.response.data);

    // Try to extract a meaningful error message from Djoser/DRF response
    if (error.response.data.non_field_errors) {
      errorMessage = `${operation} failed: ${error.response.data.non_field_errors[0]}`;
    } else if (error.response.data.detail) {
      errorMessage = `Error: ${error.response.data.detail}`;
    } else if (error.response.data.username) {
      errorMessage = `Username error: ${error.response.data.username.join(
        ", "
      )}`;
    } else if (error.response.status === 400 || error.response.status === 401) {
      errorMessage = `Authentication failed. Check your credentials.`;
    } else {
      errorMessage = `${operation} failed due to server validation. Check console for details.`;
    }
  } else if (error.request) {
    // The request was made but no response was received (e.g., server is down)
    console.error(`${operation} failed (No Response):`, error.request);
    errorMessage = `Could not connect to the server. Is your **Django backend running**?`;
  } else {
    // Something happened in setting up the request that triggered an error
    console.error(`${operation} failed (Request Setup Error):`, error.message);
    errorMessage = `${operation} failed: ${error.message}`;
  }

  alert(errorMessage);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data if a token exists
    if (authToken) {
      getUserData(authToken);
    }
  }, [authToken]);

  // --- LOGIN FUNCTION (Improved Error Handling) ---
  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/token/login/", {
        username,
        password,
      });
      const token = response.data.auth_token;

      setAuthToken(token);
      localStorage.setItem("authToken", token);

      await getUserData(token);
      navigate("/"); // Redirect to home page
    } catch (error) {
      handleAuthError(error, "Login");
    }
  };

  // --- REGISTER FUNCTION (Adopted your robust logic) ---
  const register = async (userData) => {
    try {
      await api.post("/auth/users/", userData);
      alert("Registration successful! You can now log in.");
      navigate("/login"); // Redirect to login page
    } catch (error) {
      handleAuthError(error, "Registration");
    }
  };

  // --- LOGOUT FUNCTION (Fixed and complete) ---
  const logout = async () => {
    // Local cleanup function (runs regardless of server response)
    const performLocalCleanup = () => {
      setAuthToken(null);
      setUser(null);
      localStorage.removeItem("authToken");
      navigate("/login");
    };

    try {
      // Attempt server-side token cleanup
      await api.post("/auth/token/logout/", null, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
    } catch (error) {
      // Log the error, but proceed with local cleanup,
      // as the goal (being logged out) is achieved locally anyway.
      console.warn(
        "Logout error (Server may not have logged out, but local state is cleared):",
        error
      );
    }

    // Always perform local cleanup after attempting server-side logout
    performLocalCleanup();
  };

  // --- GET USER DATA FUNCTION (Improved Error Handling) ---
  const getUserData = async (token) => {
    try {
      const response = await api.get("/auth/users/me/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch user data. Token might be invalid or expired.",
        error
      );
      // If fetching user data fails, the token is unusable, so clear it locally.
      setAuthToken(null);
      setUser(null);
      localStorage.removeItem("authToken");
      // Note: We don't navigate here to avoid forced redirects on every page load
    }
  };

  const contextData = {
    user,
    authToken,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
