"use client";

import { useEffect, useRef } from "react";
import Mainbar from "./MainNavbar";
import Topbar from "./TopNavbar";

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const h = headerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };
    update();

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        id="page-header"
        className="fixed top-0 left-0 right-0 z-50 border-b-2 border-gray-200 shadow-md bg-white"
      >
        <Topbar />
        <Mainbar />
      </header>
      <div style={{ height: "var(--header-h)" }} />
    </>
  );
}
