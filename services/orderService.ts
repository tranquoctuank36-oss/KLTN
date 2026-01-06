import { Order, CreateOrderPayload } from "@/types/order";
import api from "./api";

export const createOrder = async (payload: CreateOrderPayload) => {
  const res = await api.post("/orders", payload);
  return res.data;
};

export type GetMyOrdersParams = {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
};

export type GetMyOrdersResponse = {
  data: Order[];
  meta: {
    itemCount: number;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export const getMyOrders = async (params?: GetMyOrdersParams): Promise<GetMyOrdersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `orders/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get(url);
    
    return {
      data: res.data?.data || [],
      meta: res.data?.meta || {
        itemCount: 0,
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
      },
    };
  } catch (err) {
    console.error("❌ getMyOrders error:", err);
    throw err;
  }
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

export const getOrderById = async (orderId: string) => {
  try {
    const res = await api.get(`/orders/${orderId}`);
    return res.data?.data;
  } catch (err: any) {
    console.error("Error fetching order by id:", err);
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

export type PreviewOrderPayload = {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  voucherCode?: string;
  toWardId: string;
  toDistrictId: string;
  paymentMethod: string;
};

export type PreviewOrderResponse = {
  subtotal: number;
  shippingFee: number;
  voucherOrderDiscount: number;
  voucherShippingDiscount: number;
  grandTotal: number;
};

export const previewOrder = async (payload: PreviewOrderPayload): Promise<PreviewOrderResponse> => {
  try {
    const res = await api.post("/orders/preview", payload);
    const data = res.data?.data;
    return {
      subtotal: Number(data?.subtotal) || 0,
      shippingFee: Number(data?.shippingFee) || 0,
      voucherOrderDiscount: Number(data?.voucherOrderDiscount) || 0,
      voucherShippingDiscount: Number(data?.voucherShippingDiscount) || 0,
      grandTotal: Number(data?.grandTotal) || 0,
    };
  } catch (err: any) {
    console.error("Error previewing order:", err);
    throw err;
  }
};


