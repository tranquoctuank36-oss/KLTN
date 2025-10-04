"use client";

import { useState } from "react";

export type ShippingMethod = {
  id: string;
  label: string;
  description: string;
  fee: number; // 👈 chỉ giữ fee
};

const shippingOptions: ShippingMethod[] = [
  {
    id: "standard",
    label: "4-5 business days",
    description: "Standard Delivery",
    fee: 0,
  },
  {
    id: "expedited",
    label: "2-3 business days",
    description: "Expedited Delivery",
    fee: 9.95,
  },
  {
    id: "express",
    label: "1 business day",
    description: "Express Delivery",
    fee: 12.95,
  },
];

export default function ShippingMethods({
  onChange,
}: {
  onChange?: (method: ShippingMethod) => void;
}) {
  const [selected, setSelected] = useState<string>("standard");

  const handleSelect = (method: ShippingMethod) => {
    setSelected(method.id);
    onChange?.(method);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 pt-8 pb-10">
      <h2 className="text-2xl font-bold mb-5">Shipping Method</h2>

      <div className="space-y-3">
        {shippingOptions.map((method) => (
          <label
            key={method.id}
            className={`flex justify-between items-center border rounded-lg p-4 cursor-pointer transition 
              ${
                selected === method.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={selected === method.id}
                onChange={() => handleSelect(method)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="font-semibold text-gray-800">{method.label}</p>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            </div>
            <span className="font-medium text-gray-700">
              {method.fee === 0 ? "Free" : `$${method.fee.toFixed(2)}`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
