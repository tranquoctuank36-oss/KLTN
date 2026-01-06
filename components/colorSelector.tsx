"use client";
import { Button } from "@/components/ui/button";
import { ProductVariants } from "@/types/productVariants";
import { useState } from "react";

function swatchStyleFromColors(colors: string[]): React.CSSProperties {
  if (!colors.length) return {};
  if (colors.length === 1) return { backgroundColor: colors[0] };
  if (colors.length === 2) {
    return {
      backgroundImage: `linear-gradient(90deg, ${colors[0]} 50%, ${colors[1]} 50%)`,
    };
  }
  const step = 100 / colors.length;
  const stops = colors
    .map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`)
    .join(", ");
  return { backgroundImage: `conic-gradient(${stops})` };
}

// Hàm tính màu trung bình từ nhiều hex
function averageColor(colors: string[]): string {
  if (!colors.length) return "#999";

  let r = 0, g = 0, b = 0;
  colors.forEach((hex) => {
    const c = hex.replace("#", "");
    const bigint = parseInt(c, 16);
    r += (bigint >> 16) & 255;
    g += (bigint >> 8) & 255;
    b += bigint & 255;
  });
  r = Math.round(r / colors.length);
  g = Math.round(g / colors.length);
  b = Math.round(b / colors.length);

  return `rgb(${r}, ${g}, ${b})`;
}

function ringStyleFromColors(colors: string[], isActive: boolean): React.CSSProperties {
  if (!colors.length) return {};
  const mixed = averageColor(colors);

  return isActive
    ? { boxShadow: `0 0 0 2px ${mixed}` }
    : {};
}

type Props = {
  variants: ProductVariants[];
  selected: ProductVariants | null;
  onSelect: (variant: ProductVariants) => void;
};

export default function ColorSelector({ variants, selected, onSelect }: Props) {
  const [hovering, setHovering] = useState<number | null>(null);

  return (
    <div className="flex gap-3">
      {variants.map((variant, i) => {
        const isSelected = selected?.id === variant.id;
        const isHover = hovering === i;
        const hexColors = variant.colors?.map((c: { hexCode: string }) => c.hexCode) || [];

        const label =
          variant.colors && variant.colors.length > 1
            ? variant.colors.map((c: { name: string }) => c.name).join(" / ")
            : variant.colors?.[0]?.name || "";

        return (
          <div key={variant.id} className="relative">
            {isHover && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30">
                <div className="whitespace-nowrap bg-white text-gray-800 text-xs px-2 py-1 rounded shadow border border-gray-200">
                  {label}
                </div>
              </div>
            )}

            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(variant);
              }}
              onMouseEnter={() => setHovering(i)}
              onMouseLeave={() => setHovering(null)}
              className="flex items-center justify-center rounded-full !w-7 !h-7 !p-0"
              style={ringStyleFromColors(hexColors, isSelected || isHover)}
            >
              <span
                className="block w-5 h-5 rounded-full"
                style={swatchStyleFromColors(hexColors)}
              />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
