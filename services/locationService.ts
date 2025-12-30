import api from "./api";
import { District, Province, Ward } from "@/types/location";

export async function getProvinces(): Promise<Province[]> {
  try {
    const res = await api.get("/location/provinces");

    const provinces = res.data?.data || [];
    return Array.isArray(provinces) ? provinces : [];
  } catch (err) {
    console.error("getProvinces error:", err);
    return [];
  }
}

export async function getDistricts(id: string): Promise<District[]> {
  try {
    const res = await api.get("/location/districts", {
      params: { provinceId: id },
    });

    const districts = res.data?.data || [];
    return Array.isArray(districts) ? districts : [];
  } catch (err) {
    console.error("getDistricts error:", err);
    return [];
  }
}

export async function getWards(id: string): Promise<Ward[]> {
  try {
    const res = await api.get("/location/wards", {
      params: { districtId: id },
    });

    const wards = res.data?.data || [];
    return Array.isArray(wards) ? wards : [];
  } catch (err) {
    console.error("getWards error:", err);
    return [];
  }
}