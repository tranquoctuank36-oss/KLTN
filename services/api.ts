import axios from "axios";
import toast from "react-hot-toast";
import { Routes } from "@/lib/routes";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export type DecodedToken = { exp: number; [k: string]: any };

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
  


let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

const onTokenRefreshed = (token: string) => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

const addSubscriber = (cb: (token: string) => void) => {
  subscribers.push(cb);
};

const hardLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common.Authorization;

  // đồng bộ các tab
  localStorage.setItem("__app:logout", String(Date.now()));

  toast.error("Phiên làm việc của bạn đã hết hạn, vui lòng đăng nhập lại!", {
    duration: 2000,
    position: "top-center",
  });

  setTimeout(() => {
    window.location.href = Routes.home();
  }, 2000);
};

// 🧠 Kiểm tra accessToken hết hạn chưa
function isTokenExpired(token: string, bufferSeconds = 30) {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now + bufferSeconds;
  } catch {
    return true;
  }
}

// 🧩 Interceptor tự động refresh accessToken
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");

  // Nếu token sắp hết hạn
  if (token && isTokenExpired(token)) {
    if (!isRefreshing) {
      isRefreshing = true;
      try { 
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken =
          res.data?.accessToken || res.data?.data?.accessToken;
        if (!newAccessToken) throw new Error("No new accessToken received");

        localStorage.setItem("token", newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        onTokenRefreshed(newAccessToken);
        token = newAccessToken;

        console.log("Refreshed accessToken successfully!");
      } catch (err: any) {
        hardLogout();
      } finally {
        isRefreshing = false;
      }
    }

    // Nếu có request đang chờ, đợi token mới rồi tiếp tục
    return new Promise((resolve) => {
      addSubscriber((newToken) => {
        if (config.headers)
          config.headers.Authorization = `Bearer ${newToken}`;
        resolve(config);
      });
    });
  }

  // Nếu token còn hạn thì thêm vào header
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
