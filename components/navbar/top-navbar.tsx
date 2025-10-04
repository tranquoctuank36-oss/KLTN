"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

const messages = [
  "100% Money-Back Guarantee + 365 Day Warranty + Free Shipping and Returns",
  "Invite friends & you’ll both get $25 off  Get it Now",
];

export default function Topbar() {
  const [index, setIndex] = useState(0);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      context.font = "12px Arial";
      const widths = messages.map((msg) => context.measureText(msg).width);
      setMaxWidth(Math.max(...widths));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev === messages.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const prevMessage = () => {
    setDirection(-1);
    setIndex((prev) => (prev === 0 ? messages.length - 1 : prev - 1));
  };

  const nextMessage = () => {
    setDirection(1);
    setIndex((prev) => (prev === messages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-gray-950 text-xs text-gray-300">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-3 flex flex-wrap justify-between items-center">
        {/* Top Left */}
        <div className="flex flex-wrap items-center ">
          <Button
            onClick={prevMessage}
            className="p-1 h-6 w-6 rounded-md bg-gray-950 hover:bg-gray-700"
          >
            <ChevronLeft size={16} />
          </Button>

          <div
            className="relative text-center z-0 overflow-hidden mx-2"
            style={{ minWidth: maxWidth ? `${maxWidth}px` : "auto" }}
          >
            <div className="relative h-5">
              {/* Text mới chạy vào */}
              <motion.div
                key={index}
                initial={{ x: direction > 0 ? "100%" : "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-full text-center"
              >
                {index === 0 ? (
                  <span>{messages[index]}</span>
                ) : (
                  <span>
                    Invite friends & you’ll both get $25 off{" "}
                    <a href="#" className="underline hover:text-white">
                      Get it Now
                    </a>
                  </span>
                )}
              </motion.div>
              {/* Text cũ chạy ra ngoài */}
              <motion.div
                key={`prev-${index}`}
                initial={{ x: "0%" }}
                animate={{ x: direction > 0 ? "-100%" : "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-full text-center"
              >
                {direction > 0
                  ? messages[index === 0 ? messages.length - 1 : index - 1]
                  : messages[index === messages.length - 1 ? 0 : index + 1]}
              </motion.div>
            </div>
          </div>

          <Button
            onClick={nextMessage}
            className="p-1 h-6 w-6 rounded-md bg-gray-950 hover:bg-gray-700"
          >
            <ChevronRight size={12} />
          </Button>
        </div>

        {/* Top Right */}
        <div className="flex flex-wrap items-center gap-4">
          <span>0776-913-901 Every day 7am – midnight VN time</span>
          <span className="text-gray-500">|</span>
          <Link href="#" className="hover:underline">
            Help & Support
          </Link>
        </div>
      </div>
    </div>
  );
}
