import { ReactNode } from "react";

export type SupportItem = {
  icon: ReactNode;
  title: string;
  desc: string;
  href?: string;
};

export type FooterLink = {
  label: string;
  href?: string;
};

export type FooterGroup = {
  title: string;
  links: FooterLink[];
};
