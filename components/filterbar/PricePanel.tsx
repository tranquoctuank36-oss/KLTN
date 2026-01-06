"use client";

import { useEffect, useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Variants } from "framer-motion";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  min: number; // từ API (VND nguyên)
  max: number; // từ API
  value?: [number, number];
  onChange?: (v: [number, number]) => void;
  onPreviewChange?: (v: [number, number]) => void; // Gọi khi đang kéo slider

  disabled?: boolean;
  format?: (n: number) => string;
};

const containerV: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemV: Variants = {
  hidden: { x: -24, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
};

function sameRange(a?: [number, number], b?: [number, number]) {
  if (!a || !b) return false;
  return a[0] === b[0] && a[1] === b[1];
}

export default function PricePanel({
  open,
  onOpenChange, 
  min,
  max,
  value,
  onChange,
  onPreviewChange,
  disabled = false,
  format,
}: Props) {
  // normalize bounds (đảm bảo min <= max)
  const rawMin = Number.isFinite(min) ? min : 0;
  const rawMax = Number.isFinite(max) ? max : 0;
  const boundMin = Math.min(rawMin, rawMax);
  const boundMax = Math.max(rawMin, rawMax);

  // step heuristic
  const step = useMemo(() => {
    const range = Math.max(1, boundMax - boundMin);
    if (range > 1_000_000) return Math.max(1, Math.round(range / 2000));
    if (range > 100_000) return Math.max(1, Math.round(range / 1000));
    if (range > 10_000) return Math.max(1, Math.round(range / 500));
    return 1;
  }, [boundMin, boundMax]);

  // Khoảng cách tối thiểu giữa 2 thumb (10% của range)
  const minGap = useMemo(() => {
    const range = boundMax - boundMin;
    return Math.max(step * 5, Math.round(range * 0.10));
  }, [boundMin, boundMax, step]);

  const initialRange: [number, number] = useMemo(
    () => [boundMin, boundMax],
    [boundMin, boundMax]
  );
  const [val, setVal] = useState<[number, number]>(value ?? initialRange);

  useEffect(() => {
    if (value) {
      // Clamp giá trị trong bounds mới từ API
      const clampedMin = Math.max(value[0], boundMin);
      const clampedMax = Math.min(value[1], boundMax);
      const clampedValue: [number, number] = [clampedMin, clampedMax];
      setVal(clampedValue);
      
      // Nếu giá trị bị clamp (thay đổi), thông báo cho parent
      if (clampedMin !== value[0] || clampedMax !== value[1]) {
        // Dùng setTimeout để tránh update trong render cycle
        setTimeout(() => onPreviewChange?.(clampedValue), 0);
      }
    } else {
      setVal(initialRange);
    }
  }, [value, initialRange, boundMin, boundMax]); // Bỏ onPreviewChange khỏi deps

  const f = (n: number) =>
    format ? format(n) : `${Number(n).toLocaleString("en-US")}đ`;

  const isSingleValue = boundMin === boundMax;

  if (!open) return null;

  const isActive = !sameRange(val, initialRange);

  const containerBase =
    "w-full bg-white border rounded-md p-3 transition-colors";
  const containerActive = isActive
    ? "border-blue-500 ring-1 ring-blue-200 bg-blue-50"
    : "border-gray-300";

  return (
    <div className="rounded-b-xl border-t bg-gray-100">
      <AnimatePresence>
        {open && (
          <div className="h-[180px] px-6 py-5 flex items-center justify-center">
            <motion.div
              key="price-container"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={containerV}
              className={`mx-auto w-full max-w-sm ${containerBase} ${containerActive}`}
            >
              <motion.div variants={itemV} className="text-center font-semibold mb-2">
                Giá tùy chỉnh
              </motion.div>

              {/* slider block (animated entry from left) */}
              <motion.div variants={itemV} className="flex flex-col items-center">
                <div className="w-full px-5">
                  {!isSingleValue ? (
                    <Slider
                      min={boundMin}
                      max={boundMax}
                      step={step}
                      value={val}
                      disabled={disabled}
                      minStepsBetweenThumbs={1}
                      onValueChange={(v) => {
                        if (disabled) return;
                        
                        let minVal = v[0];
                        let maxVal = v[1];
                        const prevMin = val[0];
                        const prevMax = val[1];
                        
                        // Kiểm tra khoảng cách
                        const currentGap = maxVal - minVal;
                        
                        // Nếu khoảng cách đã <= minGap
                        if (currentGap <= minGap) {
                          // Xác định thumb nào đang cố kéo
                          const leftMoving = minVal !== prevMin;
                          const rightMoving = maxVal !== prevMax;
                          
                          // Nếu thumb trái cố kéo sang phải (vào gần hơn)
                          if (leftMoving && minVal > prevMin) {
                            // DỪNG LẠI - không cho kéo gần hơn
                            return;
                          }
                          
                          // Nếu thumb phải cố kéo sang trái (vào gần hơn)
                          if (rightMoving && maxVal < prevMax) {
                            // DỪNG LẠI - không cho kéo gần hơn
                            return;
                          }
                          
                          // Chỉ cho phép kéo ra xa (minVal giảm hoặc maxVal tăng)
                        }
                        
                        const newVal = [minVal, maxVal] as [number, number];
                        setVal(newVal);
                        onPreviewChange?.(newVal);
                      }}
                      onValueCommit={(v) => {
                        if (disabled) return;
                        
                        let minVal = v[0];
                        let maxVal = v[1];
                        
                        // Đảm bảo khoảng cách tối thiểu khi commit
                        const currentGap = maxVal - minVal;
                        if (currentGap < minGap) {
                          // Điều chỉnh để đảm bảo minGap
                          const prevMin = val[0];
                          const prevMax = val[1];
                          
                          if (minVal !== prevMin) {
                            minVal = Math.max(boundMin, maxVal - minGap);
                          } else {
                            maxVal = Math.min(boundMax, minVal + minGap);
                          }
                        }
                        
                        onChange?.([minVal, maxVal] as [number, number]);
                      }}
                      className="my-4"
                    />
                  ) : (
                    <div className="my-4">
                      <div className="h-2 bg-gray-200 rounded relative">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border rounded-full"
                          aria-hidden
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* value boxes under slider */}
                <motion.div variants={itemV} className="flex items-center justify-between w-full pb-1 px-2">
                  <span className="px-2 py-2 border rounded-md bg-white">
                    {f(val[0])}
                  </span>
                  <span className="px-2 py-2 border rounded-md bg-white">
                    {f(val[1])}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Close button outside animated content (fixed, not animated) */}
      <div className="flex items-center justify-end px-6">
        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-xs bg-gray-100 font-medium text-slate-500 underline hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded hover:bg-gray-100"
        >
          Đóng
        </Button>
      </div>
    </div>
  );

}
