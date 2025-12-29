"use client";

import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

export default function CartDrawerWrapper() {
  const { isDrawerOpen, closeDrawer } = useCart();
  
  return <CartDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />;
}