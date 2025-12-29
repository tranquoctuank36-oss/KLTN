import { ShippingFeePayload } from "@/types/shipping";
import api from "./api";

export type Province = { ProvinceID: string; ProvinceName: string };
export type District = { DistrictID: string; DistrictName: string };
export type Ward = { WardCode: string; WardName: string };

export async function getProvinces(): Promise<Province[]> {
  try {
    const res = await api.get("/shipping/provinces");
    console.log("getProvinces response:", res.data);

    const provinces = res.data?.data || [];
    return Array.isArray(provinces) ? provinces : [];
  } catch (err) {
    console.error("getProvinces error:", err);
    return [];
  }
}

export async function getDistricts(provinceId: string): Promise<District[]> {
  try {
    const res = await api.get("/shipping/districts", {
      params: { provinceId },
    });
    console.log("getDistricts response:", res.data);

    const districts = res.data?.data || [];
    return Array.isArray(districts) ? districts : [];
  } catch (err) {
    console.error("getDistricts error:", err);
    return [];
  }
}

export async function getWards(districtId: string): Promise<Ward[]> {
  try {
    const res = await api.get("/shipping/wards", {
      params: { districtId },
    });
    console.log("getWards response:", res.data);

    const wards = res.data?.data || [];
    return Array.isArray(wards) ? wards : [];
  } catch (err) {
    console.error("getWards error:", err);
    return [];
  }
}

export const getShippingFee = async (payload: ShippingFeePayload): Promise<number> => {
  try {
    const res = await api.post("/shipping/fee", payload);
    const fee =
      res.data?.data?.total
    return Number(fee);
  } catch (err) {
    console.error("Calculate ShippingFee error:", err);
    throw err;
  }
};
