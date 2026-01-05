"use client";

import { Card, CardContent } from "@/components/ui/card";
import BenefitCard from "./benefit-card";
import { BENEFITS } from "@/mocks/benefits-mock";

export default function BenefitsSection() {
  return (
    <section aria-label="Phần lợi ích" className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((b, idx) => (
            <Card key={`${b.title}-${idx}`} className="border-0 drop-shadow-none">
              <CardContent className="p-0">
                <BenefitCard {...b} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
