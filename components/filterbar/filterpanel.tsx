"use client";

import { type FilterGroup } from "@/types/filter";
import { Button } from "../ui/button";
import { motion, Variants } from "framer-motion";

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

type Props = {
  group: FilterGroup;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
};

export default function FilterPanel({
  group,
  selected,
  onToggle,
  onClose,
}: Props) {
  return (
    <div className="rounded-b-xl border-t bg-gray-100">
      <div className="h-[180px] overflow-y-auto flex items-start justify-center py-10">
        <motion.div
          key={group.key}
          initial="hidden"
          animate="show"
          variants={containerV}
          className="flex flex-wrap justify-center gap-3"
        >
          {group.options.map((opt) => {
            const isActive = selected.has(opt.id);
            return (
              <motion.div key={opt.id} variants={itemV}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onToggle(opt.id)}
                  className={[
                    "flex w-40 h-24 border bg-white hover:bg-white text-lg",
                    "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                    isActive
                      ? "border-blue-500 ring-1 ring-blue-200 bg-blue-50"
                      : "border-slate-200 hover:border-gray-800",
                  ].join(" ")}
                  aria-pressed={isActive}
                >
                  <span
                    className={[
                      "text-base",
                      isActive ? "text-blue-600" : "text-gray-800",
                    ].join(" ")}
                  >
                    {opt.label}
                    {typeof opt.count === "number" && (
                      <span
                        className={[
                          "ml-1 text-sm opacity-70",
                          isActive ? "text-blue-600" : "text-gray-800",
                        ].join(" ")}
                      >
                        ({opt.count})
                      </span>
                    )}
                  </span>
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
