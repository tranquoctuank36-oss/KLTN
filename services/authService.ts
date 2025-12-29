import { User } from "@/types/user";
import api from "./api";
import { AxiosError } from "axios";

export type RegisterPayload = {
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
};

const handleError = (err: unknown, msg: string) => {
  const error = err as AxiosError;
  console.error(`${msg}:`, error.response?.data || error.message);
  throw err;
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  try {
    const res = await api.post("/auth/register", payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  try {
    const res = await api.post("/auth/login", payload);
    return res.data;
  } catch (err) {
    return handleError(err, "Login failed");
  }
};

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const res = await api.post("/auth/refresh-token", { }, { withCredentials: true });
    return res.data;
  } catch (err) {
    return handleError(err, "Refresh token failed");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.delete("/auth/session", {});
  } catch (err) {
    return handleError(err, "Logout failed");
  }
};

export const logoutAll = async (): Promise<void> => {
  try {
    await api.delete("/auth/sessions", {});
  } catch (err) {
    return handleError(err, "Logout all failed");
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const res = await api.post("/auth/verify-email", { token });
    return res.data;
  } catch (err) {
    return handleError(err, "Verify email failed");
  }
};

export const resendVerification = async (email: string) => {
  try {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  } catch (err) {
    return handleError(err, "Resend verification failed");
  }
};

export const forgotPassword = async (email: string) => {
  try {
    await api.post("/auth/forgot-password", { email });
  } catch (err) {
    return handleError(err, "Forgot password failed");
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    await api.post("/auth/reset-password", { token, newPassword });
  } catch (err) {
    return handleError(err, "Reset password failed");
  }
};
