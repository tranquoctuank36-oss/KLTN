"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  label: string;
  active?: boolean;
  expanded?: boolean;
  onClick: () => void;
};

export default function FilterChip({ label, active = false, expanded = false, onClick }: Props) {
  const isHighlighted = active || expanded;

  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outline"
      className={[
        "h-10 rounded-lg border text-sm font-medium flex items-center gap-1.5 px-4 transition-colors",
        "focus-visible:ring-2 focus-visible:ring-blue-300 bg-white hover:bg-white",
        isHighlighted
          ? "border-blue-500 text-blue-600 bg-blue-50"
          : "border-slate-300 text-gray-800 bg-white hover:border-gray-800",
      ].join(" ")}
    > 
      <span>{label}</span>
      {expanded ? (
        <ChevronUp className={isHighlighted ? "h-4 w-4 text-blue-600 opacity-80" : "h-4 w-4 opacity-70"} />
      ) : (
        <ChevronDown className={isHighlighted ? "h-4 w-4 text-blue-600 opacity-80" : "h-4 w-4 opacity-70"} />
      )}
    </Button>
  );
}
