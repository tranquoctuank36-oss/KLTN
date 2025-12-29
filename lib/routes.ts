export const Routes = {
  home: () => `/`,
  brand: (slug: string) => `/brands/${slug}`,
  brands: () => `/brands`,

  users: () => `/users`,

  product: (slug: string, variantId?: string) =>
    `/products/${slug}?variantId=${variantId}`,
  products: () => `/products`,

  progressiveGlasses: () => `/progressive-glasses`,
  sportsGlasses: () => "/sports-glasses",
  kidsGlasses: () => "/kids-glasses",
  blueLightGlasses: () => "/blue-light-glasses",

  cart: () => `/carts`,
  checkouts: () => `/checkouts`,
  orderTracking: () => `/order-tracking`,
  orderTrackingDetail: (orderCode: string) => `/order-tracking/${orderCode}`, 
  orderDetail: (orderCode: string) => `/orders/${orderCode}`,
  orderSuccessPage: (orderCode: string) => `/orders/success?orderCode=${orderCode}`,
  
  sale: () => `/sale`,
};