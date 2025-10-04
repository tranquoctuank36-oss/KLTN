import { Routes } from "@/lib/routes";
import { NeedSection } from "@/types/need";

export const NEED_SECTION: NeedSection[] = [
  {
    title: "Progressive lenses",
    subtitle: "Effortless vision, near and far.",
    image: "/needs/progressive.jpg",
    href: Routes.progressiveGlasses(),
    actions: [
      { label: "Women", href: `${Routes.progressiveGlasses()}?gender=women&type=progressive` },
      { label: "Men", href: `${Routes.progressiveGlasses()}?gender=men&type=progressive` },
    ],
  },
  {
    title: "Sports Glasses",
    subtitle: "Take your vision up a notch.",
    image: "/needs/sport.jpg",
    href: Routes.sportsGlasses(),
    actions: [{ label: "Shop Now", href: `${Routes.sportsGlasses()}?view=all` }],
  },
  {
    title: "Kids' glasses",
    subtitle: "Your kids deserve the best.",
    image: "/needs/kids.jpg",
    href: Routes.kidsGlasses(),
    actions: [
      { label: "Girls", href: `${Routes.kidsGlasses()}?gender=girls` },
      { label: "Boys", href: `${Routes.kidsGlasses()}?gender=boys` },
    ],
  },
  {
    title: "Blue light glasses",
    subtitle: "Keep your eyes protected.",
    image: "/needs/blue_light.jpg",
    href: Routes.blueLightGlasses(),
    actions: [{ label: "Shop Now", href: `${Routes.blueLightGlasses()}?view=all` }],
  },
];
