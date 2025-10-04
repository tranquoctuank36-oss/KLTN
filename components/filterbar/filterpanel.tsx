"use client";

import { type FilterGroup } from "@/types/filter";
import { Button } from "../ui/button";

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
      <div className="h-[180px] overflow-y-auto flex items-center justify-center">
        <div className="flex flex-wrap justify-center gap-3">
          {group.options.map((opt) => {
            const isActive = selected.has(opt.id);
            return (
              <Button
                key={opt.id}
                type="button"
                variant="ghost"
                onClick={() => onToggle(opt.id)}
                className={[
                  "flex w-40 h-24 border bg-white text-lg",
                  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                  isActive
                    ? "border-blue-500 ring-1 ring-blue-200"
                    : "border-slate-200 hover:border-slate-300",
                ].join(" ")}
                aria-pressed={isActive}
              >
                <span
                  className={[
                    isActive ? "text-blue-600" : "text-slate-500",
                    "text-sm",
                  ].join(" ")}
                >
                  {opt.label}
                  {typeof opt.count === "number" && (
                    <span className="ml-1 text-xs opacity-70">
                      ({opt.count})
                    </span>
                  )}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end px-6">
        <Button
          type="button"
          onClick={onClose}
          className="text-xs bg-gray-100 font-medium text-slate-500 underline hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded hover:bg-gray-100"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
