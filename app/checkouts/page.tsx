"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import LoginDialog from "@/components/loginDialog";
import FloatingInput from "@/components/FloatingInput";
import ShippingMethods from "@/components/ShippingMethods";
import PaymentMethods from "@/components/PaymentMethod";
import { Routes } from "@/lib/routes";
import { CalendarDays, DollarSign, Truck } from "lucide-react";

type Province = { code: number; name: string };
type District = { code: number; name: string };
type Ward = { code: number; name: string };

export default function CheckoutPage() {
  const { cart, subtotal, totalQuantity, discountCode, discountAmount } =
    useCart();

  // Login dialog
  const [loginOpen, setLoginOpen] = useState(false);

  // Address options
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Address selections
  const [country, setCountry] = useState("VN");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [city, setCity] = useState(""); // dùng khi country !== "VN"

  // Form states (controlled)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // Others
  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [shippingFee, setShippingFee] = useState(0);

  // Load provinces
  useEffect(() => {
    if (country === "VN") {
      fetch("https://provinces.open-api.vn/api/?depth=1")
        .then((res) => res.json())
        .then((data) => setProvinces(data));
    }
  }, [country]);

  // Load districts
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts || []));
      setDistricts([]);
      setWards([]);
      setSelectedDistrict("");
      setSelectedWard("");
    }
  }, [selectedProvince]);

  // Load wards
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []));
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate required fields
    const missingBasic =
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim();

    const missingVN =
      country === "VN" &&
      (!selectedProvince || !selectedDistrict || !selectedWard);

    const missingIntl = country !== "VN" && !city.trim();

    if (missingBasic || missingVN || missingIntl) {
      return; // hiển thị lỗi trên UI nhờ forceValidate={submitted}
    }

    // Submit payload
    console.log("Submit checkout", {
      firstName,
      lastName,
      email,
      phone,
      address,
      note,
      country,
      selectedProvince,
      selectedDistrict,
      selectedWard,
      city,
      paymentMethod,
      shippingFee,
    });
  };

  const grandTotal = subtotal + shippingFee - discountAmount;

  return (
    <div className="max-w-full px-20 lg:px-30 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-gray-50">
      {/* LEFT: SHIPPING FORM */}
      <div className="lg:col-span-2">
        {/* Login dialog */}
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-base font-semibold text-gray-500">
            Already have a GlassesUSA account?
            <Button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="text-gray-800 underline shadow-none pl-2 text-base font-bold hover:no-underline"
            >
              Sign in here
            </Button>
          </p>

          <LoginDialog
            open={loginOpen}
            onOpenChange={setLoginOpen}
            onSwitchToSignup={() => {
              console.log("switch to signup");
            }}
          />
        </div>

        {/* Customer form */}
        <div className="bg-white rounded-lg shadow p-6 mt-5">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Customer information</h1>
            <span className="text-sm text-gray-500">* Required Fields</span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 overflow-y-auto pr-2 pb-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                id="firstName"
                label="* First Name"
                required
                value={firstName}
                onChange={setFirstName}
                forceValidate={submitted}
              />
              <FloatingInput
                id="lastName"
                label="* Last Name"
                required
                value={lastName}
                onChange={setLastName}
                forceValidate={submitted}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                id="email"
                type="email"
                label="* Email Address"
                required
                value={email}
                onChange={setEmail}
                forceValidate={submitted}
              />
              <FloatingInput
                id="phone"
                label="* Phone Number"
                required
                value={phone}
                onChange={setPhone}
                forceValidate={submitted}
              />
            </div>

            <h1 className="text-2xl font-bold mt-8">Delivery address</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  * Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-12 border rounded-md px-3 pr-8"
                >
                  <option value="VN">Vietnam</option>
                  {/* Có thể bổ sung thêm quốc gia khác tại đây */}
                </select>
              </div>

              {country === "VN" ? (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    * Province/City
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className={`w-full h-12 border rounded-md px-3 ${
                      submitted && !selectedProvince
                        ? "border-red-500 bg-red-50"
                        : ""
                    }`}
                  >
                    <option value="">Select Province</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {submitted && !selectedProvince && (
                    <p className="text-xs text-red-500 mt-1">
                      Please select a province
                    </p>
                  )}
                </div>
              ) : (
                <FloatingInput
                  id="city"
                  label="* Province/City"
                  required
                  value={city}
                  onChange={setCity}
                  forceValidate={submitted}
                />
              )}
            </div>

            {country === "VN" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    * District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className={`w-full h-12 border rounded-md px-3 ${
                      submitted && !selectedDistrict
                        ? "border-red-500 bg-red-50"
                        : ""
                    }`}
                    disabled={!selectedProvince}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {submitted && !selectedDistrict && (
                    <p className="text-xs text-red-500 mt-1">
                      Please select a district
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    * Ward/Commune
                  </label>
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className={`w-full h-12 border rounded-md px-3 ${
                      submitted && !selectedWard
                        ? "border-red-500 bg-red-50"
                        : ""
                    }`}
                    disabled={!selectedDistrict}
                  >
                    <option value="">Select Ward</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  {submitted && !selectedWard && (
                    <p className="text-xs text-red-500 mt-1">
                      Please select a ward
                    </p>
                  )}
                </div>
              </div>
            )}

            <FloatingInput
              id="address"
              label="* Address"
              required
              value={address}
              onChange={setAddress}
              forceValidate={submitted}
            />

            <textarea
              placeholder="Note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="
                border rounded-md px-3 py-2 w-full
                focus:outline-none focus:border-blue-500
                resize-none
              "
            />

            {/* Submit button (nếu cần submit form ở đây) */}
            {/* <Button type="submit" className="mt-2">Place Order</Button> */}
          </form>
        </div>

        <ShippingMethods
          onChange={(method) => {
            setShippingFee(method.fee);
          }}
        />

        <PaymentMethods
          value={paymentMethod}
          onChange={setPaymentMethod}
          submitted={submitted}
        />
      </div>

      {/* RIGHT: ORDER SUMMARY */}
      <div className="sticky h-fit lg:col-span-1 flex flex-col gap-4" style={{ top: "var(--header-h)" }}>
        <div className=" bg-white rounded-lg shadow">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">
              Your Cart ({totalQuantity})
            </h2>
            <Link
              href={Routes.cart()}
              className="text-gray-800 underline text-base font-medium"
            >
              Edit Cart
            </Link>
          </div>

          {/* Items */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto px-6 py-4">
            {cart.map((item, index) => (
              <div
                key={`${item.product.slug}-${index}`}
                className={`flex gap-3 pb-4 ${
                  index !== cart.length - 1 ? "border-b" : ""
                }`}
              >
                <Image
                  src={
                    item.selected.images.find((i) => i.id === "front")?.url ||
                    ""
                  }
                  alt={item.product.name}
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded bg-gray-100 object-contain"
                />
                <div className="flex-1 pl-2">
                  <p className="font-bold pb-1">{item.product.name}</p>
                  <p className="text-gray-500 font-semibold pb-2">
                    {item.selected.label}
                  </p>

                  <div className="flex items-center gap-2 pb-2">
                    {item.product.oldPrice && (
                      <span className="text-gray-400 line-through">
                        ${(item.product.oldPrice * item.quantity).toFixed(2)}
                      </span>
                    )}
                    <span className="font-semibold text-gray-800">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 font-medium pb-2">
                    Qty:{" "}
                    <span className="font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                  </p>

                  <p className="text-gray-600 underline cursor-pointer">
                    More Details
                  </p>
                </div>
              </div>
            ))}

            <div className="space-y-2 text-sm font-medium text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping & Handling:</span>
                <span>${shippingFee.toFixed(2)}</span>
              </div>

              {discountCode && discountAmount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>
                    Discount{" "}
                    <span className="text-gray-600">({discountCode})</span>
                  </span>
                  <span>- ${discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Grand Total */}
          <div className="border-t px-6 py-4">
            <div className="flex justify-between font-semibold items-center">
              <span>Grand Total:</span>
              <div className="flex items-center gap-2">
                {discountAmount > 0 && (
                  <span className="text-gray-400 line-through">
                    ${(subtotal + (shippingFee ?? 0)).toFixed(2)}
                  </span>
                )}
                <span className="text-red-600 text-xl">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-gray-700 text-sm bg-transparent px-2 mt-2">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-gray-500" />
            <span>Free shipping & returns</span>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            <span>45-day return & exchange</span>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <span>100% money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
