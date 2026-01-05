"use client";

import { useState, useEffect, useRef } from "react";
import { Package, MapPin, User as UserIcon, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import {
  getUserProfile,
  updateUserProfile,
  updatePassword,
} from "@/services/userService";
import { User } from "@/types/user";
import { UserAddress } from "@/types/userAddress";

import { Routes } from "@/lib/routes";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import EditInfoForm from "@/components/my-account/EditInfoForm";
import ChangePasswordForm from "@/components/my-account/ChangePasswordForm";
import AddAddressForm from "@/components/my-account/AddAddressForm";
import EditAddressForm from "@/components/my-account/EditAddressForm";
import OrdersSection from "@/components/my-account/OrdersSection";
import DetailsSection from "@/components/my-account/DetailsSection";
import AddressSection from "@/components/my-account/AddressSection";

export default function MyAccountClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { logoutAll, updateUser, refetchUser, user: authUser } = useAuth();

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
  
  // Determine active menu based on section
  const getActiveMenu = (currentSection: string | null) => {
    if (!currentSection) return null;
    if (currentSection.startsWith("my-orders")) return "my-orders";
    return currentSection;
  };

  useEffect(() => {
    cancelEdit();
    cancelChangePassword();
    cancelAddAddress();
    cancelEditAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // load user
  useEffect(() => {
    // Ưu tiên dùng user từ AuthContext
    if (authUser) {
      setUser(authUser);
      const mode = localStorage.getItem("accountFormMode");

      if (mode === "edit") {
        setIsEditing(true);
        setDraftFirstName(authUser.firstName || "");
        setDraftLastName(authUser.lastName || "");
        setDraftEmail(authUser.email || "");
        setDraftGender(authUser.gender || "");
        setDraftDateOfBirth(
          authUser.dateOfBirth ? authUser.dateOfBirth.substring(0, 10) : ""
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
      setIsLoading(false);
    } else {
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
        .finally(() => setIsLoading(false));
    }
  }, [authUser]);

  // menu items
  const menuItems = [
    {
      id: "my-orders",
      label: "Đơn hàng của tôi",
      icon: <Package className="h-6 w-6" />,
    },
    {
      id: "my-details",
      label: "Thông tin cá nhân",
      icon: <UserIcon className="h-6 w-6" />,
    },
    {
      id: "address-book",
      label: "Địa chỉ",
      icon: <MapPin className="h-6 w-6" />,
    },
    {
      id: "logoutAll",
      label: "Đăng xuất tất cả thiết bị",
      icon: <LogOut className="h-6 w-6" />,
      render: () => (
        <ConfirmDialog
          trigger={
            <button className="w-full flex items-center gap-3 px-4 py-4 text-left text-lg text-gray-600 hover:text-black cursor-pointer">
              <LogOut className="h-6 w-6" />
              Đăng xuất tất cả thiết bị
            </button>
          }
          title="Đăng xuất tất cả thiết bị?"
          description="Bạn sẽ bị đăng xuất khỏi tất cả các thiết bị đã đăng nhập với tài khoản này."
          confirmText="Đăng xuất"
          cancelText="Hủy bỏ"
          onConfirm={async () => {
            await logoutAll();
            toast.success("Đã đăng xuất khỏi tất cả thiết bị!", {
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
    // Set active based on section parameter
    if (section) {
      setActive(getActiveMenu(section));
    }
  }, [section]);

  useEffect(() => {
    const handleScroll = () => {
      // Only update active from scroll if no section parameter
      if (section) return;
      
      let current: string | null = null;
      for (const key of Object.keys(sectionsRef) as Array<
        keyof typeof sectionsRef
      >) {
        const el = sectionsRef[key].current;
        if (el && el.getBoundingClientRect().top <= 130) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

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

      let nextUser: User | null = (res as any) ?? null;
      if (!nextUser) nextUser = await getUserProfile();

      if (nextUser) {
        setUser(nextUser);
        updateUser(nextUser);
        localStorage.setItem("user", JSON.stringify(nextUser));
      } else {
        await refetchUser();
      }

      setIsEditing(false);
      localStorage.removeItem("accountFormMode");

      toast.success("Thông tin được cập nhật thành công!", {
        duration: 2000,
        position: "top-center",
      });
    } catch (err) {
      console.error("Không Thể Cập Nhật Người Dùng:", err);
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
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!(passMin8 && hasNumber && hasUppercase && hasLowercase && hasSpecial)) {
      setNewPasswordError("Mật khẩu phải dài ít nhất 8 ký tự và bao gồm chữ số, chữ in hoa, chữ thường và ký tự đặc biệt.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu không khớp");
      return;
    }

    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success("Mật khẩu được đặt lại thành công!", {
        duration: 2000,
        position: "top-center",
      });
      setIsChangingPassword(false);
      localStorage.removeItem("accountFormMode");
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail);
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
        <h1 className="text-3xl font-bold">Tài Khoản của tôi</h1>
        <div className="text-right text-gray-700 text-lg">
          <p>Cần giúp đỡ? Hỏi các chuyên gia của chúng tôi</p>
          <div>
            <span className="text-gray-400 text-sm underline">1900 12 34 56</span>{" "}
            |{" "}
            <Link href="#" className="text-gray-400 text-sm">
              Trò chuyện trực tiếp
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
                alt="Người dùng"
                width={150}
                height={150}
                className="object-cover bg-gray-300"
              />
            </div>
            <h2 className="mt-5 font-semibold text-3xl text-gray-600">
              Xin chào{" "}
              {user?.firstName && user.firstName.trim() !== ""
                ? user.firstName
                : "Bạn"}
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
                            behavior: "smooth",
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
          ) : section === "my-orders" || section === "my-orders/reviews" ? (
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
