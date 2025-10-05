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
        <TabsList className="flex w-full rounded-none border-b-2 border-gray-300 bg-transparent p-0">
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
            About the frame
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
            Shipping / Exchange & Return
          </TabsTrigger>
        </TabsList>

        {/* About the frame */}
        <TabsContent value="about">
          <div className="flex items-center justify-between gap-6 bg-gray-50 rounded-md p-6 mt-2">
            <div className="flex-1 text-gray-700 text-sm">
              <p className="font-semibold mb-2">
                {product.description ??
                  "This is a premium quality frame, designed for comfort and timeless style."}
              </p>

              <div className="mt-4">
                <p className="font-semibold">
                  User Guide:{" "}
                  <span className="font-normal">
                    For eye wear only. Avoid high temperatures and strong
                    impacts.
                  </span>
                </p>
              </div>
            </div>
            <div className="w-64">
              <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-100 font-semibold px-3 py-2 w-1/2">
                      Material:
                    </td>
                    <td className="px-3 py-2">Metal</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-100 font-semibold px-3 py-2">
                      Shape:
                    </td>
                    <td className="px-3 py-2">Rectangle</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-100 font-semibold px-3 py-2">
                      Type:
                    </td>
                    <td className="px-3 py-2">Full-Rim</td>
                  </tr>
                  <tr>
                    <td className="bg-gray-100 font-semibold px-3 py-2">
                      Spring Hinges:
                    </td>
                    <td className="px-3 py-2">Yes</td>
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
              <p className="font-semibold">Shipping Policy</p>
              <p className="mt-1 text-sm">
                - Once the purchase is completed on the website, the order will
                be immediately packed and prepared for shipping. <br />- The
                ordered items will be handed over to a third party and are
                confirmed to be delivered within a maximum of 5 days per order.{" "}
                <br />
              </p>
              <br />

              <p className="font-semibold">Exchange and Return Policy</p>
              <p className="mt-1 text-sm">
                - You can exchange the product or size within 45 days of
                receiving your order. <br />
                - If the product has a manufacturing defect or is damaged during
                shipping, the customer will be offered a replacement or a full
                refund. <br />
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
