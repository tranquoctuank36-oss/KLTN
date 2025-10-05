import { BRANDS } from "@/mocks/brands-mock";
import Image from "next/image";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  // SSG cho tất cả brand
  return BRANDS.map((b) => ({ slug: b.slug }));
}
export const dynamicParams = false;

export default function BrandPage({ params }: { params: { slug: string } }) {
  const brand = BRANDS.find((b) => b.slug === params.slug);
  if (!brand) return notFound();

  return (
    <main className="mx-auto max-w-[1200px] px-6 lg:px-12 py-10">
      <h1 className="text-3xl font-semibold mb-6">{brand.name}</h1>

      {/* Banner brand */}
      <div className="relative w-full aspect-[16/9] mb-8 rounded-2xl overflow-hidden">
        <Image src={brand.logo} alt={brand.name} fill className="object-cover" />
      </div>

      {/* Chỗ hiển thị danh sách sản phẩm của brand (placeholder) */}
      <section>
        <h2 className="text-xl font-medium mb-4">Featured products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* TODO: map dữ liệu sản phẩm theo brand */}
          <div className="h-40 rounded-lg bg-gray-200/10 border border-white/10" />
          <div className="h-40 rounded-lg bg-gray-200/10 border border-white/10" />
          <div className="h-40 rounded-lg bg-gray-200/10 border border-white/10" />
          <div className="h-40 rounded-lg bg-gray-200/10 border border-white/10" />
        </div>
      </section>
    </main>
  );
}
