import api from "./api";


export const createPayment = async ({ orderId }: { orderId: string }) => {
  try {
    const res = await api.post("/payments/vnpay", { orderId } , {withCredentials: true});
    return res.data.data;
  } catch (err) {
    console.error("❌ CreatePayment error:", err);
    throw err;
  }
};