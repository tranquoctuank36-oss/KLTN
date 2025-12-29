"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

type Item = { id: string; name: string; count?: number };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: { shapes: Item[]; types: Item[]; materials: Item[] };
  value?: {
    frameShapesIds?: string[];
    frameTypesIds?: string[];
    frameMaterialsIds?: string[];
  };
  onChange?: (patch: {
    frameShapesIds?: string[];
    frameTypesIds?: string[];
    frameMaterialsIds?: string[];
  }) => void;
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
  show: { x: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
};

export default function FrameGroupPanel({
  open,
  onOpenChange,
  data,
  value,
  onChange,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // chỉ đóng bằng ESC – KHÔNG lắng nghe click-outside để tránh đóng ngoài ý muốn
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onOpenChange]);

  const toggle = (kind: "shapes" | "types" | "materials", id: string) => {
    const current = new Set(
      (kind === "shapes"
        ? value?.frameShapesIds     
        : kind === "types"
        ? value?.frameTypesIds
        : value?.frameMaterialsIds) || []
    );
    current.has(id) ? current.delete(id) : current.add(id);
    const next = Array.from(current);
    onChange?.(
      kind === "shapes"
        ? { frameShapesIds: next }
        : kind === "types"
        ? { frameTypesIds: next }
        : { frameMaterialsIds: next }
    );
  };

  const isActive = (kind: "shapes" | "types" | "materials", id: string) => {
    const arr =
      kind === "shapes"
        ? value?.frameShapesIds
        : kind === "types"
        ? value?.frameTypesIds
        : value?.frameMaterialsIds;
    return !!arr?.includes(id);
  };

  if (!open) return null;

  return (
    <div ref={panelRef} className="rounded-b-xl border-t bg-gray-100">
      {/* Nội dung có animation cho các option */}
      <motion.div
        key="frame-content"
        initial="hidden"
        animate="show"
        variants={containerV}
        className="h-[180px] overflow-y-auto px-4 py-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column
            title="Frame Shape"
            items={data.shapes}
            isActive={(id) => isActive("shapes", id)}
            onItem={(id) => toggle("shapes", id)}
          />
          <Column
            title="Frame Type"
            items={data.types}
            isActive={(id) => isActive("types", id)}
            onItem={(id) => toggle("types", id)}
          />
          <Column
            title="Frame Material"
            items={data.materials}
            isActive={(id) => isActive("materials", id)}
            onItem={(id) => toggle("materials", id)}
          />
        </div>
      </motion.div>

      <div className="flex items-center justify-end px-6">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-xs bg-gray-100 font-medium text-slate-500 underline 
             hover:text-slate-700 hover:bg-gray-100 border-0
             focus:outline-none focus:ring-0 focus-visible:ring-0 shadow-none cursor-pointer rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Column({
  title,
  items,
  isActive,
  onItem,
}: {
  title: string;
  items: Item[];
  isActive: (id: string) => boolean;
  onItem: (id: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-700 mb-3">{title}</div>

      {/* Container cho các item: chạy hidden -> show để kích hoạt stagger */}
      <motion.div
        key={`col-${title}`}
        variants={containerV}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-3"
      >
        {items?.map((it) => {
          const active = isActive(it.id);
          return (
            <motion.div key={it.id} variants={itemV}>
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                  onItem(it.id);
                }}  
                className={[
                  "flex w-32 h-14 border bg-white hover:bg-white text-sm",
                  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                  active
                    ? "border-blue-500 ring-1 ring-blue-200 bg-blue-50"
                    : "border-slate-200 hover:border-gray-800",
                ].join(" ")}
                aria-pressed={active}
                title={it.name}
              >
                <span
                  className={[
                    active ? "text-blue-600" : "text-gray-800",
                    "text-sm",
                  ].join(" ")}
                >
                  {it.name}
                  {typeof it.count === "number" && (
                    <span
                      className={[
                        "ml-1 text-sm opacity-70",
                        active ? "text-blue-600" : "text-gray-800",
                      ].join(" ")}
                    >
                      ({it.count})
                    </span>
                  )}
                </span>
              </Button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
