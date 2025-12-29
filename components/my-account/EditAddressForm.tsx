"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import FloatingInput from "@/components/FloatingInput";
import {
  Province,
  District,
  Ward,
  getProvinces,
  getDistricts,
  getWards,
} from "@/services/shippingService";
import { UserAddress } from "@/types/userAddress";
import { updateAddress } from "@/services/userService";
import toast from "react-hot-toast";
import DeleteConfirmDialog from "../dialog/DeleteConfirmDialog";

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
  const [name, setName] = useState(initialData.recipientName || "");
  const [phone, setPhone] = useState(initialData.recipientPhone || "");
  const [address, setAddress] = useState(initialData.addressLine || "");
  const [country, setCountry] = useState(initialData.country || "VN");
  const [isDefaultDelivery, setIsDefaultDelivery] = useState(
    initialData.isDefault || false
  );

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState(
    initialData.provinceId || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialData.ghnDistrictId ? String(initialData.ghnDistrictId) : ""
  );
  const [selectedWard, setSelectedWard] = useState(
    initialData.ghnWardCode || ""
  );

  const [isInitialLoad, setIsInitialLoad] = useState(true);
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

  useEffect(() => {
    if (country === "VN") {
      getProvinces()
        .then((data) => {
          setProvinces(data);
          if (initialData.provinceName) {
            const found = data.find(
              (p) => p.ProvinceName === initialData.provinceName
            );
            if (found) setSelectedProvince(String(found.ProvinceID));
          }
        })
        .catch(console.error);
    }
  }, [country, initialData.provinceName]);

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict("");
      setSelectedWard("");
      return;
    }

    getDistricts(selectedProvince)
      .then((data) => {
        setDistricts(data);

        if (isInitialLoad && initialData.districtName) {
          const foundDistrict = data.find(
            (d) => d.DistrictName === initialData.districtName
          );
          if (foundDistrict) {
            setSelectedDistrict(String(foundDistrict.DistrictID));
          }
        } else {
          setSelectedDistrict("");
          setSelectedWard("");
          setWards([]);
        }
      })
      .catch(console.error);
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }

    getWards(selectedDistrict)
      .then((data) => {
        setWards(data);

        if (isInitialLoad && initialData.wardName) {
          const foundWard = data.find(
            (w) => w.WardName === initialData.wardName
          );
          if (foundWard) setSelectedWard(foundWard.WardCode);
        } else {
          setSelectedWard("");
        }
      })
      .catch(console.error);
  }, [selectedDistrict]);

  useEffect(() => {
    if (
      provinces.length > 0 &&
      districts.length > 0 &&
      wards.length > 0 &&
      selectedProvince &&
      selectedDistrict &&
      selectedWard
    ) {
      setIsInitialLoad(false);
    }
  }, [
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
  ]);

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
    if (Object.keys(newErrors).length > 0) return;

    try {
      const province = provinces.find(
        (p) => String(p.ProvinceID) === selectedProvince
      );
      const district = districts.find(
        (d) => String(d.DistrictID) === selectedDistrict
      );
      const ward = wards.find((w) => String(w.WardCode) === selectedWard);

      const payload: UserAddress = {
        recipientName: name,
        recipientPhone: phone,
        provinceName: province?.ProvinceName || "",
        districtName: district?.DistrictName || "",
        wardName: ward?.WardName || "",
        addressLine: address,
        ghnDistrictId: district ? Number(district.DistrictID) : 0,
        ghnWardCode: ward ? String(ward.WardCode) : "",
        isDefault: isDefaultDelivery,
      };

      console.log("Update with id:", initialData.id);
      console.log("Payload:", payload);
      await updateAddress(initialData.id, payload);
      toast.success("Changes Saved!", {
        duration: 2000,
        position: "top-center",
      });
      onSave(payload);
    } catch (error) {
      console.error("Failed to update address:", error);
      throw error;
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
        />

        <FloatingInput
          id="province"
          label="Province"
          as="select"
          value={selectedProvince}
          onChange={setSelectedProvince}
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
          onChange={setSelectedDistrict}
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
          onChange={setSelectedWard}
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
        {initialData.isDefault ? (
          <Button
            type="button"
            onClick={onCancel}
            className="h-12 w-25 bg-white border border-2 border-gray-400 hover:border-gray-800 text-lg font-bold text-gray-400 hover:text-gray-800 rounded-full"
          >
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="h-12 w-25 bg-white border border-2 border-gray-400 hover:border-gray-800 text-lg font-bold text-gray-400 hover:text-gray-800 rounded-full"
          >
            Delete
          </Button>
        )}

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
