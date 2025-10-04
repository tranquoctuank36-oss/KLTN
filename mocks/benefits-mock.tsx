import { Truck, BadgeDollarSign, Sparkles, ShieldCheck } from "lucide-react";
import type { Benefit } from "@/types/benefit";

export const BENEFITS: Benefit[] = [
  {
    icon: <Truck className="h-7 w-7 text-sky-600" />,
    title: "Free shipping and returns",
    desc: "Enjoy free shipping and returns on all glasses and contact lenses, no minimum (US & Canada).",
  },
  {
    icon: <BadgeDollarSign className="h-7 w-7 text-sky-600" />,
    title: "100% money-back guarantee",
    desc: "Return your glasses within the first 14 days for a full refund, no questions asked, including any prescription and lens upgrade.",
  },
  {
    icon: <Sparkles className="h-7 w-7 text-sky-600" />,
    title: "State-of-the-art lenses",
    desc: "Our high-quality lenses are expertly crafted and digitally surfaced in the US, made only from premium-grade materials.",
  },
  {
    icon: <ShieldCheck className="h-7 w-7 text-sky-600" />,
    title: "Authorized Reseller",
    desc: "All brands and designer eyewear on our site are 100% authentic, guaranteeing you're getting the finest frames and lenses.",
  },
];
