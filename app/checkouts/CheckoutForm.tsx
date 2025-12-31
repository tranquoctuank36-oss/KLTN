"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ShippingMethods from "@/components/ShippingMethods";
import PaymentMethods from "@/components/PaymentMethod";
import InputForm from "./InputForm";
import DisplayForm from "./DisplayForm";
import type { PaymentMethodType } from "@/types/payment";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "@/services/locationService";
import { useAuth } from "@/context/AuthContext";
import {
  getUserProfile,
  createAddress,
  getAddresses,
  updateAddress,
} from "@/services/userService";
import { useCart } from "@/context/CartContext";
import { District, Province, Ward } from "@/types/location";
import { CartItem } from "@/types/cart";
import toast from "react-hot-toast";

type Props = {
  paymentMethod: PaymentMethodType;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethodType>>;
  setShippingFee: (fee: number) => void;
  onOrderDataChange: (data: any) => void;
  onFormValidChange?: (isValid: boolean) => void;
  onShippingErrorChange?: (hasError: boolean) => void;
  note: string;
  onNoteChange: (value: string) => void;
  checkoutCart: CartItem[];
  voucherCode?: string | null;
  onLocationChange?: (districtId: string, wardId: string) => void;
};

export default function CheckoutForm({
  paymentMethod,
  setPaymentMethod,
  setShippingFee,
  onOrderDataChange,
  onFormValidChange,
  onShippingErrorChange,
  note,
  onNoteChange,
  checkoutCart,
  voucherCode,
  onLocationChange,
}: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { cart, subtotal, discountAmount } = useCart();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/carts");
    }
  }, [isLoggedIn, router]);

  // UI States
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Form Data States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");

  // Location States
  const [country, setCountry] = useState("VN");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Notify parent when location changes
  useEffect(() => {
    onLocationChange?.(selectedDistrict, selectedWard);
  }, [selectedDistrict, selectedWard, onLocationChange]);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [provinceDisplayName, setProvinceDisplayName] = useState("");
  const [districtDisplayName, setDistrictDisplayName] = useState("");
  const [wardDisplayName, setWardDisplayName] = useState("");

  // Address States
  const [hasAddress, setHasAddress] = useState<boolean | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState<string>("");
  const [readyToFetchShipping, setReadyToFetchShipping] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(0|\+84)(\d{9})$/;
  const storageKey = "checkoutForm_user";
  const grandTotal = subtotal - discountAmount;

  const canShowNext =
    (showNextStep || (hasAddress && !isEditing)) &&
    cart.length > 0;

  const shouldShowDisplayForm =
    (hasAddress && !isEditing);

  const shouldShowShippingAndPayment =
    isLoggedIn && !isEditing;

  const [savedFormData, setSavedFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    note: "",
  });

  const [prevProvince, setPrevProvince] = useState("");
  const [prevDistrict, setPrevDistrict] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "checkoutForm_editing",
      JSON.stringify({ isEditing })
    );
  }, [isEditing]);

  useEffect(() => {
    const loadData = async () => {
      if (!isLoggedIn) {
        setIsInitializing(false);
        return;
      }

      localStorage.removeItem(storageKey);

      const storedEditing = localStorage.getItem("checkoutForm_editing");
      let isEditingFromStorage = false;
      if (storedEditing) {
        const parsed = JSON.parse(storedEditing);
        isEditingFromStorage = parsed.isEditing || false;
      }

      const storedReady = localStorage.getItem("checkoutForm_readyToFetch");
      const readyToFetch = storedReady ? JSON.parse(storedReady) : false;

      // Set editing state NGAY LẬP TỨC
      if (isEditingFromStorage) {
        setIsEditing(true);
        setShowNextStep(false);
        setReadyToFetchShipping(false);
        setIsInitialLoad(false);
      }

      try {
        const [user, addresses] = await Promise.all([
          getUserProfile(),
          getAddresses(),
        ]);

        setEmail(user.email || "");

        if (!addresses || addresses.length === 0) {
          setHasAddress(false);
          setIsInitializing(false);
          return;
        }

        setHasAddress(true);

        const cleanList = addresses.map((a: any) => ({
          ...a,
          isDefault: a.isDefault === true || a.isDefault === "true",
        }));

        const defaultAddr = cleanList.find((a) => a.isDefault) || cleanList[0];

        if (!defaultAddr) return;

        setCurrentAddressId(defaultAddr.id);
        setIsDefault(defaultAddr.isDefault || false);
        setProvinceDisplayName(defaultAddr.provinceName || "");
        setDistrictDisplayName(defaultAddr.districtName || "");
        setWardDisplayName(defaultAddr.wardName || "");

        const provs = await getProvinces();
        setProvinces(provs);

        if (isEditingFromStorage) {
          // Đang editing - load saved form data
          const savedData = localStorage.getItem("checkoutForm_savedData");
          if (savedData) {
            const parsed = JSON.parse(savedData);
            setFirstName(parsed.firstName || "");
            setLastName(parsed.lastName || "");
            setPhone(parsed.phone || "");
            setAddress(parsed.address || "");

            // Load location data cho editing form
            if (parsed.selectedProvince) {
              setSelectedProvince(parsed.selectedProvince);

              if (parsed.selectedDistrict) {
                const dists = await getDistricts(parsed.selectedProvince);
                setDistricts(dists);
                setSelectedDistrict(parsed.selectedDistrict);

                if (parsed.selectedWard) {
                  const wds = await getWards(parsed.selectedDistrict);
                  setWards(wds);
                  setSelectedWard(parsed.selectedWard);
                }
              }
            }
          }
        } else {
          setRecipientName(defaultAddr.recipientName || "");
          setAddress(defaultAddr.addressLine || "");
          setPhone(defaultAddr.recipientPhone || "");

          const foundProvince = provs.find(
            (p) => p.name === defaultAddr.provinceName
          );
          if (foundProvince) {
            setSelectedProvince(String(foundProvince.id));
            const dists = await getDistricts(foundProvince.id);
            setDistricts(dists);
            const foundDistrict = dists.find(
              (d) => d.name === defaultAddr.districtName
            );
            if (foundDistrict) {
              setSelectedDistrict(String(foundDistrict.id));
              const wds = await getWards(foundDistrict.id);
              setWards(wds);
              const foundWard = wds.find(
                (w) => w.name === defaultAddr.wardName
              );
              if (foundWard) {
                setSelectedWard(String(foundWard.id));

                // Auto-enable shipping fetch when default address is loaded
                // (not just when readyToFetch from localStorage)
                setReadyToFetchShipping(true);
              }
            }
          }
        }
        setIsInitializing(false);
      } catch (err) {
        setIsInitializing(false);
      }
    };

    loadData();
  }, [isLoggedIn, storageKey]);

  // Save to localStorage
  useEffect(() => {
    const data = {
      country,
      selectedProvince,
      selectedDistrict,
      selectedWard,
      firstName,
      lastName,
      email,
      phone,
      address,
      note,
      provinceDisplayName,
      districtDisplayName,
      wardDisplayName,
      recipientName,
      showNextStep,
      hasAddress,
      isEditing,
      readyToFetchShipping,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));

    if (readyToFetchShipping) {
      localStorage.setItem(
        "checkoutForm_readyToFetch",
        JSON.stringify(readyToFetchShipping)
      );
    }
  }, [
    country,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    firstName,
    lastName,
    email,
    phone,
    address,
    note,
    provinceDisplayName,
    districtDisplayName,
    wardDisplayName,
    recipientName,
    showNextStep,
    hasAddress,
    storageKey,
    isEditing,
    readyToFetchShipping,
  ]);

  // Cleanup localStorage
  useEffect(() => {
    return () => {
      localStorage.removeItem(storageKey);
    };
  }, [storageKey]);

  // Fetch provinces
  useEffect(() => {
    if (isInitializing) return;
    if (hasAddress && provinces.length > 0) {
      return;
    }
    if (country === "VN") {
      getProvinces()
        .then((data) => {
          setProvinces(data);
          if (provinceDisplayName) {
            const found = data.find(
              (p) => p.name === provinceDisplayName
            );
            if (found) setSelectedProvince(String(found.id));
          }
        })
        .catch(console.error);
    }
  }, [
    country,
    provinceDisplayName,
    hasAddress,
    isInitializing,
    provinces.length,
  ]);

  // Fetch districts
  useEffect(() => {
    if (isInitializing || isSubmitting) return;
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict("");
      setSelectedWard("");
      return;
    }

    if (prevProvince && prevProvince !== selectedProvince) {
      setSelectedDistrict("");
      setSelectedWard("");
      setWards([]);
    }
    setPrevProvince(selectedProvince);

    if (
      hasAddress &&
      districts.length > 0 &&
      !readyToFetchShipping &&
      !isEditing
    ) {
      return;
    }

    if (!readyToFetchShipping || !hasAddress || isEditing) {
      console.log("🔄 Fetching districts for province:", selectedProvince);

      getDistricts(selectedProvince)
        .then((data) => {
          setDistricts(data);

          if (isInitialLoad && districtDisplayName) {
            const foundDistrict = data.find(
              (d) => d.name === districtDisplayName
            );
            if (foundDistrict) {
              setSelectedDistrict(String(foundDistrict.id));
            }
          }
        })
        .catch(console.error);
    }
  }, [
    selectedProvince,
    hasAddress,
    isInitializing,
    districts.length,
    isSubmitting,
    isEditing,
    isInitialLoad,
    districtDisplayName,
  ]);

  // Fetch wards
  useEffect(() => {
    if (isInitializing || isSubmitting) return;
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }

    if (prevDistrict && prevDistrict !== selectedDistrict) {
      setSelectedWard("");
    }
    setPrevDistrict(selectedDistrict);

    if (
      hasAddress &&
      wards.length > 0 &&
      !readyToFetchShipping &&
      !isEditing
    ) {
      return;
    }

    if (!readyToFetchShipping || !hasAddress || isEditing) {
      console.log("🔄 Fetching wards for district:", selectedDistrict);

      getWards(selectedDistrict)
        .then((data) => {
          console.log("getWards response:", data);
          setWards(data);

          if (isInitialLoad && wardDisplayName) {
            const foundWard = data.find((w) => w.name === wardDisplayName);
            if (foundWard) setSelectedWard(String(foundWard.id));
          }
          // else if (!isInitialLoad) {
          //   setSelectedWard("");
          // }
        })
        .catch(console.error);
    }
  }, [
    selectedDistrict,
    isLoggedIn,
    hasAddress,
    isInitializing,
    wards.length,
    isSubmitting,
    isEditing,
    isInitialLoad,
    wardDisplayName,
  ]);

  // Check initial load complete
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

  // Form validation
  useEffect(() => {
    // Nếu chưa có địa chỉ (null hoặc false), luôn disable
    if (hasAddress !== true) {
      onFormValidChange?.(false);
      onShippingErrorChange?.(false);
      return;
    }

    // Đã có địa chỉ nhưng chưa Continue, vẫn disable
    if (!readyToFetchShipping) {
      onFormValidChange?.(false);
      onShippingErrorChange?.(false);
      return;
    }

    // Kiểm tra location hợp lệ và shipping status
    const hasValidLocation = selectedDistrict && selectedWard && 
                            selectedDistrict !== "" && selectedWard !== "";
    const isShippingValid = !shippingLoading && !shippingError;
    
    if (hasValidLocation && !shippingLoading) {
      onFormValidChange?.(isShippingValid);
      onShippingErrorChange?.(!isShippingValid);
    } else {
      onFormValidChange?.(false);
      onShippingErrorChange?.(false);
    }
  }, [
    hasAddress,
    readyToFetchShipping,
    selectedDistrict,
    selectedWard,
    shippingLoading,
    shippingError,
    onFormValidChange,
    onShippingErrorChange,
  ]);

  // Update order data
  useEffect(() => {
    onOrderDataChange({
      recipientName: recipientName,
      recipientEmail: email,
      recipientPhone: phone,
      addressLine: address,
      provinceName: provinceDisplayName,
      districtName: districtDisplayName,
      wardName: wardDisplayName,
      provinceId: selectedProvince,
      districtId: selectedDistrict,
      wardId: selectedWard,
      note,
    });
  }, [
    recipientName,
    email,
    phone,
    address,
    provinceDisplayName,
    districtDisplayName,
    wardDisplayName,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    note,
    onOrderDataChange,
  ]);

  useEffect(() => {
    if (!showNextStep && !readyToFetchShipping) {
      // Đang ở form nhập liệu và chưa ready để fetch shipping
      setShippingFee(0);
    }
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    showNextStep,
    readyToFetchShipping,
    setShippingFee,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);
    setIsSubmitting(true);

    const newErrors: { [key: string]: string } = {};
    if (!emailRegex.test(email)) newErrors.email = "Invalid email format";
    if (!phoneRegex.test(phone))
      newErrors.phone = "Invalid phone number format";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setIsLoading(false);
      setIsSubmitting(false);
      onFormValidChange?.(false);
      return;
    }

    const startTime = Date.now();
    const MIN_LOADING_TIME = 1000;

    const provinceId = selectedProvince;
    const districtId = selectedDistrict;
    const wardId = selectedWard;

    try {
      // Tìm display names TRƯỚC (từ arrays hiện tại)
      const foundProvince = provinces.find(
        (p) => String(p.id) === provinceId
      );
      const foundDistrict = districts.find(
        (d) => String(d.id) === districtId
      );
      const foundWard = wards.find((w) => String(w.id) === wardId);

      const provinceDisplayName = foundProvince?.name || "";
      const districtDisplayName = foundDistrict?.name || "";
      const wardDisplayName = foundWard?.name || "";

      if (isAddingNewAddress) {
        const newAddr = {
          recipientName: `${firstName} ${lastName}`,
          recipientEmail: email,
          recipientPhone: phone,
          addressLine: address,
          provinceId: String(provinceId),
          districtId: String(districtId),
          wardId: String(wardId),
          isDefault: false, // New address không set default
        };
        try {
          await createAddress(newAddr);
        } catch (apiErr: any) {
          // Kiểm tra detail từ response
          const detail = apiErr?.response?.data?.detail;
          if (detail) {
            toast.error(detail, {
              duration: 3000,
              position: "top-center",
            });
            setIsLoading(false);
            setIsSubmitting(false);
            return;
          }
          
          // Kiểm tra errors array
          const apiErrors = apiErr?.response?.data?.errors;
          if (Array.isArray(apiErrors)) {
            const phoneErr = apiErrors.find((e: any) => e.message && e.message.toLowerCase().includes("phone"));
            if (phoneErr) {
              setErrors((prev) => ({ ...prev, phone: "Phải là 1 số điện thoại hợp lệ" }));
              setIsLoading(false);
              setIsSubmitting(false);
              return;
            }
          }
          setIsLoading(false);
          setIsSubmitting(false);
          return;
        }
        setRecipientName(newAddr.recipientName);
        setAddress(newAddr.addressLine);
        setPhone(newAddr.recipientPhone);
        setProvinceDisplayName(provinceDisplayName);
        setDistrictDisplayName(districtDisplayName);
        setWardDisplayName(wardDisplayName);
        setIsDefault(false);
        setSelectedProvince(provinceId);
        setSelectedDistrict(districtId);
        setSelectedWard(wardId);
        setSavedFormData({
          firstName,
          lastName,
          phone,
          address,
          note,
        });
        setIsAddingNewAddress(false);
      } else if (isLoggedIn && !hasAddress) {
        const newAddr = {
          recipientName: `${firstName} ${lastName}`,
          recipientEmail: email,
          recipientPhone: phone,
          addressLine: address,
          provinceId: String(provinceId),
          districtId: String(districtId),
          wardId: String(wardId),
          isDefault: true,
        };
        try {
          await createAddress(newAddr);
        } catch (apiErr: any) {
          // Kiểm tra detail từ response
          const detail = apiErr?.response?.data?.detail;
          if (detail) {
            toast.error(detail, {
              duration: 3000,
              position: "top-center",
            });
            setIsLoading(false);
            setIsSubmitting(false);
            return;
          }
          
          // Kiểm tra errors array
          const apiErrors = apiErr?.response?.data?.errors;
          if (Array.isArray(apiErrors)) {
            const phoneErr = apiErrors.find((e: any) => e.message && e.message.toLowerCase().includes("phone"));
            if (phoneErr) {
              setErrors((prev) => ({ ...prev, phone: "Phải là 1 số điện thoại hợp lệ" }));
              setIsLoading(false);
              setIsSubmitting(false);
              return;
            }
          }
          setIsLoading(false);
          setIsSubmitting(false);
          return;
        }
        setHasAddress(true);
        setIsDefault(true);
        setRecipientName(newAddr.recipientName);
        setAddress(newAddr.addressLine);
        setPhone(newAddr.recipientPhone);
        setProvinceDisplayName(provinceDisplayName);
        setDistrictDisplayName(districtDisplayName);
        setWardDisplayName(wardDisplayName);
        setSelectedProvince(provinceId);
        setSelectedDistrict(districtId);
        setSelectedWard(wardId);
        // Cập nhật savedFormData
        setSavedFormData({
          firstName,
          lastName,
          phone,
          address,
          note,
        });
      } else if (isLoggedIn && hasAddress && isEditing) {
        if (currentAddressId) {
          const updatedAddr = {
            recipientName: `${firstName} ${lastName}`,
            recipientEmail: email,
            recipientPhone: phone,
            addressLine: address,
            provinceId: String(provinceId),
            districtId: String(districtId),
            wardId: String(wardId),
            isDefault: isDefault,
          };

          try {
            await updateAddress(currentAddressId, updatedAddr);
          } catch (apiErr: any) {
            // Kiểm tra detail từ response
            const detail = apiErr?.response?.data?.detail;
            if (detail) {
              toast.error(detail, {
                duration: 3000,
                position: "top-center",
              });
              setIsLoading(false);
              setIsSubmitting(false);
              return;
            }
            
            toast.error("Failed to update address");
            setIsLoading(false);
            setIsSubmitting(false);
            return;
          }

          // Cập nhật display states
          setRecipientName(updatedAddr.recipientName);
          setAddress(updatedAddr.addressLine);
          setPhone(updatedAddr.recipientPhone);
          setProvinceDisplayName(provinceDisplayName);
          setDistrictDisplayName(districtDisplayName);
          setWardDisplayName(wardDisplayName);

          setSelectedProvince(provinceId);
          setSelectedDistrict(districtId);
          setSelectedWard(wardId);

          // Cập nhật savedFormData với data MỚI
          setSavedFormData({
            firstName,
            lastName,
            phone,
            address,
            note,
          });
        }
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      setShowNextStep(true);
      setIsEditing(false);

      localStorage.removeItem("checkoutForm_editing");
      localStorage.removeItem("checkoutForm_savedData");

      setReadyToFetchShipping(true);
      // Let useEffect handle validation
    } catch (err) {
      console.error("Failed to submit shipping:", err);
      onFormValidChange?.(false);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  // ...existing code...

  const handleEdit = async () => {
    setShowNextStep(false);
    setReadyToFetchShipping(false);
    setIsEditing(true);
    onFormValidChange?.(false);
    setIsInitialLoad(true);

    setShippingFee(0);

    localStorage.setItem(
      "checkoutForm_editing",
      JSON.stringify({ isEditing: true })
    );

    const dataToSave = {
      firstName,
      lastName,
      phone,
      address,
      recipientName,
      note,
      selectedProvince,
      selectedDistrict,
      selectedWard,
    };
    
    console.log('🔵 handleEdit - Saving to localStorage:', dataToSave);
    
    // Save to both localStorage AND React state
    setSavedFormData(dataToSave as any);
    
    localStorage.setItem(
      "checkoutForm_savedData",
      JSON.stringify(dataToSave)
    );

    const nameParts = recipientName.split(" ");
    const restoredFirstName = nameParts[0] || savedFormData.firstName;
    const restoredLastName =
      nameParts.slice(1).join(" ") || savedFormData.lastName;

    setFirstName(restoredFirstName);
    setLastName(restoredLastName);
    setPhone(savedFormData.phone || phone);
    setAddress(savedFormData.address || address);

    try {
        const provs = await getProvinces();
        setProvinces(provs);

        const foundProvince = provs.find(
          (p) => p.name === provinceDisplayName
        );
        if (foundProvince) {
          setSelectedProvince(String(foundProvince.id));

          const dists = await getDistricts(foundProvince.id);
          setDistricts(dists);

          const foundDistrict = dists.find(
            (d) => d.name === districtDisplayName
          );
          if (foundDistrict) {
            setSelectedDistrict(String(foundDistrict.id));

            const wds = await getWards(foundDistrict.id);
            setWards(wds);

            const foundWard = wds.find((w) => w.name === wardDisplayName);
            if (foundWard) {
              setSelectedWard(String(foundWard.id));
            }
          }
        }
        setIsInitialLoad(false);
      } catch (err) {
        console.error("Error restoring location data:", err);
        setIsInitialLoad(false);
      }
  };

  // Handler cho New Address button
  const handleNewAddress = () => {
    setShowNextStep(false);
    setReadyToFetchShipping(false);
    setIsEditing(true);
    setIsAddingNewAddress(true);
    onFormValidChange?.(false);
    setIsInitialLoad(true);

    setShippingFee(0);

    setSavedFormData({
      firstName,
      lastName,
      phone,
      address,
      selectedProvince,
      selectedDistrict,
      selectedWard,
    } as any);

    setFirstName("");
    setLastName("");
    setPhone("");
    setAddress("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
  };

  const handleCancel = async () => {
    if (isAddingNewAddress) {
      const savedProvince = (savedFormData as any).selectedProvince;
      const savedDistrict = (savedFormData as any).selectedDistrict;
      const savedWard = (savedFormData as any).selectedWard;

      if (savedProvince && savedDistrict && savedWard) {
        setSelectedProvince(savedProvince);

        const dists = await getDistricts(savedProvince);
        setDistricts(dists);
        setSelectedDistrict(savedDistrict);

        const wds = await getWards(savedDistrict);
        setWards(wds);
        setSelectedWard(savedWard);
      }

      setIsAddingNewAddress(false);
      setIsEditing(false);
      setShowNextStep(true);
      setReadyToFetchShipping(true);
    } else if (isEditing) {
      // Cancel Edit -> Restore data cũ và quay về DisplayForm
      setFirstName(savedFormData.firstName);
      setLastName(savedFormData.lastName);
      setPhone(savedFormData.phone);
      setAddress(savedFormData.address);
      
      const restoredRecipientName = (savedFormData as any).recipientName || `${savedFormData.firstName} ${savedFormData.lastName}`;
      setRecipientName(restoredRecipientName);

      setIsEditing(false);
      setShowNextStep(true);
      setReadyToFetchShipping(true);

      localStorage.removeItem("checkoutForm_editing");
      localStorage.removeItem("checkoutForm_savedData");
    }
  };

  const handleAddressChange = async (addressData: any) => {
    setReadyToFetchShipping(false);
    onFormValidChange?.(false);
    setIsEditing(false);

    setShippingFee(0);
    onNoteChange(addressData.note);

    setRecipientName(addressData.recipientName);
    setPhone(addressData.phone);
    setAddress(addressData.address);
    setIsDefault(addressData.isDefault);

    if (addressData.currentAddressId) {
      setCurrentAddressId(addressData.currentAddressId);
    }

    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);

    try {
      console.log('🔵 Setting province ID in handleAddressChange:', addressData.selectedProvince);
      setSelectedProvince(addressData.selectedProvince);
      await new Promise((resolve) => setTimeout(resolve, 0));

      const newDistricts = await getDistricts(addressData.selectedProvince);
      setDistricts(newDistricts);

      const foundProvince = provinces.find(
        (p) => String(p.id) === addressData.selectedProvince
      );
      if (foundProvince) {
        setProvinceDisplayName(foundProvince.name);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      setSelectedDistrict(addressData.selectedDistrict);

      const newWards = await getWards(addressData.selectedDistrict);
      setWards(newWards);

      const foundDistrict = newDistricts.find(
        (d) => String(d.id) === addressData.selectedDistrict
      );
      if (foundDistrict) {
        setDistrictDisplayName(foundDistrict.name);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      setSelectedWard(addressData.selectedWard);

      const foundWard = newWards.find(
        (w) => String(w.id) === addressData.selectedWard
      );
      if (foundWard) {
        setWardDisplayName(foundWard.name);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      setReadyToFetchShipping(true);
      // Let useEffect handle validation
    } catch (error) {
      console.error("Error loading location data:", error);
      onFormValidChange?.(false);
    }
  };

  const handlePaymentChange = (method: PaymentMethodType) => {
    setPaymentMethod(method);
  };

  if (isInitializing) {
    return (
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow p-6">
        {shouldShowDisplayForm ? (
          <DisplayForm
            recipientName={recipientName}
            phone={phone}
            email={email}
            address={address}
            note={note}
            provinceDisplayName={provinceDisplayName}
            districtDisplayName={districtDisplayName}
            wardDisplayName={wardDisplayName}
            isDefault={isDefault}
            isLoggedIn={isLoggedIn}
            onEdit={handleEdit}
            onNewAddress={handleNewAddress}
            onAddressChange={handleAddressChange}
            onFormValidChange={onFormValidChange}
            onNoteChange={onNoteChange}
          />
        ) : (
          <InputForm
            firstName={firstName}
            lastName={lastName}
            email={email}
            phone={phone}
            address={address}
            country={country}
            selectedProvince={selectedProvince}
            selectedDistrict={selectedDistrict}
            selectedWard={selectedWard}
            provinces={provinces}
            districts={districts}
            wards={wards}
            errors={errors}
            isLoading={isLoading}
            isLoggedIn={isLoggedIn}
            hasAddress={hasAddress}
            isAddingNewAddress={isAddingNewAddress}
            isEditing={isEditing}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onAddressChange={setAddress}
            onCountryChange={setCountry}
            onProvinceChange={setSelectedProvince}
            onDistrictChange={setSelectedDistrict}
            onWardChange={setSelectedWard}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>

      {shouldShowShippingAndPayment ? (
        <ShippingMethods
          items={checkoutCart.map(item => ({
            variantId: item.selectedVariant.id,
            quantity: item.quantity
          }))}
          toDistrictId={String(selectedDistrict)}
          toWardCode={String(selectedWard)}
          voucherCode={voucherCode || undefined}
          paymentMethod={paymentMethod}
          onChange={(method) => {
            setShippingFee(method.fee);
          }}
          onLoadingChange={setShippingLoading}
          onErrorChange={(error) => {
            setShippingError(error);
            onShippingErrorChange?.(!!error);
            // Let useEffect handle validation
          }}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-300">
            2. Shipping Method
          </h2>
        </div>
      )}

      {shouldShowShippingAndPayment ? (
        <PaymentMethods value={paymentMethod} onChange={handlePaymentChange} />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-300">3. Payment</h2>
        </div>
      )}
    </div>
  );
}
