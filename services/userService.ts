import { User } from "@/types/user";
import api from "./api";
import { UserAddress } from "@/types/userAddress";

export async function getUserProfile(): Promise<User> {
  try {
    // Gọi cả 2 API song song
    const [meRes, profileRes] = await Promise.all([
      api.get("/me"),
      api.get("/me/profile")
    ]);
    
    const meData = meRes.data.data;
    const profileData = profileRes.data.data;
    
    // Merge data từ cả 2 API
    const user: User = {
      id: meData.id,
      email: meData.email,
      roles: meData.roles || [],
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      gender: profileData.gender,
      dateOfBirth: profileData.dateOfBirth,
      phoneNumber: profileData.phoneNumber,
      createdAt: meData.createdAt || profileData.createdAt,
    };
    
    return user;
  } catch (error: any) {
    console.error("Fetch user profile failed:", error.response || error.message);
    throw error;
  }
}

export async function updateUserProfile(data: Partial<User>): Promise<User> {
  try {
    console.log("Payload gửi lên:", data);
    const res = await api.patch("/me/profile", data);
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
    const rawData = res.data?.data || [];
    
    // Map API response to UserAddress format
    const addresses: UserAddress[] = rawData.map((addr: any) => ({
      id: addr.id,
      userId: addr.userId,
      recipientName: addr.recipientName,
      recipientEmail: addr.recipientEmail,
      recipientPhone: addr.recipientPhone,
      addressLine: addr.addressLine,
      provinceName: addr.province?.name || "",
      districtName: addr.district?.name || "",
      wardName: addr.ward?.name || "",
      provinceId: addr.province?.id || "",
      districtId: addr.district?.id || "",
      wardId: addr.ward?.id || "",
      isDefault: addr.isDefault,
    }));
    
    return addresses;
  } catch (error: any) {
    console.error("Failed to fetch addresses:", error?.response?.data || error);
    return [];
  }
}

export async function getAddressById(addressId: string): Promise<UserAddress> {
  try {
    const res = await api.get(`/me/addresses/${addressId}`);
    const addr = res.data?.data;
    
    // Map API response to UserAddress format
    return {
      id: addr.id,
      userId: addr.userId,
      recipientName: addr.recipientName,
      recipientEmail: addr.recipientEmail,
      recipientPhone: addr.recipientPhone,
      addressLine: addr.addressLine,
      provinceName: addr.province?.name || "",
      districtName: addr.district?.name || "",
      wardName: addr.ward?.name || "",
      provinceId: String(addr.province?.id) || "",
      districtId: String(addr.district?.id) || "",
      wardId: String(addr.ward?.id) || "",
      isDefault: addr.isDefault,
    };
  } catch (error: any) {
    console.error("Failed to fetch address:", error?.response?.data || error);
    throw error;
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

