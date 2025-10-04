"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  label: string;
  active?: boolean;      // có chọn option nào trong group
  expanded?: boolean;    // group đang mở panel
  onClick: () => void;
};

export default function FilterChip({ label, active, expanded, onClick }: Props) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outline"
      className={[
        "h-10 rounded-lg border-slate-300 bg-white",
        "data-[active=true]:border-blue-500 data-[active=true]:text-blue-600",
        "data-[expanded=true]:ring-2 data-[expanded=true]:ring-blue-200",
      ].join(" ")}
      data-active={active ? "true" : "false"}
      data-expanded={expanded ? "true" : "false"}
    >
      <span className="mr-1 pb-1">{label}</span>
      {expanded ? (
        <ChevronUp className="h-4 w-4 opacity-70" />
      ) : (
        <ChevronDown className="h-4 w-4 opacity-70" />
      )}
    </Button>
  );
}
