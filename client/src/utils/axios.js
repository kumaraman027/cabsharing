// src/utils/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://cabsharing-10.onrender.com", // 👈 your backend render URL
  withCredentials: true, // ✅ Send cookies/session
});

export default instance;
