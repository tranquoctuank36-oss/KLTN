"use client";

import { NEEDS } from "@/mocks/needs-mock";
import NeedCard from "./need-card";



export default function NeedSection() {
  return (
    <section className="max-w-full px-20 lg:px-30 py-10 mx-auto">
      <h2 className="font-sans font-light text-center text-3xl md:text-4xl">Một lựa chọn cho mọi nhu cầu</h2>
      <p className="font-sans font-light text-center text-lg mt-2">
        Khám phá những mẫu kính tuyệt vời cho cả nhu cầu hằng ngày lẫn những khoảnh khắc đặc biệt.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {NEEDS.map((t) => (
          <NeedCard key={t.title} tile={t} />
        ))}
      </div>
    </section>
  );
}
