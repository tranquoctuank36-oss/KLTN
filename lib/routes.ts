export const Routes = {
  home: () => `/`,
  brand: (slug: string) => `/brand/${slug}`,
  brands: () => `/brands`,

  product: (slug: string) => `/products/${slug}`,
  products: () => `/products`,

  progressiveGlasses: () => `/progressive-glasses`,
  sportsGlasses: () => "/sports-glasses",
  kidsGlasses: () => "/kids-glasses",
  blueLightGlasses: () => "/blue-light-glasses",

  cart: () => `/cart`,
  checkouts: () => `/checkouts`,
};