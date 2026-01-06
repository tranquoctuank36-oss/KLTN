"use client";

import { useEffect, useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Variants } from "framer-motion";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  min: number;
  max: number;
  value?: [number, number];
  onChange?: (v: [number, number]) => void;
  onPreviewChange?: (v: [number, number]) => void;
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

export default function SizePanel({
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
  const rawMin = Number.isFinite(min) ? min : 0;
  const rawMax = Number.isFinite(max) ? max : 0;
  const boundMin = Math.min(rawMin, rawMax);
  const boundMax = Math.max(rawMin, rawMax);

  const step = useMemo(() => {
    const range = Math.max(1, boundMax - boundMin);
    if (range > 100) return 5;
    if (range > 50) return 2;
    return 1;
  }, [boundMin, boundMax]);

  const minGap = useMemo(() => {
    const range = boundMax - boundMin;
    return Math.max(step * 2, Math.round(range * 0.05));
  }, [boundMin, boundMax, step]);

  const initialRange: [number, number] = useMemo(
    () => [boundMin, boundMax],
    [boundMin, boundMax]
  );
  const [val, setVal] = useState<[number, number]>(value ?? initialRange);

  useEffect(() => {
    if (value) {
      const clampedMin = Math.max(value[0], boundMin);
      const clampedMax = Math.min(value[1], boundMax);
      const clampedValue: [number, number] = [clampedMin, clampedMax];
      setVal(clampedValue);

      if (clampedMin !== value[0] || clampedMax !== value[1]) {
        setTimeout(() => onPreviewChange?.(clampedValue), 0);
      }
    } else {
      setVal(initialRange);
    }
  }, [value, initialRange, boundMin, boundMax]);

  const f = (n: number) =>
    format ? format(n) : `${Number(n).toFixed(0)}mm`;

  const isFullRange = sameRange(val, initialRange);

  const isActive = !isFullRange;

  const containerBase =
    "w-full bg-white border rounded-md p-3 transition-colors";
  const containerActive = isActive
    ? "border-blue-500 ring-1 ring-blue-200 bg-blue-50"
    : "border-gray-300";

  if (!open) return null;

  return (
    <div className="rounded-b-xl border-t bg-gray-100">
      <AnimatePresence>
        {open && (
          <div className="h-[180px] px-6 py-5 flex items-center justify-center">
            <motion.div
              key="size-container"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={containerV}
              className={`mx-auto w-full max-w-sm ${containerBase} ${containerActive}`}
            >
              <motion.div variants={itemV} className="text-center font-semibold mb-2">
                Chiều rộng khung kính
              </motion.div>

              <motion.div variants={itemV} className="flex flex-col items-center">
                <div className="w-full px-5">
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
                      
                      const currentGap = maxVal - minVal;
                      
                      if (currentGap <= minGap) {
                        const leftMoving = minVal !== prevMin;
                        const rightMoving = maxVal !== prevMax;
                        
                        if (leftMoving && minVal > prevMin) {
                          return;
                        }
                        
                        if (rightMoving && maxVal < prevMax) {
                          return;
                        }
                      }
                      
                      const newVal = [minVal, maxVal] as [number, number];
                      setVal(newVal);
                      onPreviewChange?.(newVal);
                    }}
                    onValueCommit={(v) => {
                      if (disabled) return;
                      
                      let minVal = v[0];
                      let maxVal = v[1];
                      
                      const currentGap = maxVal - minVal;
                      if (currentGap < minGap) {
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
                </div>

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

      <div className="flex items-center justify-end px-6">
        <button
          onClick={() => onOpenChange(false)}
          className="text-xs bg-gray-100 cursor-pointer font-medium text-slate-500 underline hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded hover:bg-gray-100"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
