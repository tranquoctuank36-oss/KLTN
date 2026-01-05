"use client";

import { Benefit } from "@/types/benefit";

type BenefitCardProps = Benefit;

export default function BenefitCard({ icon: Icon, title, desc }: BenefitCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon wrapper */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4fafe] ring-1 ring-sky-100 mb-5">
        <Icon className="h-7 w-7 text-sky-600" />
      </div>

      {/* Title */}
      <h3 className="text-base font-bold tracking-tight mb-1">{title}</h3>

      {/* Description */}
      <p className="text-[13.5px] text-gray-500 font-medium leading-relaxed max-w-[28ch] md:max-w-[40ch]">
        {desc}
      </p>
    </div>
  );
}
