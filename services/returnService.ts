import api from "./api";
import { CreateReturnRequestPayload, ReturnRequest } from "@/types/return";

interface GetReturnsParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}

interface GetReturnsResponse {
  success: boolean;
  message: string;
  data: ReturnRequest[];
  meta: {
    requestId: string;
    timestamp: string;
    itemCount: number;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export const createReturnRequest = async (
  orderId: string,
  payload: CreateReturnRequestPayload
): Promise<ReturnRequest> => {
  try {
    const res = await api.post(`/orders/${orderId}/return`, payload);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    console.error("Error creating return request:", err?.response?.data);
    throw err;
  }
};

export const getMyReturns = async (params?: GetReturnsParams): Promise<GetReturnsResponse> => {
  try {
    const res = await api.get("/orders/returns/me", { params });
    return res.data;
  } catch (err: any) {
    console.error("Error fetching returns:", err);
    throw err;
  }
};

export const getReturnById = async (returnId: string): Promise<ReturnRequest> => {
  try {
    const res = await api.get(`/returns/${returnId}`);
    return res.data?.data;
  } catch (err: any) {
    console.error("Error fetching return by id:", err);
    throw err;
  }
};
