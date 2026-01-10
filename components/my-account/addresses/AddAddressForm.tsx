"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import FloatingInput from "@/components/ui-common/FloatingInput";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "@/services/locationService";
import { createAddress, getUserProfile } from "@/services/userService";
import toast from "react-hot-toast";
import { UserAddress } from "@/types/userAddress";
import { District, Province, Ward } from "@/types/location";

type Props = {
  onCancel: () => void;
  onSave: (data: any) => void;
  existingCount: number;
};

export default function AddAddressForm({ onCancel, onSave, existingCount }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("VN");
  const [isDefaultDelivery, setIsDefaultDelivery] = useState(existingCount === 0);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const phoneRegex = /^(0|\+84)(\d{9})$/;

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const user = await getUserProfile();
        if (user.email) {
          setEmail(user.email);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserEmail();
  }, []);

  useEffect(() => {
    if (country === "VN") {
      getProvinces().then(setProvinces).catch(console.error);
    }
  }, [country]);

  useEffect(() => {
    if (selectedProvince) {
      getDistricts(selectedProvince)
        .then((data) => {
          setDistricts(data);
          setWards([]);
          setSelectedDistrict("");
          setSelectedWard("");
        })
        .catch(console.error);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      getWards(selectedDistrict).then(setWards).catch(console.error);
    }
  }, [selectedDistrict]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const newErrors: { [key: string]: string } = {};

    if (!phoneRegex.test(phone)) newErrors.phone = "Số điện thoại không hợp lệ";

    if (
      country === "VN" &&
      (!selectedProvince || !selectedDistrict || !selectedWard)
    ) {
      newErrors.location = "Vui lòng chọn Tỉnh, Huyện và Xã";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const province = provinces.find(
        (p) => String(p.id) === selectedProvince
      );
      const district = districts.find(
        (d) => String(d.id) === selectedDistrict
      );
      const ward = wards.find((w) => String(w.id) === selectedWard);

      const payload: UserAddress = {
        recipientName: name,
        recipientEmail: email,
        recipientPhone: phone,
        addressLine: address,
        provinceId: province ? String(province.id) : "",
        districtId: district ? String(district.id) : "",
        wardId: ward ? String(ward.id) : "",
        isDefault: isDefaultDelivery,
      };

      await createAddress(payload);
      toast.success("Đã lưu thay đổi!", {
        duration: 2000,
        position: "top-center",
      });
      onSave(payload);
    } catch (error: any) {
      console.error("Failed to save address:", error);
      
      // Hiển thị detail từ response
      const detail = error?.response?.data?.detail;
      if (detail) {
        toast.error(detail, {
          duration: 3000,
          position: "top-center",
        });
      } else {
        toast.error("Lỗi lưu địa chỉ", {
          duration: 3000,
          position: "top-center",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-6 shadow-lg w-full max-w-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Thêm địa chỉ mới</h3>
        <Button
          type="button"
          onClick={onCancel}
          className="w-9 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full drop-shadow-none"
        >
          ✕
        </Button>
      </div>
      <hr className="my-4 border-t-2" />

      {/* First/Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
        <FloatingInput
          id="name"
          label="Tên"
          value={name}
          onChange={setName}
          required
        />
        <FloatingInput
          id="email"
          label="Địa chỉ Email"
          type="email"
          value={email}
          onChange={setEmail}
          disabled
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 pt-3">
        <FloatingInput
          id="phone"
          label="Số điện thoại"
          value={phone}
          onChange={setPhone}
          required
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      {/* Country + Province */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <FloatingInput
          id="country"
          label="Quốc gia"
          as="select"
          value={country}
          onChange={setCountry}
          options={[{ value: "VN", label: "Việt Nam" }]}
          required
        />

        <FloatingInput
          id="province"
          label="Tỉnh/Thành phố"
          as="select"
          value={selectedProvince}
          onChange={setSelectedProvince}
          options={provinces.map((p) => ({
            value: p.id,
            label: p.name,
          }))}
          required
        />
      </div>

      {/* District + Ward */}
      {country === "VN" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <FloatingInput
            id="district"
            label="Huyện"
            as="select"
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={
              !selectedProvince
                ? [{ value: "", label: "Không có dữ liệu" }]
                : districts.length > 0
                ? districts.map((d) => ({
                    value: String(d.id),
                    label: d.name,
                  }))
                : [{ value: "", label: "Không có dữ liệu" }]
            }
            required
          />
          <FloatingInput
            id="ward"
            label="Xã/Phường"
            as="select"
            value={selectedWard}
            onChange={setSelectedWard}
            options={
              !selectedDistrict
                ? [{ value: "", label: "Không có dữ liệu" }]
                : wards.length > 0
                ? wards.map((w) => ({
                    value: String(w.id),
                    label: w.name,
                  }))
                : [{ value: "", label: "Không có dữ liệu" }]
            }
            required
          />
        </div>
      )}
      {errors.location && (
        <p className="text-sm text-red-500">{errors.location}</p>
      )}

      {/* Address */}
      <div className="mt-4">
        <FloatingInput
          id="address"
          label="Tòa nhà, Số nhà, Tên đường"
          value={address}
          onChange={setAddress}
          required
        />
      </div>

      <label className="flex items-center gap-2 pt-5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isDefaultDelivery}
          disabled={existingCount === 0}
          onChange={(e) => setIsDefaultDelivery(e.target.checked)}
          className="w-4 h-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
        />
        <span className="cursor-pointer">Mặc định</span>
      </label>

      <div className="flex items-center justify-end gap-4 mt-8">
        <Button
          type="button"
          onClick={onCancel}
          className="h-12 w-25 bg-white border border-2 border-gray-400 hover:border-gray-800 text-lg font-bold text-gray-400 hover:text-gray-800 rounded-full"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="h-12 w-25 bg-blue-600 text-white text-lg font-bold hover:bg-blue-800 rounded-full"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Lưu"}
        </Button>
      </div>
    </form>
  );
}
