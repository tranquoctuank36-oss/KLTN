"use client";

import { useEffect, useState } from "react";
import { getShippingFee } from "@/services/shippingService";
import type { ShippingFeePayload } from "@/types/shipping";
import { Loader2 } from "lucide-react";

export type ShippingMethod = {
  id: string;
  label: string;
  description: string;
  fee: number;
};

type Props = {
  codValue: number;
  toDistrictId: number;
  toWardCode: string;
  serviceTypeId: number;
  onChange?: (method: ShippingMethod) => void;
  onLoadingChange?: (loading: boolean) => void; // Thêm prop này
  onErrorChange?: (error: string | null) => void;
};

export default function ShippingMethods({
  codValue,
  toDistrictId,
  toWardCode,
  serviceTypeId,
  onChange,
  onLoadingChange,
  onErrorChange,
}: Props) {
  const [selected, setSelected] = useState("standard");
  const [fee, setFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<ShippingMethod>({
    id: "standard",
    label: "Standard delivery",
    description: "Delivery during business hours",
    fee: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setFee(null);
    onErrorChange?.(null); 

    const isValidDistrict = Number(toDistrictId) > 0;
    const isValidWard = !!toWardCode && toWardCode !== "";
    if (!isValidDistrict || !isValidWard) {
      setError(null);
      setLoading(false);
      onLoadingChange?.(false);
      return;
    }
    setLoading(true);
    setError(null);
    onLoadingChange?.(true);
    let cancelled = false;

    const fetchFee = async () => {
      try {
        const payload: ShippingFeePayload = {
          toDistrictId,
          toWardCode,
          codValue,
          serviceTypeId: serviceTypeId,
        };

        const feeValue = await getShippingFee(payload);
        if (cancelled) return;
        console.log("Got fee:", feeValue);

        setFee(feeValue);
        onErrorChange?.(null);

        const updatedMethod: ShippingMethod = {
          ...method,
          fee: feeValue,
        };

        setMethod(updatedMethod);
        onChange?.(updatedMethod);
      } catch (err) {
        const errorMsg = "Delivery is not available in this area!";
        setError(errorMsg);
        setFee(null);
        onErrorChange?.(errorMsg);
      } finally {
        if (!cancelled) {
          console.log("🧹 Done fetch, setLoading(false)");
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
    };

    fetchFee();
    return () => {
      cancelled = true;
    };
  }, [toDistrictId, toWardCode, codValue, serviceTypeId]);

  const handleSelect = (method: ShippingMethod) => {
    setSelected(method.id);
    onChange?.(method);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 pt-8 pb-10">
      <h2 className="text-2xl font-bold mb-5">2. Shipping Method</h2>

      <label
        key="standard"
        className={`flex justify-between items-center border rounded-lg p-4 cursor-pointer transition ${
          selected === "standard"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="shipping"
            value="standard"
            checked={selected === "standard"}
            onChange={() => {
              if (error || fee === null) return;
              handleSelect(method);
            }}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <p className="font-semibold text-gray-800">{method.label}</p>
            <p className="text-sm text-gray-500">{method.description}</p>
          </div>
        </div>

        <span className="font-medium text-gray-700 min-w-[90px] text-right">
          {error ? (
            <span className="text-red-500 text-sm text-right">{error}</span>
          ) : loading || fee === null ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          ) : (
            `${fee.toLocaleString("en-US")}đ`
          )}
        </span>
      </label>
    </div>
  );
}
