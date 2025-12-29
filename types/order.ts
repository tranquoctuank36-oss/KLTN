import { PaymentMethodType } from "./payment";

export type OrderStatus =
  | "PENDING"       
  | "PENDING_PAYMENT"   
  | "PAID"              
  | "PROCESSING"        
  | "SHIPPED"          
  | "DELIVERED"       
  | "COMPLETED"         
  | "CANCELLED"       
  | "REFUNDED";

  export type OrderItemPayload = {
  variantId: string;
  quantity: number;  
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
  recipientPhone: string;
  addressLine: string;
  wardName: string;
  districtName: string;
  provinceName: string;

  toWardCode: string;
  toDistrictId: number;

  paymentMethod: PaymentMethodType;

  status?: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
};