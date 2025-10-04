"use client";

import { NEED_SECTION } from "@/mocks/needs-mock";
import NeedCard from "./need-card";



export default function NeedSection() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 lg:px-20 py-10">
      <h2 className="font-sans font-light text-center text-3xl md:text-4xl">A pair for every need</h2>
      <p className="font-sans font-light text-center text-lg mt-2">
        Discover great glasses for both your day-to-day and the extraordinary.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {NEED_SECTION.map((t) => (
          <NeedCard key={t.title} tile={t} />
        ))}
      </div>
    </section>
  );
}
