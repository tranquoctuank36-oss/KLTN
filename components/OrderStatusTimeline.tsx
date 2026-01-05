"use client";

import * as React from "react";
import { CheckCheck, DollarSign, ReceiptText, Truck, X } from "lucide-react";

// Backend status types
type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "processing"
  | "shipping"
  | "delivered"
  | "completed"
  | "cancelled"
  | "expired"
  | "return_requested"
  | "returning"
  | "returned";

type StepKey = "PLACED" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
type Timestamps = Partial<Record<StepKey, string>>;

interface Props {
  status: OrderStatus | string;
  timestamps?: Timestamps;
  className?: string;
}

const STEPS: { key: StepKey; label: string; Icon: React.ComponentType<any> }[] =
  [
    { key: "PLACED", label: "Đã đặt hàng", Icon: ReceiptText },
    { key: "CONFIRMED", label: "Đã xác nhận", Icon: DollarSign },
    { key: "SHIPPING", label: "Đang vận chuyển", Icon: Truck },
    { key: "DELIVERED", label: "Đã giao hàng", Icon: CheckCheck },
  ];

// Map backend status to timeline step
function mapStatusToStep(status: string): StepKey | null {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "pending") {
    return "PLACED";
  }
  if (statusLower === "processing") {
    return "CONFIRMED";
  }
  if (statusLower === "shipping") {
    return "SHIPPING";
  }
  if (statusLower === "delivered" || statusLower === "completed") {
    return "DELIVERED";
  }
  
  return null;
}

export default function OrderStatusTimeline({
  status,
  timestamps,
  className = "",
}: Props) {
  const cancelled = status.toLowerCase() === "cancelled";
  const currentStep = mapStatusToStep(status);
  const currentIndex = cancelled || !currentStep
    ? -1
    : STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className={`w-full ${className}`}>
      {/* >= md: timeline ngang */}
      <div className="hidden md:block">
        <TimelineHorizontal
          steps={STEPS}
          cancelled={cancelled}
          currentIndex={currentIndex}
          timestamps={timestamps}
        />
      </div>

      {/* < md: timeline dọc */}
      {/* <div className="md:hidden">
        <div className="relative pl-7">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
          {STEPS.map((step, idx) => {
            const done = !cancelled && idx <= currentIndex;
            return (
              <div key={step.key} className="relative mb-5">
                <div
                  className={[
                    "absolute -left-1 top-0 w-6 h-6 rounded-full border flex items-center justify-center",
                    done
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-400 border-gray-300",
                  ].join(" ")}
                >
                  <step.Icon className="w-3.5 h-3.5" />
                </div>
                <div className="ml-2">
                  <div
                    className={`text-sm font-medium ${
                      done ? "text-blue-500" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </div>
                  {timestamps?.[step.key] && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {timestamps[step.key]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {cancelled && (
            <div className="relative">
              <div className="absolute -left-1 top-0 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium text-red-600">Đã hủy</div>
              </div>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
}

function TimelineHorizontal({
  steps,
  cancelled,
  currentIndex,
  timestamps,
}: {
  steps: typeof STEPS;
  cancelled: boolean;
  currentIndex: number;
  timestamps?: Timestamps;
}) {
  const DOT = 32;
  
  // Nếu cancelled, chỉ hiển thị 2 bước: PLACED và CANCELLED
  const displaySteps = cancelled 
    ? [
        { key: "PLACED" as StepKey, label: "Đã đặt hàng", Icon: ReceiptText },
        { key: "CANCELLED" as StepKey, label: "Đã hủy", Icon: X },
      ]
    : steps;
  
  const N = displaySteps.length;

  // tỉ lệ để baseline bám đúng tâm icon đầu/cuối
  const leftPct = (1 / (2 * N)) * 100;
  const trackPct = ((N - 1) / N) * 100;
  const ratio = cancelled ? 1 : Math.max(0, currentIndex) / (steps.length - 1);

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 right-0" style={{ height: DOT }}>
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded"
          style={{ left: `${leftPct}%`, right: `${leftPct}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-1 rounded transition-[width] duration-500 ${
            cancelled ? "bg-black" : "bg-blue-500"
          }`}
          style={{
            left: `${leftPct}%`,
            width: `calc(${trackPct}% * ${ratio})`,
          }}
        />
      </div>

      {/* Grid bước: mỗi cột là 1 KHỐI (icon + label + timestamp) */}
      <div
        className="relative grid gap-0"
        style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
      >
        {displaySteps.map((s, idx) => {
          const done = cancelled ? true : idx <= currentIndex;
          const active = cancelled ? idx === 1 : idx === currentIndex;
          const isCancelledStep = s.key === "CANCELLED";

          return (
            <div key={s.key} className="flex flex-col items-center">
              <div className="grid place-items-center" style={{ height: DOT }}>
                <div
                  className={[
                    "flex items-center justify-center w-8 h-8 rounded-full border transition-colors",
                    done && isCancelledStep
                      ? "bg-red-500 text-white border-red-500"
                      : done
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-400 border-gray-300",
                    active && !done ? "ring-2 ring-black/20" : "",
                  ].join(" ")}
                >
                  <s.Icon className="w-4 h-4" />
                </div>
              </div>

              {/* LABEL + TIMESTAMP: luôn ở TÂM cột */}
              <div className="w-full max-w-[14rem] mx-auto mt-2 text-center">
                <div
                  className={`text-sm font-medium ${
                    done && isCancelledStep ? "text-red-600" : done ? "text-black" : "text-gray-500"
                  }`}
                >
                  {s.label}
                </div>
                {timestamps?.[s.key] && (
                  <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                    {timestamps[s.key]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
