"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductTabs({ product }: Props) {
  return (
    <div className="mt-8">
      <Tabs defaultValue="about" className="w-full">
        {/* Tabs Header */}
        <TabsList className="flex w-full border-b-2 border-gray-300 bg-transparent p-0">
          <TabsTrigger
            value="about"
            className="px-4 py-2 text-base font-medium text-gray-500
              border-t-0 border-l-0 border-r-0 cursor-pointer
              data-[state=active]:font-bold 
              data-[state=active]:text-black 
              data-[state=active]:border-b-3
              data-[state=active]:border-gray-500
              data-[state=active]:-mb-[4px]
              data-[state=active]:rounded-none
              bg-transparent"
          >
            Thông tin về gọng kính
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="px-4 py-2 text-base font-medium text-gray-500 
              border-t-0 border-l-0 border-r-0 cursor-pointer
              data-[state=active]:font-bold 
              data-[state=active]:text-black 
              data-[state=active]:border-b-3
              data-[state=active]:border-gray-500
              data-[state=active]:-mb-[4px]
              data-[state=active]:rounded-none 
              bg-transparent"
          >
            Vận chuyển / Đổi & Trả hàng
          </TabsTrigger>
        </TabsList>

        {/* About the frame */}
        <TabsContent value="about">
          <div className="flex items-center justify-between gap-6 bg-gray-50 rounded-md p-6 mt-2">
            <div className="flex-1 text-gray-700 text-sm">
              <p className="font-semibold mb-2">
                {product.description ??
                  "Gọng kính chất lượng cao, thiết kế cho sự bền bỉ và phong cách thời thượng."}
              </p>

              <div className="mt-4">
                <p className="font-semibold">
                  Hướng Dẫn Sử Dụng:{" "}
                  <span className="font-normal">
                    Chỉ dùng cho kính mắt. Tránh tiếp xúc với nhiệt độ cao và tác động mạnh.
                  </span>
                </p>
              </div>
            </div>
            <div className="w-64">
              <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-100 font-semibold px-3 py-2 w-1/2">
                      Chất Liệu:
                    </td>
                    <td className="px-3 py-2">
                      {product.frameDetail?.frameMaterial?.name}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-100 font-semibold px-3 py-2">
                      Hình Dáng:
                    </td>
                    <td className="px-3 py-2">
                      {product.frameDetail?.frameShape?.name}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-100 font-semibold px-3 py-2">
                      Loại:
                    </td>
                    <td className="px-3 py-2">
                      {product.frameDetail?.frameType?.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 font-semibold px-3 py-2">
                      Giới Tính:
                    </td>
                    <td className="px-3 py-2">
                      {product.gender?.charAt(0).toUpperCase() +
                        product.gender?.slice(1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Shipping & Returns */}
        <TabsContent value="shipping">
          <div className="bg-gray-50 rounded-md p-6 mt-4 text-gray-700 space-y-4">
            <div>
              <p className="font-semibold">Chính Sách Vận Chuyển</p>
              <p className="mt-1 text-sm">
                - Sau khi hoàn tất giao dịch trên trang web, đơn hàng sẽ ngay lập tức được đóng gói và chuẩn bị vận chuyển. 
                <br />- Các sản phẩm trong đơn hàng sẽ được giao cho bên thứ ba và được xác nhận giao hàng trong 5 ngày tối đa. <br />
              </p>
              <br />

              <p className="font-semibold">Chính Sách Đổi và Trả Hàng</p>
              <p className="mt-1 text-sm">
                - Bạn có thể đổi sản phẩm trong 45 ngày kể từ khi nhận đơn hàng của bạn. <br />
                - Nếu sản phẩm có lỗi sản xuất hoặc bị hỏng trên đường vận chuyển, khách hàng sẽ được đổi hoặc hoàn tiền đầy đủ. <br />
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
