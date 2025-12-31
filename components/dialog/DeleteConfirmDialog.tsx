"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAddress } from "@/types/userAddress";
import { deleteAddress } from "@/services/userService";
import toast from "react-hot-toast";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  address?: UserAddress | null;
};

export default function DeleteConfirmDialog({
  open,
  onClose,
  onDeleted,
  address,
}: Props) {
  const [saving, setSaving] = useState(false);
  const handleDelete = async () => {
    if (!address?.id) return;
    try {
      setSaving(true);
      await deleteAddress(address.id as string);
      toast.success("Address deleted successfully!", {
        duration: 2000,
        position: "top-center",
      });
      onDeleted();
      onClose();
    } catch (error) {
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Delete address
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-base text-gray-600 -mt-2">
          Are you sure you want to delete the following address?
        </DialogDescription>

        <hr className="border-t-2 border-gray-200 my-2" />

        {address && (
          <div className="text-base text-gray-700 space-y-1">
            <p className="font-semibold">{address.recipientName}</p>
            <p className="text-gray-400">{address.recipientPhone}</p>
            <p className="text-gray-700">
              {address.addressLine}, {address.provinceName}, {address.districtName},{" "}
              {address.wardName}
            </p>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            type="button"
            className="h-12 w-30 bg-white border border-2 border-gray-400 hover:border-gray-800 text-lg font-bold text-gray-400 hover:text-gray-800 hover:bg-white rounded-full"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="h-12 w-30 bg-blue-600 text-white text-lg font-bold hover:bg-blue-800 rounded-full"
          >
            {saving ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
