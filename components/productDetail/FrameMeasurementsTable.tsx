"use client";

import { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function FrameMeasurementsTable({ product }: Props) {
  const items = [
    {
      label: "Lens Width",
      value: product.frameDetail?.lensWidth,
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 70 30"
          className="w-30 h-8"
          fill="none"
        >
          <path
            stroke="#89959C"
            strokeWidth="1.5"
            d="M28.5 10.5a4.5 4.5 0 0 1 9 0m-9 0c0 2-.5 4-1.3 5.9-2.7 7.1-7.8 8.6-13.7 8.6-5.8 0-12.1-4.6-12-14.2C1.6 1.2 8.3 1 14.8 1c10.5 0 13.8 4.3 13.7 9.5Zm9 0c0 2 .5 4 1.2 5.9 2.8 7.1 8 8.6 13.8 8.6 5.8 0 12.1-4.6 12-14.2C64.4 1.2 57.7 1 51.2 1c-10.5 0-13.8 4.3-13.7 9.5Z"
          />
          <path
            stroke="#2196F3"
            strokeWidth="1.5"
            d="M24.5 12.5h-19m19 0-3 3m3-3-3-3m-16 3 3-3m-3 3 3 3"
          />
        </svg>
      ),
    },
    {
      label: "Lens Height",
      value: product.frameDetail?.lensHeight,
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 70 30"
          className="w-30 h-8"
          fill="none"
        >
          <path
            stroke="#89959C"
            strokeWidth="1.5"
            d="M28.5 10.5a4.5 4.5 0 0 1 9 0m-9 0c0 2-.5 4-1.3 5.9-2.7 7.1-7.8 8.6-13.7 8.6-5.8 0-12.1-4.6-12-14.2C1.6 1.2 8.3 1 14.8 1c10.5 0 13.8 4.3 13.7 9.5Zm9 0c0 2 .5 4 1.2 5.9 2.8 7.1 8 8.6 13.8 8.6 5.8 0 12.1-4.6 12-14.2C64.4 1.2 57.7 1 51.2 1c-10.5 0-13.8 4.3-13.7 9.5Z"
          />
          <path
            stroke="#2196F3"
            strokeWidth="1.5"
            d="M51.5 21V5m0 16-3-3m3 3 3-3m-3-13 3 3m-3-3-3 3"
          />
        </svg>
      ),
    },
    {
      label: "Bridge Width",
      value: product.frameDetail?.bridgeWidth,
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 70 30"
          className="w-30 h-8"
          fill="none"
        >
          <path
            stroke="#89959C"
            strokeWidth="1.5"
            d="M28.5 14.5a4.5 4.5 0 0 1 9 0m-9 0c0 2-.5 4-1.3 5.9-2.7 7.1-7.8 8.6-13.7 8.6-5.8 0-12.1-4.6-12-14.2C1.6 5.2 8.3 5 14.8 5c10.5 0 13.8 4.3 13.7 9.5Zm9 0c0 2 .5 4 1.2 5.9 2.8 7.1 8 8.6 13.8 8.6 5.8 0 12.1-4.6 12-14.2C64.4 5.2 57.7 5 51.2 5c-10.5 0-13.8 4.3-13.7 9.5Z"
          />
          <path
            stroke="#2196F3"
            strokeWidth="1.5"
            d="M38 4H28m10 0-3 3m3-3-3-3m-7 3 3-3m-3 3 3 3"
          />
        </svg>
      ),
    },
    {
      label: "Temple Length",
      value: product.frameDetail?.templeLength,
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 70 37"
          className="w-30 h-8"
          fill="none"
        >
          <path
            stroke="#2196F3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M19 14.45 2.5 3.1M19 14.45l-3.34.7m3.34-.7-1.61-4.7M2.5 3.1l2.89-1.6M2.51 3.11l1.16 4.26"
          />
          <path
            stroke="#89959C"
            strokeWidth="1.5"
            d="M40.89 20.74c.28-.62 1.62-3.17 4.12-3.17 2.58 0 3.4 2.03 3.54 2.41m-7.66.76-.04-.32c-1.27-7.61-11.04-5.32-15.61-4.37a8.32 8.32 0 0 0-6.54 6.27m22.19-1.58c.46 3.67-.77 12.83-10.01 15.23-9.52 2.48-11.87-4.25-12.44-9.58-.15-1.46-.05-2.83.26-4.07m29.85-2.34.07-.67a8.23 8.23 0 0 1 1.5-3.76c2.1-2.83 5.56-3.82 10.72-4.66M48.54 20c-.16 2 .08 4.95 1.95 8.19 3.02 4.65 8.67 3.82 8.76 3.8 8.83-.51 11.87-8.25 11.75-14.1-.12-5.25-2.4-7.62-7.61-7.3a19.93 19.93 0 0 0-2.55.31M18.7 22.32 4.82 13.04a2.44 2.44 0 0 0-3.1.31c-.48.48-.72 1.1-.72 1.73v3.41m46.18-7.63V7.92c0-.32 0-.64.1-.95a2.45 2.45 0 0 1 3.5-1.45l10.06 5.37"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-15">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-700 text-lg">Frame Measurements:</p>
        {/* <a
          href="#"
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          Find My Size
        </a> */}
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, idx) => (
            <div
              key={it.label}
              className={`bg-white ${
                idx !== items.length - 1 ? "lg:border-r" : ""
              } border-gray-200`}
            >
              <div className="bg-gray-100 text-gray-700 font-semibold px-5 py-2 border-b border-gray-200">
                {it.label}:
              </div>
              <div className="flex flex-col items-center justify-center py-2 text-center">
                {it.svg}
                <div className="text-gray-800 text-xm font-semibold">{it.value ? `${it.value} mm` : "-"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
