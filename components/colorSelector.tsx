"use client";
import { Button } from "@/components/ui/button";
import { ProductImageSet } from "@/types/product";
import { useState } from "react";

function swatchStyleFromColors(colors: string[]): React.CSSProperties {
  if (!colors.length) return {};
  if (colors.length === 1) return { backgroundColor: colors[0] };
  if (colors.length === 2) {
    return { backgroundImage: `linear-gradient(90deg, ${colors[0]} 50%, ${colors[1]} 50%)` };
  }
  const step = 100 / colors.length;
  const stops = colors.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(", ");
  return { backgroundImage: `conic-gradient(${stops})` };
}

type Props = {
  images: ProductImageSet[];
  selected: ProductImageSet;
  onSelect: (img: ProductImageSet) => void;
};

export default function ColorSelector({ images, selected, onSelect }: Props) {
  const [hovering, setHovering] = useState<number | null>(null);

  return (
    <div className="flex gap-3">
      {images.map((img, i) => {
        const isSelected = selected.id === img.id;
        const isHover = hovering === i;
        const ringBase = img.colors[0] ?? "#999";
        const ringShadow = isSelected || isHover ? `0 0 0 1px ${ringBase}` : "none";

        return (
          <div key={img.id} className="relative">
            {isHover && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30">
                <div className="whitespace-nowrap bg-white text-gray-800 text-xs px-2 py-1 rounded shadow border border-gray-200">
                  {img.label}
                </div>
              </div>
            )}

            <Button
              onClick={() => onSelect(img)}
              onMouseEnter={() => setHovering(i)}
              onMouseLeave={() => setHovering(null)}
              className="flex items-center justify-center rounded-full !w-8 !h-8 border p-[4px] !p-0"
              style={{ boxShadow: ringShadow }}
            >
              <span
                className={`block w-6 h-6 rounded-full`}
                style={swatchStyleFromColors(img.colors)}
              />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
