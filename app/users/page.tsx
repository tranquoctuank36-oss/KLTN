"use client";

import { useState, useEffect, useRef } from "react";
import { Package, MapPin, User as UserIcon, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

import {
  getUserProfile,
  updateUserProfile,
  updatePassword,
} from "@/services/userService";
import { User } from "@/types/user";
import { UserAddress } from "@/types/userAddress";

import { Routes } from "@/lib/routes";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import EditInfoForm from "@/components/my-account/EditInfoForm";
import ChangePasswordForm from "@/components/my-account/ChangePasswordForm";
import AddAddressForm from "@/components/my-account/AddAddressForm";
import EditAddressForm from "@/components/my-account/EditAddressForm";
import OrdersSection from "@/components/my-account/OrdersSection";
import DetailsSection from "@/components/my-account/DetailsSection";
import AddressSection from "@/components/my-account/AddressSection";

export default function MyAccountPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { logoutAll, updateUser, refetchUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [draftFirstName, setDraftFirstName] = useState("");
  const [draftLastName, setDraftLastName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftGender, setDraftGender] = useState("");
  const [draftDateOfBirth, setDraftDateOfBirth] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressData, setEditingAddressData] =
    useState<UserAddress | null>(null);

  const [addressCount, setAddressCount] = useState(0);

  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  useEffect(() => {
    cancelEdit();
    cancelChangePassword();
    cancelAddAddress();
    cancelEditAddress();
  }, [section]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // load user
  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setUser(data);
        const mode = localStorage.getItem("accountFormMode");
        if (mode === "edit") {
          setIsEditing(true);
          setDraftFirstName(data.firstName || "");
          setDraftLastName(data.lastName || "");
          setDraftEmail(data.email || "");
          setDraftGender(data.gender || "");
          setDraftDateOfBirth(
            data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : ""
          );
        } else if (mode === "password") {
          setIsChangingPassword(true);
        } else if (mode === "address") {
          setIsAddingAddress(true);
        } else if (mode === "editAddress") {
          const stored = localStorage.getItem("editingAddressData");
          if (stored) {
            const address = JSON.parse(stored);
            setEditingAddressData(address);
            setIsEditingAddress(true);
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // menu items
  const menuItems = [
    {
      id: "my-orders",
      label: "My Orders",
      icon: <Package className="h-6 w-6" />,
    },
    {
      id: "my-details",
      label: "My Details",
      icon: <UserIcon className="h-6 w-6" />,
    },
    {
      id: "address-book",
      label: "Address Book",
      icon: <MapPin className="h-6 w-6" />,
    },
    {
      id: "logoutAll",
      label: "Log out all devices",
      icon: <LogOut className="h-6 w-6" />,
      render: () => (
        <ConfirmDialog
          trigger={
            <button className="w-full flex items-center gap-3 px-4 py-4 text-left text-lg text-gray-600 hover:text-black cursor-pointer">
              <LogOut className="h-6 w-6" />
              Log out all devices
            </button>
          }
          title="Log out all devices?"
          description="You will be logged out of all devices logged in with this account."
          confirmText="Logout"
          cancelText="Cancel"
          onConfirm={async () => {
            await logoutAll();
            toast.success("Logged out of all devices!", {
              duration: 2000,
              position: "top-center",
            });
            router.push(Routes.home());
          }}
        />
      ),
    },
  ];

  // scroll spy
  const sectionsRef = {
    orders: useRef<HTMLDivElement>(null),
    details: useRef<HTMLDivElement>(null),
    address: useRef<HTMLDivElement>(null),
  };

  const menuToSection: { [key: string]: keyof typeof sectionsRef } = {
    "my-orders": "orders",
    "my-details": "details",
    "address-book": "address",
  };

  useEffect(() => {
    const handleScroll = () => {
      let current: string | null = null;
      for (const key of Object.keys(sectionsRef) as Array<
        keyof typeof sectionsRef
      >) {
        const section = sectionsRef[key].current;
        if (section && section.getBoundingClientRect().top <= 130) {
          const menuId = Object.keys(menuToSection).find(
            (id) => menuToSection[id] === key
          );
          current = menuId || null;
        }
      }
      setActive(current);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openEdit = () => {
    if (!user) return;
    setDraftFirstName(user.firstName || "");
    setDraftLastName(user.lastName || "");
    setDraftEmail(user.email || "");
    setDraftGender(user.gender || "");
    setDraftDateOfBirth(
      user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : ""
    );
    setErrors({});
    setIsEditing(true);
    setIsChangingPassword(false);
    setIsAddingAddress(false);
    setIsEditingAddress(false);
    localStorage.setItem("accountFormMode", "edit");
  };
  const cancelEdit = () => {
    setIsEditing(false);
    localStorage.removeItem("accountFormMode");
  };

  const openChangePassword = () => {
    setIsChangingPassword(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsEditing(false);
    setIsAddingAddress(false);
    setIsEditingAddress(false);
    localStorage.setItem("accountFormMode", "password");
  };
  const cancelChangePassword = () => {
    setIsChangingPassword(false);
    localStorage.removeItem("accountFormMode");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setCurrentPasswordError("");
    setNewPasswordError("");
  };

  const openAddAddress = () => {
    setIsAddingAddress(true);
    setIsEditing(false);
    setIsChangingPassword(false);
    setIsEditingAddress(false);
    localStorage.setItem("accountFormMode", "address");
  };
  const cancelAddAddress = () => {
    setIsAddingAddress(false);
    localStorage.removeItem("accountFormMode");
  };

  const pathname = usePathname();
  useEffect(() => {
    return () => {
      setIsEditing(false);
      setIsChangingPassword(false);
      setIsAddingAddress(false);
      setIsEditingAddress(false);
      localStorage.removeItem("accountFormMode");
      localStorage.removeItem("editingAddressData");
    };
  }, [pathname]);

  const openEditAddress = (address: UserAddress) => {
    setEditingAddressData(address);
    setIsEditingAddress(true);
    setIsAddingAddress(false);
    setIsEditing(false);
    setIsChangingPassword(false);
    localStorage.setItem("accountFormMode", "editAddress");
    localStorage.setItem("editingAddressData", JSON.stringify(address));
  };
  const cancelEditAddress = () => {
    setIsEditingAddress(false);
    setEditingAddressData(null);
    localStorage.removeItem("accountFormMode");
    localStorage.removeItem("editingAddressData");
  };

  const saveEdit = async () => {
    try {
      const res = await updateUserProfile({
        firstName: draftFirstName,
        lastName: draftLastName,
        gender: draftGender,
        dateOfBirth: draftDateOfBirth,
      });
      let nextUser: User | null = res ?? null;

      if (!nextUser) {
        nextUser = await getUserProfile();
      }
      if (nextUser) {
        // Cập nhật local state trang MyAccount
        setUser(nextUser);

        // Đồng bộ AuthContext để UserMenu hiển thị ngay
        updateUser(nextUser);

        // Lưu storage để lần load sau có dữ liệu mới
        localStorage.setItem("user", JSON.stringify(nextUser));
      } else {
        // fallback cuối cùng nếu có gì đó sai
        await refetchUser();
      }

      setIsEditing(false);
      localStorage.removeItem("accountFormMode");
      toast.success("Profile updated!", {
        duration: 2000,
        position: "top-center",
      });
    } catch (err) {
      console.error("Failed to update user:", err);
      return undefined;
    }
  };

  const savePassword = async () => {
    setPasswordError("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    const passMin8 = newPassword.length >= 8;
    const hasNumber = /\d/.test(newPassword);
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?\":{}|<>]/.test(newPassword);

    if (
      !(passMin8 && hasNumber && hasUppercase && hasLowercase && hasSpecial)
    ) {
      setNewPasswordError("Password doesn’t meet the strength requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success("Password reset successfully!", {
        duration: 2000,
        position: "top-center",
      });
      setIsChangingPassword(false);
      localStorage.removeItem("accountFormMode");
    } catch (err: any) {
      if (
        err.response?.data?.detail?.includes("Mật khẩu hiện tại không đúng")
      ) {
        setCurrentPasswordError("Current password is incorrect");
      } else {
        setPasswordError("Failed to change password");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-5xl font-bold text-blue-600 flex gap-1">
          <span className="animate-bounce">.</span>
          <span className="animate-bounce [animation-delay:0.2s]">.</span>
          <span className="animate-bounce [animation-delay:0.4s]">.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-6 lg:px-30 py-10 bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center px-4 mb-6">
        <h1 className="text-3xl font-bold">My Account</h1>
        <div className="text-right text-gray-700 text-lg">
          <p>Need help? Ask our experts</p>
          <div>
            <span className="text-gray-400 text-sm underline">
              1900 12 34 56
            </span>{" "}
            |{" "}
            <Link href="#" className="text-gray-400 text-sm">
              Chat Online
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div
          className="w-1/4 bg-white rounded-lg p-6 shadow-sm h-fit sticky"
          style={{ top: "var(--header-h)" }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-3 border-blue-600">
              <Image
                src="/avatar_user.png"
                alt="User"
                width={150}
                height={150}
                className="object-cover bg-gray-300"
              />
            </div>
            <h2 className="mt-5 font-semibold text-3xl text-gray-600">
              Hi{" "}
              {user?.firstName && user.firstName.trim() !== ""
                ? user.firstName
                : "You"}
            </h2>
          </div>

          <div className="mt-6 border-t border-gray-300">
            {menuItems.map((item) => (
              <div key={item.id} className="border-b border-gray-300">
                {item.render ? (
                  item.render()
                ) : (
                  <button
                    onClick={() => {
                      router.push(`${Routes.users()}?section=${item.id}`);
                      setActive(item.id);
                      setTimeout(() => {
                        const sectionKey = menuToSection[item.id];
                        if (sectionKey) {
                          sectionsRef[sectionKey]?.current?.scrollIntoView({ 
                            behavior: "smooth" 
                          });
                        }
                      }, 100);
                    }}
                    className={`relative w-full flex items-center gap-3 px-4 py-4 text-left transition cursor-pointer text-lg ${
                      active === item.id
                        ? "text-black font-medium before:content-[''] before:absolute before:-left-6 before:top-1/2 before:-translate-y-1/2 before:w-[2px] before:h-12 before:bg-blue-800 rounded-full"
                        : "text-gray-700 hover:text-black hover:font-medium"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {isEditing ? (
            <EditInfoForm
              draftFirstName={draftFirstName}
              draftLastName={draftLastName}
              draftEmail={draftEmail}
              draftGender={draftGender}
              draftDateOfBirth={draftDateOfBirth}
              errors={errors}
              setDraftFirstName={setDraftFirstName}
              setDraftLastName={setDraftLastName}
              setDraftEmail={setDraftEmail}
              setDraftGender={setDraftGender}
              setDraftDateOfBirth={setDraftDateOfBirth}
              cancelEdit={cancelEdit}
              saveEdit={saveEdit}
            />
          ) : isChangingPassword ? (
            <ChangePasswordForm
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              currentPasswordError={currentPasswordError}
              newPasswordError={newPasswordError}
              passwordError={passwordError}
              setCurrentPassword={setCurrentPassword}
              setNewPassword={setNewPassword}
              setConfirmPassword={setConfirmPassword}
              cancelChangePassword={cancelChangePassword}
              savePassword={savePassword}
            />
          ) : isAddingAddress ? (
            <AddAddressForm
              onCancel={cancelAddAddress}
              onSave={(data) => {
                console.log("Address saved:", data);
                cancelAddAddress();
              }}
              existingCount={addressCount}
            />
          ) : isEditingAddress && editingAddressData ? (
            <EditAddressForm
              initialData={editingAddressData}
              onCancel={cancelEditAddress}
              onSave={(data) => {
                console.log("Edited address:", data);
                cancelEditAddress();
              }}
              onDelete={() => {
                console.log("Delete address:", editingAddressData?.id);
                cancelEditAddress();
              }}
            />
          ) : section === "my-orders" ? (
            <OrdersSection ref={sectionsRef.orders} />
          ) : section === "my-details" ? (
            <DetailsSection
              ref={sectionsRef.details}
              user={user}
              openEdit={openEdit}
              openChangePassword={openChangePassword}
            />
          ) : section === "address-book" ? (
            <AddressSection
              ref={sectionsRef.address}
              onAddAddress={openAddAddress}
              onEditAddress={openEditAddress}
              onCountChange={(count: number) => setAddressCount(count)}
            />
          ) : (
            <>
              <OrdersSection ref={sectionsRef.orders} />
              <DetailsSection
                ref={sectionsRef.details}
                user={user}
                openEdit={openEdit}
                openChangePassword={openChangePassword}
              />
              <AddressSection
                ref={sectionsRef.address}
                onAddAddress={openAddAddress}
                onEditAddress={openEditAddress}
                onCountChange={(count: number) => setAddressCount(count)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
