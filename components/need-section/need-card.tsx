"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NeedSection } from "@/types/need";

export default function NeedCard({ tile }: { tile: NeedSection }) {
  const router = useRouter();

  return ( 
    <Card className="rounded-3xl border-0 drop-shadow-none">
      <CardContent className="p-0">
        <Link
          href={tile.href}
          className="group block relative w-full overflow-hidden rounded-3xl"
        >
          <div className="relative aspect-[5/7]">
            <Image
              src={tile.image}
              alt={tile.title}
              fill
              sizes="(min-width:1280px) 25vw, (min-width:768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
              priority={tile.title === "Tròng Lục Tiến Tiến"}  
            />

            {/* Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
              <h3 className="text-white text-1xl sm:text-2xl font-semibold">
                {tile.title}
              </h3>
              <p className="mt-1 text-white font-sans">{tile.subtitle}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                {tile.actions.map((a) => (
                  <Button
                    key={a.label}
                    type="button"
                    variant="outline"
                    className="border-white border-2 !rounded-3xl text-white hover:text-gray-900 hover:bg-white/95 bg-white/0"
                    onClick={(e) => {
                      e.preventDefault();      // không mở Link cha
                      e.stopPropagation();     // không bubble lên Link cha
                      router.push(a.href);     // điều hướng theo filter
                    }}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
