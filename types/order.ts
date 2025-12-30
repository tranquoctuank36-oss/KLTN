import { PaymentMethodType } from "./payment";

export type OrderStatus =
  | "pending"       
  | "awaiting_payment"   
  | "processing"        
  | "shipping"          
  | "delivered"       
  | "completed"         
  | "cancelled"       
  | "expired"
  | "return_requested"
  | "returning"
  | "returned";

  export type OrderItemPayload = {
  variantId: string;
  quantity: number;  
};

export type CreateOrderPayload = {
  items: OrderItemPayload[];
  voucherCode?: string;
  note?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  addressLine: string;
  toProvinceId: string;
  toDistrictId: string;
  toWardId: string;
  paymentMethod: PaymentMethodType;
};

export type Order = {
  id?:string;
  orderCode?: string;
  items: OrderItemPayload[];
  discountFee?: number;
  shippingFee: number;   
  grandTotal: number;   
  couponCode?: string;  
  note?: string;              

  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  addressLine: string;
  provinceName: string;
  districtName: string;
  wardName: string;

  provinceId: string;
  districtId: string;
  wardId: string;

  paymentMethod: PaymentMethodType;

  status?: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
};