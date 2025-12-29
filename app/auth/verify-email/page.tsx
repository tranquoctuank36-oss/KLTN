import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmail";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading…</div>
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}