"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "@/services/shippingService";
import { getAddresses } from "@/services/userService";

type Props = {
  recipientName: string;
  phone: string;
  email: string;
  address: string;
  wardNameDisplay: string;
  districtNameDisplay: string;
  provinceNameDisplay: string;
  isDefault: boolean;
  isLoggedIn: boolean;
  note: string;
  onEdit: () => void;
  onNewAddress: () => void;
  onAddressChange: (addressData: any) => void;
  onFormValidChange?: (isValid: boolean) => void;
  onNoteChange: (value: string) => void;
};

export default function DisplayForm({
  recipientName,
  phone,
  email,
  address,
  wardNameDisplay,
  districtNameDisplay,
  provinceNameDisplay,
  isDefault,
  isLoggedIn,
  note,
  onEdit,
  onNewAddress,
  onAddressChange,
  onFormValidChange,
  onNoteChange,
}: Props) {
  const [showAddressList, setShowAddressList] = useState(false);
  const [addressList, setAddressList] = useState<any[]>([]);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAddressList(false);
      }
    };

    if (showAddressList) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddressList]);

  const handleAddressSelect = async (addr: any) => {
    onFormValidChange?.(false);

    try {
      const provs = await getProvinces();
      const foundProvince = provs.find(
        (p) => p.ProvinceName === addr.provinceName
      );
      if (!foundProvince) return;

      const dists = await getDistricts(foundProvince.ProvinceID);
      const foundDistrict = dists.find(
        (d) => d.DistrictName === addr.districtName
      );
      if (!foundDistrict) return;

      const wds = await getWards(foundDistrict.DistrictID);
      const foundWard = wds.find((w) => w.WardName === addr.wardName);
      if (!foundWard) return;

      onAddressChange({
        recipientName: addr.recipientName || "",
        phone: addr.recipientPhone || "",
        address: addr.addressLine || "",
        provinceNameDisplay: addr.provinceName || "",
        districtNameDisplay: addr.districtName || "",
        wardNameDisplay: addr.wardName || "",
        selectedProvince: String(foundProvince.ProvinceID),
        selectedDistrict: String(foundDistrict.DistrictID),
        selectedWard: String(foundWard.WardCode),
        isDefault: addr.isDefault,
        currentAddressId: addr.id,
      });

      setShowAddressList(false);
    } catch (err) {
      console.error("⚠️ Error updating address:", err);
      onFormValidChange?.(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">1. Shipping Information</h1>
        <Button
          onClick={onEdit}
          className="bg-gray-100 text-gray-800 hover:bg-gray-300 rounded-full w-32 h-10"
        >
          Edit
        </Button>
      </div>

      <div className="text-gray-800 space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{recipientName}</p>
            {isDefault && (
              <span className="bg-gray-400 text-white text-sm font-medium px-1.5 py-0.5 rounded">
                Default
              </span>
            )}
          </div>
          {isLoggedIn && (
            <Button
              onClick={onNewAddress}
              className="bg-gray-100 text-gray-800 hover:bg-gray-300 rounded-full w-32 h-10"
            >
              New Address
            </Button>
          )}
        </div>
        <p className="text-gray-400">{phone}</p>
        <p className="text-gray-400">{email}</p>
        <p className="text-gray-800">
          {address}
          {wardNameDisplay && `, ${wardNameDisplay}`}
          {districtNameDisplay && `, ${districtNameDisplay}`}
          {provinceNameDisplay && `, ${provinceNameDisplay}`}
        </p>
      </div>

      {isLoggedIn && (
        <div className="mt-4 relative" ref={addressDropdownRef}>
          <button
            type="button"
            onClick={async () => {
              if (addressList.length === 0) {
                const list = await getAddresses();
                setAddressList(list);
              }
              setShowAddressList((prev) => !prev);
            }}
            className="text-gray-800 underline hover:no-underline text-base font-bold cursor-pointer"
          >
            Choose different address from my address book &gt;
          </button>

          {showAddressList && (
            <div className="absolute z-50 mt-2 w-[500px] bg-white border border-gray-300 rounded-lg shadow-lg p-2 max-h-[300px] overflow-y-auto">
              {[...addressList]
                .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
                .map((addr: any, index: number) => {
                  const isSelected =
                    addr.addressLine === address &&
                    addr.wardName === wardNameDisplay &&
                    addr.districtName === districtNameDisplay &&
                    addr.provinceName === provinceNameDisplay;

                  return (
                    <label
                      key={index}
                      className={`flex items-start gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 h-4 w-4 text-blue-600"
                        checked={isSelected}
                        onChange={() => handleAddressSelect(addr)}
                      />

                      <div className="flex flex-col text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold capitalize">
                            {addr.recipientName}
                          </span>
                          {addr.isDefault && (
                            <span className="text-xs bg-gray-400 text-white px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500">
                          {addr.recipientPhone}
                        </span>
                        <span className="text-gray-500">{email}</span>
                        <span className="text-gray-800">
                          {addr.addressLine}, {addr.wardName},{" "}
                          {addr.districtName}, {addr.provinceName}
                        </span>
                      </div>
                    </label>
                  );
                })}
            </div>
          )}
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Note"
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none mt-5 text-base focus:border-gray-500 focus:outline-none"
      />
    </div>
  );
}
