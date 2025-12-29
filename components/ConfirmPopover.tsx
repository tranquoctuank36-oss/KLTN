"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import * as RadixPopover from "@radix-ui/react-popover";

type ConfirmPopoverProps = {
  children: React.ReactNode;
  title: string;
  onConfirm: () => void;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmPopover({
  children,
  title,
  onConfirm,
  description = "Are you sure you want to remove",
  confirmText = "Remove",
  cancelText = "Cancel",
}: ConfirmPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      {/* Thêm Portal để render đúng vị trí */}
      <RadixPopover.Portal>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-auto max-w-sm p-4 rounded-lg shadow-xl border border-gray-200 bg-white z-[150]"
          // Prevent click outside khi đang trong drawer
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Arrow với styling đẹp hơn */}
          <RadixPopover.Arrow className="fill-white drop-shadow" />

          {/* Content */}
          <div className="space-y-3">
            <p className="text-sx text-gray-700 text-center leading-relaxed">
              {description}
              <br />
              <span className="font-semibold text-gray-900">{title}</span>?
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-2">
              {/* Cancel Button */}
              <RadixPopover.Close asChild>
                <Button
                  variant="outline"
                  className="flex-1 px-6 rounded-full border-gray-300 hover:bg-gray-300 transition-colors"
                >
                  {cancelText}
                </Button>
              </RadixPopover.Close>

              <RadixPopover.Close asChild>
                <Button
                  onClick={onConfirm}
                  className="flex-1 px-6 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                >
                  {confirmText}
                </Button>
              </RadixPopover.Close>
            </div>
          </div>
        </PopoverContent>
      </RadixPopover.Portal>
    </Popover>
  );
}
