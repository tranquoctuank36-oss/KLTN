"use client";

import { Button } from "../ui/button";
import { motion, Variants } from "framer-motion";

const containerV: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.03 },
  },
};

const itemV: Variants = {
  hidden: { x: -16, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
};

type Props = {
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
  options: Array<{
    id: string;
    label: string;
    count: number;
    hexCode?: string;
  }>;
};

const getColorStyle = (
  hexCode?: string,
  label?: string
): React.CSSProperties => {
  if (hexCode) {
    const styles: React.CSSProperties = { backgroundColor: hexCode };

    // Add border for light colors
    if (
      hexCode.toLowerCase() === "#ffffff" ||
      hexCode.toLowerCase() === "#fff"
    ) {
      styles.border = "1px solid #E5E5E5";
    }

    return styles;
  }

  // Fallback to gray if no hexCode
  return { backgroundColor: "#CCCCCC" };
};

export default function ColorsPanel({
  selected,
  onToggle,
  onClose,
  options,
}: Props) {
  return (
    <div className="rounded-b-xl border-t bg-gray-100">
      <div className="h-[180px] overflow-y-auto flex items-start justify-center py-4 px-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerV}
          className="grid grid-cols-5 gap-3 w-full max-w-4xl"
        >
          {options.map((opt) => {
            const isActive = selected.has(opt.id);
            return (
              <motion.div key={opt.id} variants={itemV}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onToggle(opt.id)}
                  className={[
                    "flex items-center justify-start gap-2 h-12 w-full px-3 border bg-white hover:bg-white",
                    "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded-lg",
                    isActive
                      ? "border-blue-500 ring-1 ring-blue-200 bg-blue-50"
                      : "border-slate-200 hover:border-gray-800",
                  ].join(" ")}
                  aria-pressed={isActive}
                >
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0"
                    style={getColorStyle(opt.hexCode, opt.label)}
                  />
                  <span
                    className={[
                      "text-sm font-medium truncate",
                      isActive ? "text-blue-600" : "text-gray-800",
                    ].join(" ")}
                  >
                    {opt.label}
                  </span>
                  {typeof opt.count === "number" && opt.count > 0 && (
                    <span
                      className={[
                        "text-xs opacity-70 ml-auto",
                        isActive ? "text-blue-600" : "text-gray-600",
                      ].join(" ")}
                    >
                      ({opt.count})
                    </span>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="flex items-center justify-end px-6">
        <button
          type="button"
          onClick={onClose}
          className="text-xs bg-gray-100 font-medium text-slate-500 underline 
             hover:text-slate-700 hover:bg-gray-100 border-0
             focus:outline-none focus:ring-0 focus-visible:ring-0 shadow-none cursor-pointer rounded"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
