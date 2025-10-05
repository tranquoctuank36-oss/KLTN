import { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth";
import api from "./api";

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post("/auth/login", payload);
  return res.data;
}

export async function logout(): Promise<void> {
  try {
    const res = await api.post("/auth/logout-current", {}, {withCredentials: true} );

    console.log("Logout success:", res.data);

    localStorage.removeItem("token");
  } catch (err: any) {
    console.error("Logout API failed:", err.response?.data || err.message);
  }
}

