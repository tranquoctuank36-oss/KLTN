export type OrderItem = {
  id: string;
  productId?: string;
  productName?: string;       
  variantId?: string;  
  variantName?: string; 
  sku?: string;
  colors?: string;     
  imageUrl?: string;   
  quantity?: number;       
  originalPrice?: number;         
  finalPrice?: number;         
  image?: string; 
  orderId?: string;      
};