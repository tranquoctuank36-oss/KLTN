"use client";
import { forwardRef, useEffect, useState } from "react";
import { User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

type Props = {
  user: User | null;
  openEdit: () => void;
  openChangePassword: () => void;
};

const DetailsSection = forwardRef<HTMLDivElement, Props>(
  ({ user, openEdit, openChangePassword }, ref) => {
    const [loading, setLoading] = useState(true);
    const [subLoading, setSubLoading] = useState(false);

    useEffect(() => {
      setTimeout(() => {
        setLoading(false);
      }, 600);
    }, []);

    if (loading || subLoading) {
      return (
        <div
          ref={ref}
          className="flex flex-col justify-center items-center h-[250px] text-gray-500"
        >
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="bg-white border rounded-lg p-6 shadow-sm scroll-mt-[var(--header-h)]"
      >
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className="h-6 w-6 text-gray-600" />
          <h3 className="text-2xl font-semibold">My Details</h3>
        </div>

        <p className="text-gray-700 mb-4 font-normal">
          Feel free to edit any of your details below so your account is totally
          up to date.
        </p>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p className="text-gray-500 text-sm">First Name:</p>
            <p className="text-gray-800 text-base">{user?.firstName || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Gender:</p>
            <p className="text-gray-800 text-base">{user?.gender || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Last Name:</p>
            <p className="text-gray-800 text-base">{user?.lastName || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Date of Birth:</p>
            <p className="text-gray-800 text-base">
              {user?.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 text-sm">Email Address:</p>
            <p className="text-gray-800 text-base">{user?.email || "—"}</p>
          </div>
        </div>

        <div className="border-t-2 border-gray-300 mt-6 pt-2 flex gap-6">
          <Button
            className="text-blue-800 font-normal hover:underline drop-shadow-none p-0 text-base"
            onClick={() => {
              setSubLoading(true);
              setTimeout(() => {
                openEdit();
                setSubLoading(false);
              }, 600);
            }}
          >
            Edit Information
          </Button>
          <Button
            className="text-blue-800 font-normal hover:underline drop-shadow-none p-0 text-base"
            onClick={() => {
              setSubLoading(true);
              setTimeout(() => {
                openChangePassword();
                setSubLoading(false);
              }, 600);
            }}
          >
            Change Password
          </Button>
        </div>
      </div>
    );
  }
);

DetailsSection.displayName = "DetailsSection";
export default DetailsSection;
