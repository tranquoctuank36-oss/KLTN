"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  login as apiLogin,
  logout as apiLogout,
  logoutAll as apiLogoutAllDevices,
  refreshToken as apiGetRefreshToken,
} from "@/services/authService";
import { getUserProfile } from "@/services/userService";
import { User } from "@/types/user";
import api from "@/services/api";

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  refetchUser: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = ["token", "user", "csrf", "persist:root"];

const clearAuthClient = () => {
  STORAGE_KEYS.forEach((k) => {
    try {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k); 
    } catch {}
  });

  // 2) cookies không-HttpOnly nếu có
  Cookies.remove("token");
  Cookies.remove("refreshToken");
  Cookies.remove("csrf");

  // 3) header axios
  delete api.defaults.headers.common.Authorization;

  // 4) xóa anonymousId cũ để tránh conflict khi logout
  localStorage.removeItem("x-anonymous-id");

  // 5) sync đa tab
  localStorage.setItem("__app:logout", String(Date.now()));
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      setIsLoggedIn(true);
    } catch (e) {
      console.error("refetchUser failed:", e);
    }
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...patch } : (patch as User);
      try {
        localStorage.setItem("user", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token) {
          setIsLoggedIn(true);

          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.error("Failed to parse stored user:", e);
              setUser(null);
            }
          } else {
            // Nếu không có storedUser => gọi API để lấy user profile
            try {
              await refetchUser();
            } catch (err) {
              console.warn("Refetch user failed:", err);
              setIsLoggedIn(false);
              setUser(null);
            }
          }
        } else {
          // Không có token => chưa đăng nhập
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (err) {
        console.error("Init AuthContext error:", err);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        // ✅ Quan trọng: Dù success hay fail, vẫn phải set loading = false
        setLoading(false);
      }
    };

    init();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "__app:logout") {
        setIsLoggedIn(false);
        setUser(null);
        delete api.defaults.headers.common.Authorization;
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // localStorage.removeItem("user");
      // setUser(null);
      
      const res = await apiLogin({ email, password });
      const { accessToken } = res.data;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      localStorage.setItem("token", accessToken);
      Cookies.set("token", accessToken, {
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
      });
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      try {
        const refreshRes = await apiGetRefreshToken();
        const newAccessToken = refreshRes.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          Cookies.set("token", newAccessToken, {
            sameSite: "Lax",
            secure: process.env.NODE_ENV === "production",
          });
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        }
        await refetchUser();
        setIsLoggedIn(true);
      } catch (e) {
        console.error("❌ Failed to get refresh token:", e);
      }
      // await refetchUser();
      //   setIsLoggedIn(true);
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Clear state FIRST to prevent any API calls
      setIsLoggedIn(false);
      setUser(null);
      
      await apiLogout();
      clearAuthClient();
    } catch (err) {
      console.error("Logout API failed:", err);
      clearAuthClient(); // Clear even if logout API fails
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
    }
  };

  const logoutAll = async () => {
    setLoading(true);
    try {
      // Clear state FIRST to prevent any API calls
      setIsLoggedIn(false);
      setUser(null);
      
      await apiLogoutAllDevices();
      clearAuthClient();
    } catch (err) {
      console.error("Logout All API failed:", err);
      clearAuthClient(); // Clear even if logout API fails
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        logoutAll,
        loading,
        user,
        updateUser,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
