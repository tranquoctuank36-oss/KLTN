import { Suspense } from "react";
import OrderSuccessClient from "./OrderSuccessClient";

export const dynamic = "force-dynamic";

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading order information...</p>
        </div>
      }
    >
      <OrderSuccessClient />
    </Suspense>
  );
}
