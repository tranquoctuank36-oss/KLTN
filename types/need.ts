export type Action = { label: string; href: string };

export type NeedSection = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  actions: Action[];
};
