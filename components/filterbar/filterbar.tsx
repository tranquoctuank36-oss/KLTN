"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  memo,
} from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import type {
  ElasticAggregation,
  ElasticSearchFilters,
} from "@/services/productService";
import FrameGroupPanel from "./FrameGroupPanel";
import FilterChip from "./filterchip";
import FilterPanel from "./filterpanel";
import PricePanel from "./PricePanel";
import BrandsPanel from "./BrandsPanel";
import ColorsPanel from "./ColorsPanel";

export type FilterGroup = {
  key:
    | "productTypes"
    | "genders"
    | "frameShapes"
    | "frameTypes"
    | "frameMaterials"
    | "brands"
    | "tags"
    | "colors";
  label: string;
  options: { id: string; label: string; count: number; hexCode?: string }[];
};

type Props = {
  aggregations?: ElasticAggregation;
  onChange?: (filters: Partial<ElasticSearchFilters>) => void;
  sort?: string;
  onSortChange?: (s: string) => void;
  priceBounds?: { min: number; max: number };
  currency?: string;
};

const LABELS: Record<FilterGroup["key"], string> = {
  productTypes: "Glasses Type",
  genders: "Gender",
  frameShapes: "Frame Shape",
  frameTypes: "Frame Type",
  frameMaterials: "Frame Material",
  brands: "Brands",
  tags: "Tags",
  colors: "Colors",
};

const FRAME_KEYS: Array<FilterGroup["key"]> = [
  "frameShapes",
  "frameTypes",
  "frameMaterials",
];

const DEFAULT_PRICE_BOUNDS = { min: 0, max: 2000 };

const removeFrom = (s: Set<string> | undefined, id: string) => {
  const next = new Set(s ?? []);
  next.delete(id);
  return Array.from(next);
};

