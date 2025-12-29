"use client";

import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/FloatingInput";
import { Loader2 } from "lucide-react";
import type { Province, District, Ward } from "@/services/shippingService";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  selectedProvince: string;
  selectedDistrict: string;
  selectedWard: string;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  errors: { [key: string]: string };
  isLoading: boolean;
  isLoggedIn: boolean;
  hasAddress: boolean | null;
  isAddingNewAddress?: boolean;
  isEditing?: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onWardChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
};

export default function InputForm({
  firstName,
  lastName,
  email,
  phone,
  address,
  country,
  selectedProvince,
  selectedDistrict,
  selectedWard,
  provinces,
  districts,
  wards,
  errors,
  isLoading,
  isLoggedIn,
  hasAddress,
  isAddingNewAddress = false,
  isEditing = false,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onAddressChange,
  onCountryChange,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onSubmit,
  onCancel,
}: Props) {
  const showTwoButtons =
    (isLoggedIn && hasAddress && isEditing) ||
    (isLoggedIn && isAddingNewAddress);

  return (
    <form onSubmit={onSubmit}>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">1. Shipping Information</h1>
        {/* <span className="text-sm text-gray-500">* Required Fields</span> */}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            id="firstName"
            label="First Name"
            required
            value={firstName}
            onChange={onFirstNameChange}
          />
          <FloatingInput
            id="lastName"
            label="Last Name"
            required
            value={lastName}
            onChange={onLastNameChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FloatingInput
              id="email"
              type="email"
              label="Email Address"
              required
              value={email}
              onChange={onEmailChange}
              disabled={
                (isLoggedIn && !hasAddress) ||
                (isLoggedIn && isAddingNewAddress)
              }
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <FloatingInput
              id="phone"
              label="Phone Number"
              required
              value={phone}
              onChange={onPhoneChange}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            id="country"
            label="Country"
            as="select"
            value={country}
            onChange={onCountryChange}
            options={[{ value: "VN", label: "Vietnam" }]}
            required
          />

          <FloatingInput
            id="province"
            label="Province"
            as="select"
            value={selectedProvince}
            onChange={onProvinceChange}
            options={provinces.map((p) => ({
              value: p.ProvinceID,
              label: p.ProvinceName,
            }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <FloatingInput
            id="district"
            label="District"
            as="select"
            value={selectedDistrict}
            onChange={onDistrictChange}
            options={
              districts.length > 0
                ? districts.map((d) => ({
                    value: d.DistrictID,
                    label: d.DistrictName,
                  }))
                : [{ value: "", label: "No data" }]
            }
            required
          />
          <FloatingInput
            id="ward"
            label="Ward"
            as="select"
            value={selectedWard}
            onChange={onWardChange}
            options={
              wards.length > 0
                ? wards.map((w) => ({
                    value: w.WardCode,
                    label: w.WardName,
                  }))
                : [{ value: "", label: "No data" }]
            }
            required
          />
        </div>

        <FloatingInput
          id="address"
          label="Building, House Number, Street Name"
          required
          value={address}
          onChange={onAddressChange}
        />

        {showTwoButtons ? (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="h-12 w-50 bg-white border border-2 border-gray-400 hover:border-gray-800 text-lg font-bold text-gray-400 hover:text-gray-800 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-50 bg-blue-600 text-white text-lg font-bold hover:bg-blue-800 rounded-lg disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="!w-6 !h-6 animate-spin" />
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-50 bg-blue-600 text-white text-lg font-bold hover:bg-blue-800 rounded-lg disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="!w-6 !h-6 animate-spin" />
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
