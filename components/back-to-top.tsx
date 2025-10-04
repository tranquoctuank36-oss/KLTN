"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const showAfter = window.innerHeight / 2;
      setVisible(window.scrollY >= showAfter);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <Button
      aria-label="Back to top"
      onClick={goTop}
      className={[
        "fixed right-6 md:right-15 bottom-40 z-50",
        "group grid place-items-center rounded-full",
        "h-12 w-12 md:h-14 md:w-14",
        "bg-gray-400 text-white shadow-lg",
        "transition-all duration-200",
        "ring-6 ring-gray-300/40",
        "hover:bg-blue-600 hover:ring-sky-300",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >

      <ArrowUp className="!h-6 !w-6" strokeWidth={4}/>
      
    </Button>
  );
}
