"use client";

import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/FloatingInput";
import { Loader2 } from "lucide-react";
import { District, Province, Ward } from "@/types/location";
import { useState } from "react";

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
  const [forceValidate, setForceValidate] = useState(false);

  const showTwoButtons =
    (hasAddress && isEditing) ||
    isAddingNewAddress;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra tất cả required fields
    const requiredFields = {
      firstName,
      lastName,
      email,
      phone,
      address,
      country,
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
    };

    const hasEmptyRequiredField = Object.values(requiredFields).some(
      (value) => !value || value.trim() === ""
    );

    if (hasEmptyRequiredField) {
      setForceValidate(true);
      return;
    }

    // Reset validation state và submit
    setForceValidate(false);
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">1. Thông tin vận chuyển</h1>
        {/* <span className="text-sm text-gray-500">* Required Fields</span> */}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            id="firstName"
            label="Họ"
            required
            value={firstName}
            onChange={onFirstNameChange}
            forceValidate={forceValidate}
          />
          <FloatingInput
            id="lastName"
            label="Tên"
            required
            value={lastName}
            onChange={onLastNameChange}
            forceValidate={forceValidate}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FloatingInput
              id="email"
              type="email"
              label="Địa chỉ Email"
              required
              value={email}
              onChange={onEmailChange}
              disabled={
                !hasAddress ||
                isAddingNewAddress
              }
              forceValidate={forceValidate}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <FloatingInput
              id="phone"
              label="Số điện thoại"
              required
              value={phone}
              onChange={onPhoneChange}
              forceValidate={forceValidate}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* <FloatingInput
            id="country"
            label="Quốc gia"
            as="select"
            value={country}
            onChange={onCountryChange}
            options={[{ value: "VN", label: "Việt Nam" }]}
            required
          /> */}

          <FloatingInput
            id="province"
            label="Tỉnh/Thành Phố"
            as="select"
            value={selectedProvince}
            onChange={onProvinceChange}
            options={provinces.map((p) => ({
              value: String(p.id),
              label: p.name,
            }))}
            forceValidate={forceValidate}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <FloatingInput
            id="district"
            label="Quận/Thị Xã"
            as="select"
            value={selectedDistrict}
            onChange={onDistrictChange}
            options={
              districts.length > 0
                ? districts.map((d) => ({
                    value: String(d.id),
                    label: d.name,
                  }))
                : [{ value: "", label: "Không có dữ liệu" }]
            }
            required
            forceValidate={forceValidate}
          />
          <FloatingInput
            id="ward"
            label="Phường/Xã"
            as="select"
            value={selectedWard}
            onChange={onWardChange}
            options={
              wards.length > 0
                ? wards.map((w) => ({
                    value: String(w.id),
                    label: w.name,
                  }))
                : [{ value: "", label: "Không có dữ liệu" }]
            }
            required
            forceValidate={forceValidate}
          />
        </div>

        <FloatingInput
          id="address"
          label="Tòa Nhà, Số Nhà, Tên Đườıng"
          required
          value={address}
          onChange={onAddressChange}
          forceValidate={forceValidate}
        />

        {showTwoButtons ? (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="h-12 w-50 bg-white border border-2 border-gray-400 hover:border-gray-800 text-lg font-bold text-gray-400 hover:text-gray-800 rounded-lg"
            >
              Hủy Bỏ
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
                "Lưu"
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
                "Tiếp Tục"
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
