import { Suspense } from "react";
import MyAccountClient from "./MyAccountClient";
export const dynamic = "force-dynamic";

export default function MyAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[70vh]">
          <div className="text-5xl font-bold text-blue-600 flex gap-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce [animation-delay:0.2s]">.</span>
            <span className="animate-bounce [animation-delay:0.4s]">.</span>
          </div>
        </div>
      }
    >
      <MyAccountClient />
    </Suspense>
  );
}
