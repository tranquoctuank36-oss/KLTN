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
import { useState } from "react";

type ConfirmDialogProps = {
  trigger: React.ReactNode;       
  title?: string;
  description?: string; 
  confirmText?: string;   
  cancelText?: string;             
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDialog({
  trigger,
  title = "Xác nhận hành động",
  description = "Bạn có chắc chắn muốn tiếp tục không?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 w-20 bg-white border border-2 border-gray-400 hover:border-gray-800 text-sm font-bold text-gray-400 hover:text-gray-800 hover:bg-white rounded-full"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className="h-10 w-20 bg-blue-600 text-white text-sm font-bold hover:bg-blue-800 rounded-full"
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
