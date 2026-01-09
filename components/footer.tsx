"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SUPPORT_ITEMS, FOOTER_LINKS } from "@/mocks/footer-mock";

export default function Footer() {
  return (
    <footer className="bg-[#050524] text-gray-300 text-sm">
      <div className="max-w-full px-20 lg:px-30 py-10 space-y-10">
        {/* Support Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {SUPPORT_ITEMS.map((item) => (
            <div
              key={item.title}
              className="group block rounded-xl focus:outline-none w-full max-w-md"
            >
              <Card
                className="bg-transparent border border-gray-700/80 rounded-xl 
                           transition-all duration-200
                           group-hover:bg-white/5 group-hover:border-gray-500"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {item.icon}
                    <div>
                      <h4 className="font-medium text-white">
                        {item.title}
                      </h4>
                      <p className="text-[13px] text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-b border-gray-700/80" />

        {/* Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-40 justify-items-start max-w-5xl mx-auto">
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h5 className="font-semibold text-white mb-3">{col.title}</h5>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href || "#"}
                      className="transition-colors text-gray-400 hover:text-blue-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700/80 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} GlassesShop. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
}
