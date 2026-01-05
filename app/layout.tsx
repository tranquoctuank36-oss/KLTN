import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/footer";
import BackToTop from "@/components/back-to-top";
import GuaranteeSection from "@/components/guarantee-section";
import { CartProvider, useCart } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ChatFab from "@/components/chat";
import CartDrawerWrapper from "@/components/cart/CartDrawerWrapper";
import Header from "@/components/navbar/Header";

export const metadata: Metadata = {
  title: "Cửa Hàng Kính Trực Tuyến | Giảm Giá Lên Đến 50% + Giao Hàng Miễn Phí",
  description: "Cửa hàng kính mắt trực tuyến với bộ sưu tập đa dạng và giá tốt",
};

export default function RootLayout({
  children,
  
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider> 
          <CartProvider>
            <div className="mx-auto w-full">
              <Header />
              {children}
              <Toaster position="top-center" />
              <BackToTop />
              <ChatFab/>
              <GuaranteeSection />
              <Footer />
              <CartDrawerWrapper /> 
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
