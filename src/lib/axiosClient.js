// axiosClient.js (SAFE - مثل نسخه قبل)

import axios from "axios";

const hostname = window.location.hostname;

let API_BASE_URL;

if (hostname === "localhost" || hostname === "127.0.0.1") {
  API_BASE_URL = "http://127.0.0.1:5500/api";
} 
else if (hostname === "ras.innonex.ca") {
  API_BASE_URL = "http://ras.innonex.ca/api"; 
} 
else {
  API_BASE_URL = "http://38.129.27.9/api";
}

console.log("🌍 API BASE URL =", API_BASE_URL);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15500,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

// فقط مثل قبل → یک token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ================================
// 🔥 اصلاح مهم برای جلوگیری از برگشت دعوت‌نامه
// ================================
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response || error.message);

    // اگر 401 بود
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");

      const path = window.location.pathname;

      // 🔥 اگر مسیر رزیدنت است یا مسیر دعوت/فعال‌سازی است
      //   → دیگر نرو به login/manager
      if (
        path.startsWith("/resident") ||
        path.startsWith("/invite") ||
        path.startsWith("/activation")
      ) {
        // لاگین رزیدنت
        window.location.href = "/login/resident";
      } 
      else {
        // مسیرهای مدیر مثل قبل
        window.location.href = "/login/manager";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
