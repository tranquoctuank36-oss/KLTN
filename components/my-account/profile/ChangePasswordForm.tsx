"use client";
import FloatingInput from "@/components/ui-common/FloatingInput";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  setCurrentPassword: (val: string) => void;
  setNewPassword: (val: string) => void;
  setConfirmPassword: (val: string) => void;
  currentPasswordError?: string;
  newPasswordError?: string;
  passwordError?: string;
  cancelChangePassword: () => void;
  savePassword: () => void;
};

export default function ChangePasswordForm({
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  currentPasswordError,
  newPasswordError,
  passwordError,
  cancelChangePassword,
  savePassword,
}: Props) {
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Thay đổi mật khẩu</h3>
        <Button
          type="button"
          onClick={cancelChangePassword}
          className="w-9 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full drop-shadow-none"
        >
          ✕
        </Button>
      </div>

      <hr className="my-4 border-t-2" />

      <p className="text-gray-600 mb-6 font-normal">
        Mật khẩu mạnh bao gồm tối thiểu 8 ký tự. Bạn có thể sử dụng bất kỳ kết hợp nào của chữ hoa, chữ thường, ký hiệu và số.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          savePassword();
        }}
      >
        <div className="flex flex-col items-center w-full ">
          <div className="space-y-4 w-full max-w-[400px]">
            <FloatingInput
              id="current"
              label="Mật khẩu hiện tại"
              type={showCurrentPwd ? "text" : "password"}
              value={currentPassword}
              onChange={setCurrentPassword}
              required
              rightIcon={
                <Button
                  type="button"
                  onClick={() => setShowCurrentPwd((v) => !v)}
                  className="drop-shadow-none bg-white
                w-9 h-9 flex items-center justify-center
                rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                  aria-label={
                    showCurrentPwd ? "Ẩn mật khẩu" : "Xem mật khẩu"
                  }
                >
                  {showCurrentPwd ? (
                    <EyeOff className="!h-5 !w-5" />
                  ) : (
                    <Eye className="!h-5 !w-5" />
                  )}
                </Button>
              }
            />
            {currentPasswordError && (
              <p className="text-red-500 text-sm -mt-2">
                {currentPasswordError}
              </p>
            )}

            <FloatingInput
              id="new"
              label="Mật khẩu mới"
              type={showNewPwd ? "text" : "password"}
              value={newPassword}
              onChange={setNewPassword}
              required
              rightIcon={
                <Button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="drop-shadow-none bg-white
                w-9 h-9 flex items-center justify-center
                rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                  aria-label={showNewPwd ? "Ẩn mật khẩu" : "Xem mật khẩu"}
                >
                  {showNewPwd ? (
                    <EyeOff className="!h-5 !w-5" />
                  ) : (
                    <Eye className="!h-5 !w-5" />
                  )}
                </Button>
              }
            />
            {newPasswordError && (
              <p className="text-red-500 text-sm -mt-2">{newPasswordError}</p>
            )}
            <FloatingInput
              id="confirm"
              label="Xác nhận mật khẩu"
              type={showConfirmPwd ? "text" : "password"}
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              rightIcon={
                <Button
                  type="button"
                  onClick={() => setShowConfirmPwd((v) => !v)}
                  className="drop-shadow-none bg-white
                w-9 h-9 flex items-center justify-center
                rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                  aria-label={
                    showConfirmPwd ? "Ẩn mật khẩu" : "Xem mật khẩu"
                  }
                >
                  {showConfirmPwd ? (
                    <EyeOff className="!h-5 !w-5" />
                  ) : (
                    <Eye className="!h-5 !w-5" />
                  )}
                </Button>
              }
            />
            {passwordError && (
              <p className="text-red-500 text-sm -mt-2">{passwordError}</p>
            )}
          </div>
        </div>
        {/* BUTTONS */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            type="button"
            onClick={cancelChangePassword}
            className="h-12 w-25 bg-white border border-2 border-gray-400 hover:border-gray-800 text-lg font-bold text-gray-400 hover:text-gray-800 rounded-full"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="h-12 w-25 bg-blue-600 text-white text-lg font-bold hover:bg-blue-800 rounded-full"
          >
            Lưu
          </Button>
        </div>
      </form>
    </div>
  );
}
