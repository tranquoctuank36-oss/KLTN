import { Order } from "@/types/order";
import api from "./api";

export const createOrder = async (payload: Order) => {
  const res = await api.post("/orders", payload);
  return res.data;
};

export const getOrderByCode = async (orderCode: string) => {
  try {
    const res = await api.get(`/orders/${orderCode}`);
    return res.data?.data;

  } catch (err: any) {
    console.error("Error fetching order by code:", err);
    throw err;
  }
};

export const cancelOrder = async (orderId: string, reason: string) => {
  try {
    const res = await api.patch(`/orders/${orderId}/cancel`, {reason});
    return res.data?.data ?? res.data;
  } catch (err: any) {
    console.error("Error cancelling order:", err?.response?.data);
    throw err;
  }
};
