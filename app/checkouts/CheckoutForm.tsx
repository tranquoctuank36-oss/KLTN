"use client";

import { useState, useEffect } from "react";
import ShippingMethods from "@/components/ShippingMethods";
import PaymentMethods from "@/components/PaymentMethod";
import InputForm from "./InputForm";
import DisplayForm from "./DisplayForm";
import type { PaymentMethodType } from "@/types/payment";
import {
  Province,
  District,
  Ward,
  getProvinces,
  getDistricts,
  getWards,
} from "@/services/shippingService";
import { useAuth } from "@/context/AuthContext";
import {
  getUserProfile,
  createAddress,
  getAddresses,
  updateAddress,
} from "@/services/userService";
import { useCart } from "@/context/CartContext";

type Props = {
  paymentMethod: PaymentMethodType;
  setPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethodType>>;
  setShippingFee: (fee: number) => void;
  onOrderDataChange: (data: any) => void;
  onFormValidChange?: (isValid: boolean) => void;
  onShippingErrorChange?: (hasError: boolean) => void;
  note: string;
  onNoteChange: (value: string) => void;
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
}: Props) {
  const { isLoggedIn } = useAuth();
  const { cart, subtotal, discountAmount } = useCart();

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
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [provinceNameDisplay, setProvinceNameDisplay] = useState("");
  const [districtNameDisplay, setDistrictNameDisplay] = useState("");
  const [wardNameDisplay, setWardNameDisplay] = useState("");

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
  const storageKey = isLoggedIn ? "checkoutForm_user" : "checkoutForm_guest";
  const grandTotal = subtotal - discountAmount;

  const canShowNext =
    (showNextStep || (isLoggedIn && hasAddress && !isEditing)) &&
    cart.length > 0;

  const shouldShowDisplayForm =
    ((isLoggedIn && hasAddress) || (!isLoggedIn && showNextStep)) && !isEditing;

  const shouldShowShippingAndPayment =
    canShowNext && !isEditing && readyToFetchShipping;

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
    if (isLoggedIn) {
      localStorage.setItem(
        "checkoutForm_editing",
        JSON.stringify({ isEditing })
      );
    }
  }, [isEditing, isLoggedIn]);

  useEffect(() => {
    const loadData = async () => {
      if (!isLoggedIn) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setCountry(parsed.country || "VN");
          setSelectedProvince(parsed.selectedProvince || "");
          setSelectedDistrict(parsed.selectedDistrict || "");
          setSelectedWard(parsed.selectedWard || "");
          setFirstName(parsed.firstName || "");
          setLastName(parsed.lastName || "");
          setEmail(parsed.email || "");
          setPhone(parsed.phone || "");
          setAddress(parsed.address || "");
          setProvinceNameDisplay(parsed.provinceNameDisplay || "");
          setDistrictNameDisplay(parsed.districtNameDisplay || "");
          setWardNameDisplay(parsed.wardNameDisplay || "");
          setRecipientName(parsed.recipientName || "");
          setHasAddress(parsed.hasAddress || false);

          const savedShowNextStep = parsed.showNextStep || false;
          const savedReadyToFetch = parsed.readyToFetchShipping || false;

          setShowNextStep(savedShowNextStep);

          const isEditingValue = parsed.isEditing || false;
          setIsEditing(isEditingValue);
          setShowNextStep(
            isEditingValue ? false : parsed.showNextStep || false
          );

          if (savedReadyToFetch && !isEditingValue && parsed.selectedProvince) {
            try {
              const provs = await getProvinces();
              setProvinces(provs);

              if (parsed.selectedDistrict) {
                const dists = await getDistricts(parsed.selectedProvince);
                setDistricts(dists);

                if (parsed.selectedWard) {
                  const wds = await getWards(parsed.selectedDistrict);
                  setWards(wds);
                  setReadyToFetchShipping(savedReadyToFetch);
                }
              }
            } catch (err) {
              console.error("Error loading location data:", err);
            }
          }
        }
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
        setProvinceNameDisplay(defaultAddr.provinceName || "");
        setDistrictNameDisplay(defaultAddr.districtName || "");
        setWardNameDisplay(defaultAddr.wardName || "");

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
            (p) => p.ProvinceName === defaultAddr.provinceName
          );
          if (foundProvince) {
            setSelectedProvince(String(foundProvince.ProvinceID));
            const dists = await getDistricts(foundProvince.ProvinceID);
            setDistricts(dists);
            const foundDistrict = dists.find(
              (d) => d.DistrictName === defaultAddr.districtName
            );
            if (foundDistrict) {
              setSelectedDistrict(String(foundDistrict.DistrictID));
              const wds = await getWards(foundDistrict.DistrictID);
              setWards(wds);
              const foundWard = wds.find(
                (w) => w.WardName === defaultAddr.wardName
              );
              if (foundWard) {
                setSelectedWard(String(foundWard.WardCode));

                if (readyToFetch) {
                  setReadyToFetchShipping(true);
                }
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
      provinceNameDisplay,
      districtNameDisplay,
      wardNameDisplay,
      recipientName,
      showNextStep,
      hasAddress,
      isEditing,
      readyToFetchShipping,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));

    if (isLoggedIn && readyToFetchShipping) {
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
    provinceNameDisplay,
    districtNameDisplay,
    wardNameDisplay,
    recipientName,
    showNextStep,
    hasAddress,
    storageKey,
    isEditing,
    readyToFetchShipping,
    isLoggedIn,
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
    if (isLoggedIn && hasAddress && provinces.length > 0) {
      console.log("⏭️ Skipping getProvinces - already loaded");
      return;
    }
    if (country === "VN") {
      getProvinces()
        .then((data) => {
          setProvinces(data);
          if (provinceNameDisplay) {
            const found = data.find(
              (p) => p.ProvinceName === provinceNameDisplay
            );
            if (found) setSelectedProvince(String(found.ProvinceID));
          }
        })
        .catch(console.error);
    }
  }, [
    country,
    provinceNameDisplay,
    isLoggedIn,
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
      isLoggedIn &&
      hasAddress &&
      districts.length > 0 &&
      !readyToFetchShipping &&
      !isEditing
    ) {
      console.log("⏭️ Skipping getDistricts - already loaded");
      return;
    }

    if (!readyToFetchShipping || !isLoggedIn || !hasAddress || isEditing) {
      console.log("🔄 Fetching districts for province:", selectedProvince);

      getDistricts(selectedProvince)
        .then((data) => {
          console.log("getDistricts response:", data);
          setDistricts(data);

          if (isInitialLoad && districtNameDisplay) {
            const foundDistrict = data.find(
              (d) => d.DistrictName === districtNameDisplay
            );
            if (foundDistrict) {
              setSelectedDistrict(String(foundDistrict.DistrictID));
            }
          }
        })
        .catch(console.error);
    }
  }, [
    selectedProvince,
    isLoggedIn,
    hasAddress,
    isInitializing,
    districts.length,
    isSubmitting,
    isEditing,
    isInitialLoad,
    districtNameDisplay,
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
      isLoggedIn &&
      hasAddress &&
      wards.length > 0 &&
      !readyToFetchShipping &&
      !isEditing
    ) {
      console.log("⏭️ Skipping getWards - already loaded");
      return;
    }

    if (!readyToFetchShipping || !isLoggedIn || !hasAddress || isEditing) {
      console.log("🔄 Fetching wards for district:", selectedDistrict);

      getWards(selectedDistrict)
        .then((data) => {
          console.log("getWards response:", data);
          setWards(data);

          if (isInitialLoad && wardNameDisplay) {
            const foundWard = data.find((w) => w.WardName === wardNameDisplay);
            if (foundWard) setSelectedWard(String(foundWard.WardCode));
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
    wardNameDisplay,
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
    const isShippingValid = !shippingLoading && !shippingError;
    if (shouldShowDisplayForm && readyToFetchShipping && !shippingLoading) {
      onFormValidChange?.(isShippingValid);
      onShippingErrorChange?.(!isShippingValid);
    } else {
      onFormValidChange?.(false);
      onShippingErrorChange?.(false);
    }
  }, [
    shouldShowDisplayForm,
    readyToFetchShipping,
    shippingLoading,
    shippingError,
    onFormValidChange,
    onFormValidChange,
    onShippingErrorChange,
  ]);

  // Update order data
  useEffect(() => {
    onOrderDataChange({
      recipientName: recipientName,
      recipientPhone: phone,
      addressLine: address,
      wardName: wardNameDisplay,
      districtName: districtNameDisplay,
      provinceName: provinceNameDisplay,
      toWardCode: String(selectedWard),
      toDistrictId: Number(selectedDistrict),
      note,
    });
  }, [
    recipientName,
    phone,
    address,
    wardNameDisplay,
    districtNameDisplay,
    provinceNameDisplay,
    selectedWard,
    selectedDistrict,
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
    const wardCode = selectedWard;

    try {
      // Tìm display names TRƯỚC (từ arrays hiện tại)
      const foundProvince = provinces.find(
        (p) => String(p.ProvinceID) === provinceId
      );
      const foundDistrict = districts.find(
        (d) => String(d.DistrictID) === districtId
      );
      const foundWard = wards.find((w) => String(w.WardCode) === wardCode);

      const provinceDisplayName = foundProvince?.ProvinceName || "";
      const districtDisplayName = foundDistrict?.DistrictName || "";
      const wardDisplayName = foundWard?.WardName || "";

      if (isAddingNewAddress) {
        const newAddr = {
          recipientName: `${firstName} ${lastName}`,
          recipientPhone: phone,
          addressLine: address,
          provinceName: provinceDisplayName,
          districtName: districtDisplayName,
          wardName: wardDisplayName,
          ghnDistrictId: Number(districtId),
          ghnWardCode: String(wardCode),
          isDefault: false, // New address không set default
        };

        await createAddress(newAddr);

        setRecipientName(newAddr.recipientName);
        setAddress(newAddr.addressLine);
        setPhone(newAddr.recipientPhone);
        setProvinceNameDisplay(newAddr.provinceName);
        setDistrictNameDisplay(newAddr.districtName);
        setWardNameDisplay(newAddr.wardName);
        setIsDefault(false);

        setSelectedProvince(provinceId);
        setSelectedDistrict(districtId);
        setSelectedWard(wardCode);

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
          recipientPhone: phone,
          addressLine: address,
          provinceName: provinceDisplayName,
          districtName: districtDisplayName,
          wardName: wardDisplayName,
          ghnDistrictId: Number(districtId),
          ghnWardCode: String(wardCode),
          isDefault: true,
        };

        await createAddress(newAddr);

        setHasAddress(true);
        setIsDefault(true);
        setRecipientName(newAddr.recipientName);
        setAddress(newAddr.addressLine);
        setPhone(newAddr.recipientPhone);
        setProvinceNameDisplay(newAddr.provinceName);
        setDistrictNameDisplay(newAddr.districtName);
        setWardNameDisplay(newAddr.wardName);

        setSelectedProvince(provinceId);
        setSelectedDistrict(districtId);
        setSelectedWard(wardCode);

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
            recipientPhone: phone,
            addressLine: address,
            provinceName: provinceDisplayName,
            districtName: districtDisplayName,
            wardName: wardDisplayName,
            ghnDistrictId: Number(districtId),
            ghnWardCode: String(wardCode),
            isDefault: isDefault,
          };

          await updateAddress(currentAddressId, updatedAddr);

          // Cập nhật display states
          setRecipientName(updatedAddr.recipientName);
          setAddress(updatedAddr.addressLine);
          setPhone(updatedAddr.recipientPhone);
          setProvinceNameDisplay(updatedAddr.provinceName);
          setDistrictNameDisplay(updatedAddr.districtName);
          setWardNameDisplay(updatedAddr.wardName);

          setSelectedProvince(provinceId);
          setSelectedDistrict(districtId);
          setSelectedWard(wardCode);

          // Cập nhật savedFormData với data MỚI
          setSavedFormData({
            firstName,
            lastName,
            phone,
            address,
            note,
          });
        }
      } else if (!isLoggedIn) {
        let finalDistricts = districts;
        let finalWards = wards;

        if (provinceId !== selectedProvince || districts.length === 0) {
          finalDistricts = await getDistricts(provinceId);
          setDistricts(finalDistricts);
        }

        if (districtId !== selectedDistrict || wards.length === 0) {
          finalWards = await getWards(districtId);
          setWards(finalWards);
        }

        const guestAddr = {
          recipientName: `${firstName} ${lastName}`,
          recipientPhone: phone,
          addressLine: address,
          provinceName: provinceDisplayName,
          districtName: districtDisplayName,
          wardName: wardDisplayName,
        };

        setHasAddress(true);
        setIsDefault(false);
        setRecipientName(guestAddr.recipientName);
        setAddress(guestAddr.addressLine);
        setPhone(guestAddr.recipientPhone);
        setProvinceNameDisplay(guestAddr.provinceName);
        setDistrictNameDisplay(guestAddr.districtName);
        setWardNameDisplay(guestAddr.wardName);

        setSelectedProvince(provinceId);
        setSelectedDistrict(districtId);
        setSelectedWard(wardCode);

        // Cập nhật savedFormData
        setSavedFormData({
          firstName,
          lastName,
          phone,
          address,
          note,
        });
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      setShowNextStep(true);
      setIsEditing(false);

      if (isLoggedIn) {
        localStorage.removeItem("checkoutForm_editing");
        localStorage.removeItem("checkoutForm_savedData");
      }

      setReadyToFetchShipping(true);
      onFormValidChange?.(true);
    } catch (err) {
      console.error("❌ Failed to submit shipping:", err);
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

    if (isLoggedIn) {
      localStorage.setItem(
        "checkoutForm_editing",
        JSON.stringify({ isEditing: true })
      );

      localStorage.setItem(
        "checkoutForm_savedData",
        JSON.stringify({
          firstName,
          lastName,
          phone,
          address,
          note,
          selectedProvince,
          selectedDistrict,
          selectedWard,
        })
      );
    }

    if (isLoggedIn) {
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
          (p) => p.ProvinceName === provinceNameDisplay
        );
        if (foundProvince) {
          setSelectedProvince(String(foundProvince.ProvinceID));

          const dists = await getDistricts(foundProvince.ProvinceID);
          setDistricts(dists);

          const foundDistrict = dists.find(
            (d) => d.DistrictName === districtNameDisplay
          );
          if (foundDistrict) {
            setSelectedDistrict(String(foundDistrict.DistrictID));

            const wds = await getWards(foundDistrict.DistrictID);
            setWards(wds);

            const foundWard = wds.find((w) => w.WardName === wardNameDisplay);
            if (foundWard) {
              setSelectedWard(String(foundWard.WardCode));
            }
          }
        }
        setIsInitialLoad(false);
      } catch (err) {
        console.error("Error restoring location data:", err);
        setIsInitialLoad(false);
      }
    } else {
      setFirstName(savedFormData.firstName);
      setLastName(savedFormData.lastName);
      setPhone(savedFormData.phone);
      setAddress(savedFormData.address);
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

      setIsEditing(false);
      setShowNextStep(true);
      setReadyToFetchShipping(true);

      if (isLoggedIn) {
        localStorage.removeItem("checkoutForm_editing");
        localStorage.removeItem("checkoutForm_savedData");
      }
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
      setSelectedProvince(addressData.selectedProvince);
      await new Promise((resolve) => setTimeout(resolve, 0));

      const newDistricts = await getDistricts(addressData.selectedProvince);
      setDistricts(newDistricts);

      const foundProvince = provinces.find(
        (p) => String(p.ProvinceID) === addressData.selectedProvince
      );
      if (foundProvince) {
        setProvinceNameDisplay(foundProvince.ProvinceName);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      setSelectedDistrict(addressData.selectedDistrict);

      const newWards = await getWards(addressData.selectedDistrict);
      setWards(newWards);

      const foundDistrict = newDistricts.find(
        (d) => String(d.DistrictID) === addressData.selectedDistrict
      );
      if (foundDistrict) {
        setDistrictNameDisplay(foundDistrict.DistrictName);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));

      setSelectedWard(addressData.selectedWard);

      const foundWard = newWards.find(
        (w) => String(w.WardCode) === addressData.selectedWard
      );
      if (foundWard) {
        setWardNameDisplay(foundWard.WardName);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      setReadyToFetchShipping(true);
      onFormValidChange?.(true);
    } catch (error) {
      console.error("❌ Error loading location data:", error);
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
            wardNameDisplay={wardNameDisplay}
            districtNameDisplay={districtNameDisplay}
            provinceNameDisplay={provinceNameDisplay}
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
          codValue={paymentMethod === "COD" ? grandTotal : 0}
          toDistrictId={Number(selectedDistrict)}
          toWardCode={String(selectedWard)}
          serviceTypeId={2}
          onChange={(method) => {
            console.log("🚚 Shipping fee updated:", method.fee);
            setShippingFee(method.fee);
          }}
          onLoadingChange={setShippingLoading}
          onErrorChange={(error) => {
            setShippingError(error);
            onShippingErrorChange?.(!!error);
            onFormValidChange?.(!error);
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
