"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  HandCoins,
  RefreshCcw,
  CalendarDays,
} from "lucide-react";

type Item = {
  icon: React.ReactNode;
  title: string;
};

const ITEMS: Item[] = [
  { icon: <HandCoins className="h-7 w-7" />, title: "100% money-back guarantee" },
  { icon: <RefreshCcw className="h-7 w-7" />, title: "45-day return or exchange" },
  { icon: <CalendarDays className="h-7 w-7" />, title: "365-day warranty" },
];

export default function GuaranteeSection() {
  return (
    <section className="w-full bg-blue-50 border-t-1">
      <div className="mx-auto max-w-5xl pt-6 lg:pt-10 pb-3 lg:pb-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
            <ShieldCheck className="h-6 w-6 text-slate-700" />
          </div>

          <h2 className="text-1xl md:text-2xl font-bold text-slate-900">
            Perfect Pair Guarantee.
          </h2>

          <p className="max-w-1xl font-medium text-gray-500 leading-relaxed">
            As glasses wearers, we&apos;re committed to ensuring you the perfect pair,
            <br /> with stylish frames and premium quality lenses.
          </p>
        </div>

        {/* 3 benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ITEMS.map((it) => (
            <Card
              key={it.title}
              className="border-none bg-transparent shadow-none"
            >
              <CardContent className="p-0">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                    <span className="text-slate-800">{it.icon}</span>
                  </div>
                  <p className="font-medium text-gray-500">{it.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="h-[1px] w-full bg-slate-200/80" />
    </section>
  );
}
