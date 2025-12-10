// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000", // Adjust if your backend runs on a different port/URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
