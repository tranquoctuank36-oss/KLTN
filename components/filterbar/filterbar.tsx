"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { FILTER_GROUPS } from "@/mocks/filter-mock";
import { type FilterGroup } from "@/types/filter";

import FilterChip from "./filterchip";
import FilterPanel from "./filterpanel";
import { X } from "lucide-react";

export default function FilterBar() {
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [sort, setSort] = useState("relevant");
  const [activeButton, setActiveButton] = useState<"front" | "side">("side");

  /** Toggle chọn/bỏ chọn option */
  const toggleOption = (group: FilterGroup, id: string) => {
    setSelected((prev) => {
      const current = new Set(prev[group.key] ?? []);
      if (current.has(id)) {
        current.delete(id);
      } else {
        current.add(id);
      }
      return { ...prev, [group.key]: current };
    });
  };

  /** Map để check chip nào đang active */
  const activeMap = useMemo(
    () =>
      FILTER_GROUPS.reduce<Record<string, boolean>>((acc, g) => {
        acc[g.key] = (selected[g.key]?.size ?? 0) > 0;
        return acc;
      }, {}),
    [selected]
  );

  /** Clear toàn bộ filter */
  const clearAll = () => setSelected({});

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-gray-100">
        {/* Chips */}
        <div className="flex flex-wrap items-center gap-2 p-4">
          {FILTER_GROUPS.map((g) => (
            <FilterChip
              key={g.key}
              label={g.label}
              active={activeMap[g.key]}
              expanded={expandedKey === g.key}
              onClick={() =>
                setExpandedKey((prev) => (prev === g.key ? null : g.key))
              }
            />
          ))}

          {/* View mode + Sort */}
          <div className="ml-auto flex items-center">
            {/* Front button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setActiveButton("front")}
              className={`h-10 w-13 rounded-lg border-slate-300 transition-colors ${
                activeButton === "front"
                  ? "bg-white text-gray-800"
                  : "bg-gray-100 text-gray-500 hover:bg-white hover:text-gray-800"
              }`}
              aria-label="Front view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 14"
                className="!w-6 !h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.577 9a3.793 3.793 0 0 1-3.79 3.797A3.79 3.79 0 0 1 1 9a3.79 3.79 0 0 1 3.789-3.797c2.093 0 3.79 1.7 3.79 3.797Zm0 0c0-.786.636-1.424 1.422-1.424.783 0 1.42.638 1.42 1.424m0 0a3.79 3.79 0 0 0 3.79 3.797A3.793 3.793 0 0 0 18.999 9a3.793 3.793 0 0 0-3.79-3.797c-2.093 0-3.79 1.7-3.79 3.797M1 8.703V2.578c0-.758.613-1.375 1.372-1.375M19 8.703V2.578c0-.758-.616-1.375-1.372-1.375"
                />
              </svg>
            </Button>

            {/* Side button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setActiveButton("side")}
              className={`h-10 w-13 rounded-lg border-slate-300 transition-colors ${
                activeButton === "side"
                  ? "bg-white text-gray-800"
                  : "bg-gray-100 text-gray-500 hover:bg-white hover:text-gray-800"
              }`}
              aria-label="Side view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                strokeWidth="1.5"
                viewBox="0 0 24 18"
                className="!w-6 !h-6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.799 10.15c-.076 2.165-1.435 3.334-3.04 2.602C2.153 12.021.909 9.684.975 7.508s1.434-3.334 3.04-2.603c1.606.732 2.85 3.078 2.784 5.244Zm0 0c.028-.808.541-1.255 1.14-.979s1.073 1.15 1.045 1.966m0 0c-.076 2.167 1.168 4.513 2.783 5.245 1.615.731 2.974-.437 3.04-2.603.067-2.166-1.168-4.513-2.783-5.245-1.615-.731-2.974.437-3.04 2.603m5.13-.399 6.184-4.009c.409-.266.903-.209 1.14.133l1.596 2.223M2.276 4.877l6.67-3.373c.418-.209.883-.104 1.083.257l1.064 1.919"
                />
              </svg>
            </Button>

            {/* Sort select */}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-10 rounded-lg border-slate-300 w-[150px] font-semibold ml-2 cursor-pointer">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="relevant">Most Relevant</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="low">Lowest Price</SelectItem>
                <SelectItem value="high">Highest Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Panel */}
        {expandedKey && (
          <FilterPanel
            group={FILTER_GROUPS.find((g) => g.key === expandedKey)!}
            selected={selected[expandedKey] ?? new Set()}
            onToggle={(id) => {
              const group = FILTER_GROUPS.find((g) => g.key === expandedKey);
              if (group) toggleOption(group, id);
            }}
            onClose={() => setExpandedKey(null)}
          />
        )}
      </div>

      {/* Active tags */}
      {Object.entries(selected).some(([, set]) => set.size > 0) && (
        <div className="flex flex-wrap gap-2 p-3">
          {Object.entries(selected).map(([groupKey, set]) =>
            Array.from(set).map((optionId) => {
              const group = FILTER_GROUPS.find((g) => g.key === groupKey);
              if (!group) return null;

              const optionLabel =
                group.options.find((o) => o.id === optionId)?.label ??
                optionId;

              return (
                <span
                  key={`${groupKey}-${optionId}`}
                  onClick={() => toggleOption(group, optionId)}
                  className="px-2 mt-1 mb-1 bg-gray-200 text-gray-700 rounded-full text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="leading-none font-medium">
                    {optionLabel}
                  </span>
                  <Button
                    type="button"
                    className="bg-gray-200 text-gray-700 !w-4 !h-4 rounded-full flex items-center justify-center !p-0
                      hover:bg-black/80 hover:text-white shadow-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(group, optionId);
                    }}
                  >
                    <X className="!w-3 !h-3" />
                  </Button>
                </span>
              );
            })
          )}

          <Button
            type="button"
            onClick={clearAll}
            className="text-xs text-slate-500 hover:text-gray-800 hover:underline ml-2 shadow-none !p-0"
          >
            Clear All
          </Button>
        </div>
      )}
    </>
  );
}
