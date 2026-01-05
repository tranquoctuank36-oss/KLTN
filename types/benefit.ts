import { ComponentType } from "react";

export type Benefit = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};
