import { type FilterGroup } from "@/types/filter";

export const FILTER_GROUPS: FilterGroup[] = [
  {
    key: "type",
    label: "Glasses Type",
    options: [
      { id: "eyeglasses", label: "Eyeglasses", count: 507 },
      { id: "sunglasses", label: "Sunglasses", count: 420 },
    ],
  },
  {
    key: "gender",
    label: "Gender",
    options: [
      { id: "women", label: "Women", count: 493 },
      { id: "men", label: "Men", count: 519 },
    ],
  },
  {
    key: "shape",
    label: "Shape",
    options: [
      { id: "round", label: "Round" },
      { id: "square", label: "Square" },
      { id: "cat-eye", label: "Cat-eye" },
      { id: "aviator", label: "Aviator" },
    ],
  },
  {
    key: "size",
    label: "Size",
    options: [
      { id: "n", label: "Narrow", count: 57 },
      { id: "a", label: "Average", count: 590 },
      { id: "w", label: "Wide", count: 274 },
      { id: "e", label: "Extra Wide", count: 81 },
    ],
  },
  {
    key: "features",
    label: "Features",
    options: [
      { id: "blue-light", label: "Blue light" },
      { id: "progressive", label: "Progressive" },
      { id: "photochromic", label: "Photochromic" },
    ],
  },
  {
    key: "brands",
    label: "Brands",
    options: [
      { id: "rayban", label: "Ray-Ban" },
      { id: "oakley", label: "Oakley" },
      { id: "gucci", label: "Gucci" },
    ],
  },
  {
    key: "color",
    label: "Color",
    options: [
      { id: "black", label: "Black" },
      { id: "tortoise", label: "Tortoise" },
      { id: "gold", label: "Gold" },
    ],
  },
  {
    key: "price",
    label: "Price",
    options: [
      { id: "clipon", label: "Clip-on" },
      { id: "lightweight", label: "Lightweight" },
    ],
  },
];
