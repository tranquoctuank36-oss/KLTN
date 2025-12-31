"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/FloatingInput";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "@/services/locationService";
import { UserAddress } from "@/types/userAddress";
import { updateAddress, getAddressById } from "@/services/userService";
import toast from "react-hot-toast";
import DeleteConfirmDialog from "../dialog/DeleteConfirmDialog";
import { District, Province, Ward } from "@/types/location";

type Props = {
  initialData: any;
  onCancel: () => void;
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
};

export default function EditAddressForm({
  initialData,
  onCancel,
  onSave,
  onDelete,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [addressData, setAddressData] = useState<UserAddress | null>(null);
  const [forceValidate, setForceValidate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("VN");
  const [isDefaultDelivery, setIsDefaultDelivery] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const initialLoadComplete = useRef(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const phoneRegex = /^(0|\+84)(\d{9})$/;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch address data by ID
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        setLoading(true);
        const data = await getAddressById(initialData.id);
        setAddressData(data);
        setName(data.recipientName || "");
        setEmail(data.recipientEmail || "");
        setPhone(data.recipientPhone || "");
        setAddress(data.addressLine || "");
        setCountry("VN");
        setIsDefaultDelivery(data.isDefault || false);
        // Only set province first, let cascade loading handle district and ward
        setSelectedProvince(data.provinceId || "");
      } catch (error) {
        console.error("Failed to fetch address:", error);
        toast.error("Failed to load address");
      } finally {
        setLoading(false);
      }
    };

    if (initialData?.id) {
      fetchAddress();
    }
  }, [initialData?.id]);

  useEffect(() => {
    if (country === "VN") {
      getProvinces()
        .then((data) => {
          setProvinces(data);
        })
        .catch(console.error);
    }
  }, [country]);

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      if (initialLoadComplete.current) {
        setSelectedDistrict("");
        setSelectedWard("");
      }
      return;
    }

    getDistricts(selectedProvince)
      .then((data) => {
        setDistricts(data);

        // After districts loaded, set district from addressData if initial load
        if (!initialLoadComplete.current && addressData?.districtId) {
          setSelectedDistrict(addressData.districtId);
        } else if (initialLoadComplete.current) {
          setSelectedDistrict("");
          setSelectedWard("");
          setWards([]);
        }
      })
      .catch(console.error);
  }, [selectedProvince, addressData]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      if (initialLoadComplete.current) {
        setSelectedWard("");
      }
      return;
    }

    getWards(selectedDistrict)
      .then((data) => {
        setWards(data);

        // After wards loaded, set ward from addressData if initial load
        if (!initialLoadComplete.current && addressData?.wardId) {
          setSelectedWard(addressData.wardId);
          // Mark initial load as complete after setting ward
          initialLoadComplete.current = true;
        } else if (initialLoadComplete.current) {
          setSelectedWard("");
        }
      })
      .catch(console.error);
  }, [selectedDistrict, addressData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const newErrors: { [key: string]: string } = {};

    if (!name) newErrors.name = "Name is required";
    if (!phoneRegex.test(phone)) newErrors.phone = "Invalid phone number";
    if (!address) newErrors.address = "Address is required";
    if (
      country === "VN" &&
      (!selectedProvince || !selectedDistrict || !selectedWard)
    ) {
      newErrors.location = "Please select Province, District and Ward";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setForceValidate(true);
      setSaving(false);
      return;
    }

    try {
      const province = provinces.find((p) => String(p.id) === selectedProvince);
      const district = districts.find((d) => String(d.id) === selectedDistrict);
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

      try {
        await updateAddress(initialData.id, payload);

        toast.success("Changes Saved!", {
          duration: 2000,
          position: "top-center",
        });
        onSave(payload);
      } catch (error: any) {
        console.error("Failed to update address:", error);

        // Hiển thị detail từ response
        const detail = error?.response?.data?.detail;
        if (detail) {
          toast.error(detail, {
            duration: 3000,
            position: "top-center",
          });
        } else {
          toast.error("Failed to update address", {
            duration: 3000,
            position: "top-center",
          });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-auto">
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-500">Loading address...</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-6 shadow-lg w-full max-w-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Edit address</h3>
        <Button
          type="button"
          onClick={onCancel}
          className="w-9 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full drop-shadow-none"
        >
          ✕
        </Button>
      </div>
      <hr className="my-4 border-t-2" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
        <FloatingInput
          id="name"
          label="Name"
          value={name}
          onChange={setName}
          required
        />
        <FloatingInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          disabled
        />
      </div>
      <div className="grid grid-cols-1 gap-4 pt-3">
        <FloatingInput
          id="phone"
          label="Phone Number"
          value={phone}
          onChange={setPhone}
          required
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <FloatingInput
          id="country"
          label="Country"
          as="select"
          value={country}
          onChange={setCountry}
          options={[{ value: "VN", label: "Vietnam" }]}
          required
          forceValidate={forceValidate}
        />

        <FloatingInput
          id="province"
          label="Province"
          as="select"
          value={selectedProvince}
          onChange={setSelectedProvince}
          options={provinces.map((p) => ({
            value: String(p.id),
            label: p.name,
          }))}
          required
          forceValidate={forceValidate}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <FloatingInput
          id="district"
          label="District"
          as="select"
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          options={
            districts.length > 0
              ? districts.map((d) => ({
                  value: String(d.id),
                  label: d.name,
                }))
              : [{ value: "", label: "No data" }]
          }
          required
          forceValidate={forceValidate}
        />

        <FloatingInput
          id="ward"
          label="Ward"
          as="select"
          value={selectedWard}
          onChange={setSelectedWard}
          options={
            wards.length > 0
              ? wards.map((w) => ({
                  value: String(w.id),
                  label: w.name,
                }))
              : [{ value: "", label: "No data" }]
          }
          required
          forceValidate={forceValidate}
        />
      </div>

      <div className="mt-4">
        <FloatingInput
          id="address"
          label="Building, House Number, Street Name"
          value={address}
          onChange={setAddress}
          required
        />
      </div>

      {initialData.isDefault ? (
        <div className="flex items-center gap-2 pt-5">
          <span className="bg-gray-400 text-white text-sm font-semibold px-2 py-1 rounded">
            Default
          </span>
        </div>
      ) : (
        <label className="flex items-center gap-2 pt-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDefaultDelivery}
            onChange={(e) => setIsDefaultDelivery(e.target.checked)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          <span className="cursor-pointer">Set as default</span>
        </label>
      )}

      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          className="h-12 w-25 bg-white border border-2 border-gray-400 hover:border-gray-800 text-lg font-bold text-gray-400 hover:text-gray-800 rounded-full"
        >
          Delete
        </Button>

        <Button
          type="submit"
          disabled={saving}
          className="h-12 w-25 bg-blue-600 text-white text-lg font-bold hover:bg-blue-800 rounded-full"
        >
          {saving ? "Saving..." : "Save"}
        </Button>

        <DeleteConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onDeleted={() => {
            onDelete(initialData.id);
            setShowDeleteDialog(false);
          }}
          address={initialData}
        />
      </div>
    </form>
  );
}
