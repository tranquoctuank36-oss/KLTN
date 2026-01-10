import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/layout/footer";
import { CartProvider, useCart } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { Toaster } from "react-hot-toast";
import ChatFab from "@/components/chat/chat";
import CartDrawerWrapper from "@/components/cart/CartDrawerWrapper";
import Header from "@/components/layout/navbar/Header";
import BackToTop from "@/components/ui-common/back-to-top";

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
            <ChatProvider>
              <div className="mx-auto w-full">
                <Header />
                {children}
                <Toaster position="top-center" />
                <BackToTop />
                <ChatFab/>
                <Footer />
                <CartDrawerWrapper /> 
              </div>
            </ChatProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
