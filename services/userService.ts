import { User } from "@/types/user";
import api from "./api";
import { UserAddress } from "@/types/userAddress";

export async function getUserProfile(): Promise<User> {
  try {
    const res = await api.get("/me");
    return res.data.data;
  } catch (error: any) {
    console.error("Fetch user profile failed:", error.response || error.message);
    throw error;
  }
}

export async function updateUserProfile(data: Partial<User>): Promise<User> {
  try {
    console.log("Payload gửi lên:", data);
    const res = await api.patch("/me", data);
    return res.data.data;
  } catch (error: any) {
    console.error("Update user profile failed:", error.response || error.message);
    throw error;
  }
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const res = await api.patch("/me/password", data);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}

export const getMyOrders = async () => {
  try {
    const res = await api.get("/me/orders");
    return res.data?.data;
  } catch (err) {
    console.error("❌ getMyOrders error:", err);
    throw err;
  }
};

export async function createAddress(payload: any) {
  try {
    const res = await api.post("/me/addresses", payload);
    return res.data;
  } catch (error: any) {
    console.error("Failed to create address:", error?.response?.data || error);
    throw error;
  }
}

export async function getAddresses(): Promise<UserAddress[]> {
  try {
    const res = await api.get("/me/addresses");
    return res.data?.data;
  } catch (error: any) {
    console.error("Failed to fetch addresses:", error?.response?.data || error);
    return [];
  }
}

export async function updateAddress(addressId: string, payload: UserAddress) {
  try {
    const res = await api.patch(`/me/addresses/${addressId}`, payload);
    return res.data;
  } catch (error: any) {
    console.error("Failed to update address:", error?.response?.data || error);
    throw error;
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const res = await api.delete(`/me/addresses/${addressId}`);
    return res.data;
  } catch (error: any) {
    console.error("Failed to delete address:", error?.response?.data || error);
    throw error;
  }
}