function FilterBar({
  aggregations,
  onChange,
  priceBounds,
}: Props) {
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [expandedKey, setExpandedKey] = useState<
    FilterGroup["key"] | "frame" | "price" | null
  >(null);

  const [selectedPrice, setSelectedPrice] = useState<[number, number] | null>(
    null
  );

  const reopenFrameRef = useRef(false);

  const GROUPS_NO_FRAME: FilterGroup[] = useMemo(() => {
    if (!aggregations) {
      return [];
    }
    
    const build = (key: FilterGroup["key"]) => {
      const data = aggregations[key] ?? [];
      const optionsMap = new Map<string, { id: string; label: string; count: number; hexCode: string }>();
      
      // Add options from aggregations
      data.forEach((x: any) => {
        const option = {
          id: String(x.key ?? x.value ?? x.label),
          label: String(x.label ?? x.key),
          count: Number(x.count ?? 0),
          hexCode: x.hexCode, // This should work if API returns it
        };
        
        optionsMap.set(option.id, option);
      });
      
      // Add selected options that might be missing from aggregations
      const selectedIds = Array.from(selected[key] ?? []);
      selectedIds.forEach((id) => {
        if (!optionsMap.has(id)) {
          optionsMap.set(id, {
            id: id,
            label: id,
            count: 0, // We don't know the count, set to 0
            hexCode: "#CCCCCC", // No hexCode available
          });
        }
      });
      
      return {
        key,
        label: LABELS[key],
        options: Array.from(optionsMap.values()),
      } as FilterGroup;
    };

    return (
      ["productTypes", "genders", "brands", "tags", "colors"] as const
    ).map((k) => build(k));
  }, [aggregations, selected]);

  const FRAME_DATA = useMemo(
    () => ({
      shapes: (aggregations?.frameShapes ?? []).map((x: any) => ({
        id: String(x.key),
        name: String(x.key),
        count: Number(x.count ?? 0),
      })),
      types: (aggregations?.frameTypes ?? []).map((x: any) => ({
        id: String(x.key),
        name: String(x.key),
        count: Number(x.count ?? 0),
      })),
      materials: (aggregations?.frameMaterials ?? []).map((x: any) => ({
        id: String(x.key),
        name: String(x.key),
        count: Number(x.count ?? 0),
      })),
    }),
    [aggregations]
  );

  const activeMap = useMemo(() => {
    return GROUPS_NO_FRAME.reduce<Record<string, boolean>>((acc, g) => {
      acc[g.key] = (selected[g.key]?.size ?? 0) > 0;
      return acc;
    }, {});
  }, [GROUPS_NO_FRAME, selected]);

  const activeFrame =
    (selected.frameShapes?.size ?? 0) > 0 ||
    (selected.frameTypes?.size ?? 0) > 0 ||
    (selected.frameMaterials?.size ?? 0) > 0;

  const toggleOption = useCallback((group: FilterGroup, id: string) => {
    setSelected((prev) => {
      const current = new Set(prev[group.key] ?? []);
      current.has(id) ? current.delete(id) : current.add(id);
      return { ...prev, [group.key]: current };
    });
  }, []);

  const applyFramePatch = useCallback(
    (patch: {
      frameShapesIds?: string[];
      frameTypesIds?: string[];
      frameMaterialsIds?: string[];
    }) => {
      setSelected((prev) => {
        const next = { ...prev };
        if (patch.frameShapesIds)
          next.frameShapes = new Set(patch.frameShapesIds);
        if (patch.frameTypesIds) next.frameTypes = new Set(patch.frameTypesIds);
        if (patch.frameMaterialsIds)
          next.frameMaterials = new Set(patch.frameMaterialsIds);
        return next;
      });
    },
    []
  );

  const clearAll = useCallback(() => {
    setSelected({});
    setSelectedPrice(null);
  }, []);

  const bounds = useMemo(() => {
    const apiMin = Number(aggregations?.price?.min ?? NaN);
    const apiMax = Number(aggregations?.price?.max ?? NaN);
    const propMin = Number(priceBounds?.min ?? NaN);
    const propMax = Number(priceBounds?.max ?? NaN);

    // chọn theo thứ tự ưu tiên: API -> prop -> default
    const min = Number.isFinite(apiMin)
      ? apiMin
      : Number.isFinite(propMin)
      ? propMin
      : DEFAULT_PRICE_BOUNDS.min;

    const max = Number.isFinite(apiMax)
      ? apiMax
      : Number.isFinite(propMax)
      ? propMax
      : DEFAULT_PRICE_BOUNDS.max;

    // đảm bảo min<=max
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }, [aggregations?.price, priceBounds]);

  const disabledPrice = bounds.min === bounds.max;

  const apiFilters = useMemo(() => {
    const toArr = (key: string) => Array.from(selected[key] ?? []);
    const base: Partial<ElasticSearchFilters> = {
      productTypes: toArr("productTypes"),
      genders: toArr("genders"),
      frameShapes: toArr("frameShapes"),
      frameTypes: toArr("frameTypes"),
      frameMaterials: toArr("frameMaterials"),
      brands: toArr("brands"),
      tags: toArr("tags"),
      colors: toArr("colors"),
    } as Partial<ElasticSearchFilters>;

    if (selectedPrice) {
      (base as any).minPrice = String(selectedPrice[0]);
      (base as any).maxPrice = String(selectedPrice[1]);
    }

    return base;
  }, [selected, selectedPrice]);

  const lastEmittedRef = useRef<string>("");
  useEffect(() => {
    const s = JSON.stringify(apiFilters);
    if (s !== lastEmittedRef.current) {
      lastEmittedRef.current = s;
      onChange?.(apiFilters);
    }
  }, [apiFilters, onChange]);

  useEffect(() => {
    if (reopenFrameRef.current) {
      reopenFrameRef.current = false;
      setTimeout(() => setExpandedKey("frame"), 0);
    }
  }, [aggregations]);

  // format VNĐ (or other currency)
  const currencyFormatter = (n: number) => `${Number(n).toLocaleString("en-US")}đ`;


  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-gray-100">
        {/* Chips */}
        <div className="flex flex-wrap items-center gap-2 p-4">
          {/* 1) productTypes + genders */}
          {GROUPS_NO_FRAME.filter(
            (g) => g.key === "productTypes" || g.key === "genders"
          ).map((g) => (
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

          {/* 2) Frame (gộp) — đứng ngay sau Gender */}
          <FilterChip
            label="Frame"
            active={activeFrame}
            expanded={expandedKey === "frame"}
            onClick={() =>
              setExpandedKey((prev) => (prev === "frame" ? null : "frame"))
            }
          />

          {/* 3) Brands, Tags, Colors */}
          {GROUPS_NO_FRAME.filter(
            (g) => !["productTypes", "genders"].includes(g.key as string)
          ).map((g) => (
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

          {/* 4) Price chip */}
          <FilterChip
            key="price"
            label="Price"
            active={!!selectedPrice}
            expanded={expandedKey === "price"}
            onClick={() =>
              setExpandedKey((prev) => (prev === "price" ? null : "price"))
            }
          />
        </div>

        {/* Panel chi tiết */}
        {!!expandedKey && (
          <div className="pb-3">
            {expandedKey === "frame" ? (
              <FrameGroupPanel
                open={true}
                onOpenChange={(v) => !v && setExpandedKey(null)}
                data={FRAME_DATA}
                value={{
                  frameShapesIds: Array.from(selected.frameShapes ?? []),
                  frameTypesIds: Array.from(selected.frameTypes ?? []),
                  frameMaterialsIds: Array.from(selected.frameMaterials ?? []),
                }}
                onChange={applyFramePatch}
              />
            ) : expandedKey === "price" ? (
              <PricePanel
                open={true}
                onOpenChange={(v) => {
                  if (!v) setExpandedKey(null);
                }}
                min={bounds.min}
                max={bounds.max}
                value={selectedPrice ?? undefined}
                disabled={disabledPrice}
                format={(n) => currencyFormatter(n)}
                onChange={(v) => {
                  setSelectedPrice([v[0], v[1]]);
                }}
              />
            ) : expandedKey === "brands" ? (
              <BrandsPanel
                selected={selected.brands ?? new Set()}
                onToggle={(id) => {
                  const group = GROUPS_NO_FRAME.find((g) => g.key === "brands");
                  if (group) toggleOption(group, id);
                }}
                onClose={() => setExpandedKey(null)}
                options={
                  GROUPS_NO_FRAME.find((g) => g.key === "brands")?.options ?? []
                }
              />
            ) : expandedKey === "colors" ? (
              <ColorsPanel
                selected={selected.colors ?? new Set()}
                onToggle={(id) => {
                  const group = GROUPS_NO_FRAME.find((g) => g.key === "colors");
                  if (group) toggleOption(group, id);
                }}
                onClose={() => setExpandedKey(null)}
                options={
                  GROUPS_NO_FRAME.find((g) => g.key === "colors")?.options ?? []
                }
              />
            ) : (
              <FilterPanel
                group={
                  GROUPS_NO_FRAME.find(
                    (g) => g.key === expandedKey
                  ) as FilterGroup
                }
                selected={selected[expandedKey] ?? new Set()}
                onToggle={(id) => {
                  const group = GROUPS_NO_FRAME.find(
                    (g) => g.key === expandedKey
                  );
                  if (group) toggleOption(group, id);
                }}
                onClose={() => setExpandedKey(null)}
              />
            )}
          </div>
        )}
      </div>

      {/* Dải tag đang chọn */}
      {(Object.entries(selected).some(([, set]) => set.size > 0) ||
        selectedPrice) && (
        <div className="flex flex-wrap gap-2 p-3 pb-0">
          {Object.entries(selected).map(([groupKey, set]) =>
            Array.from(set).map((optionId) => {
              const inFrame = FRAME_KEYS.includes(groupKey as any);
              const group = inFrame
                ? ({
                    key: groupKey,
                    label: LABELS[groupKey as FilterGroup["key"]],
                    options: (aggregations?.[
                      groupKey as keyof ElasticAggregation
                    ] ?? []) as any[],
                  } as any)
                : GROUPS_NO_FRAME.find((g) => g.key === groupKey);

              if (!group) return null;

              const optionLabel =
                group.options.find(
                  (o: any) => String(o.key ?? o.id) === optionId
                )?.label ??
                group.options.find((o: any) => String(o.id) === optionId)
                  ?.label ??
                String(optionId);

              return (
                <span
                  key={`${groupKey}-${optionId}`}
                  onClick={() =>
                    !FRAME_KEYS.includes(groupKey as any) &&
                    toggleOption(group as FilterGroup, optionId)
                  }
                  className="px-2 mt-1 mb-1 bg-gray-200 text-gray-700 rounded-full text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="leading-none font-medium">
                    {optionLabel}
                  </span>
                  <Button
                    type="button"
                    className="bg-gray-200 text-gray-700 !w-4 !h-4 rounded-full flex items-center justify-center !p-0 hover:bg-black/80 hover:text-white drop-shadow-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (FRAME_KEYS.includes(groupKey as any)) {
                        // báo hiệu để mở lại panel sau fetch
                        reopenFrameRef.current = true;

                        // xoá 1 item trong nhóm frame (không đóng panel)
                        if (groupKey === "frameShapes") {
                          applyFramePatch({
                            frameShapesIds: removeFrom(
                              selected.frameShapes,
                              optionId
                            ),
                          });
                        } else if (groupKey === "frameTypes") {
                          applyFramePatch({
                            frameTypesIds: removeFrom(
                              selected.frameTypes,
                              optionId
                            ),
                          });
                        } else {
                          applyFramePatch({
                            frameMaterialsIds: removeFrom(
                              selected.frameMaterials,
                              optionId
                            ),
                          });
                        }
                      } else {
                        const groupObj = GROUPS_NO_FRAME.find(
                          (g) => g.key === groupKey
                        );
                        groupObj && toggleOption(groupObj, optionId);
                      }
                    }}
                  >
                    <X className="!w-3 !h-3" />
                  </Button>
                </span>
              );
            })
          )}

          {/* Price chip */}
          {selectedPrice && (
            <span className="px-2 mt-1 mb-1 bg-gray-200 text-gray-700 rounded-full text-xs flex items-center gap-2 cursor-default">
              <span className="leading-none font-medium">
                {currencyFormatter(selectedPrice[0])} -{" "}
                {currencyFormatter(selectedPrice[1])}
              </span>
              <Button
                type="button"
                className="bg-gray-200 text-gray-700 !w-4 !h-4 rounded-full flex items-center justify-center !p-0 hover:bg-black/80 hover:text-white drop-shadow-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPrice(null);
                }}
              >
                <X className="!w-3 !h-3" />
              </Button>
            </span>
          )}

          <Button
            type="button"
            onClick={clearAll}
            className="text-xs text-slate-500 hover:text-gray-800 hover:underline ml-2 drop-shadow-none !p-0"
          >
            Clear All
          </Button>
        </div>
      )}
    </>
  );
}

export default memo(FilterBar);
