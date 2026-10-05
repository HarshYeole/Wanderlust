import axios from "axios";

const api = axios.create({
  // Uses the same computer's LAN address when the site is opened on a phone.
  baseURL: process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
