import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { OrderItem } from "@/types/orderItems";
import { Loader2 } from "lucide-react";

interface AddToCartOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderItem[];
  onBuyAgain?: () => void;
  isLoading?: boolean;
}

export default function AddToCartOrderDialog({
  open,
  onOpenChange,
  items,
  onBuyAgain,
  isLoading = false,
}: AddToCartOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl w-full p-0">
        <DialogHeader className="px-6 pt-2">
          <DialogTitle className="text-lg font-bold">ADD TO CART</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="space-y-5 max-h-[340px] overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-25 h-25 rounded bg-gray-100 flex items-center justify-center">
                  <Image
                    src={item.imageUrl || "/placeholder.png"}
                    alt={item.productName || "Product Image"}
                    width={200}
                    height={200}
                    className="object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-lg transition">
                    {item.productName}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Color:</span> {item.colors}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold">Quantity:</span>{" "}
                      {item.quantity}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.originalPrice &&
                        Number(item.originalPrice) >
                          Number(item.finalPrice) && (
                          <span className="text-gray-400 line-through text-sm">
                            {Number(item.originalPrice)?.toLocaleString(
                              "en-US"
                            )}
                            đ
                          </span>
                        )}
                      <span className="font-semibold text-base text-black">
                        {Number(item.finalPrice)?.toLocaleString("en-US")}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button
              className="bg-blue-600 text-white font-bold text-base rounded-lg hover:bg-blue-800 w-[200px] h-[56px] flex items-center justify-center"
              onClick={onBuyAgain}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="!h-6 !w-6 animate-spin" />
                </span>
              ) : (
                "BUY AGAIN"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
