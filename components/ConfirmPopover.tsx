"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PopoverArrow } from "@radix-ui/react-popover";

export default function ConfirmPopover({
  children,
  title,
  onConfirm,
}: {
  children: React.ReactNode;
  title: string;
  onConfirm: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-auto p-4 rounded-lg shadow-lg border bg-white"
      >
        <PopoverArrow className="fill-white rounded-lg" />
        <p className="text-sm text-gray-600 text-center">
          Are you sure you want to remove{" "}
          <br/>
          <span className="font-semibold text-black">{title}</span> ?
        </p>
        <div className="flex justify-center gap-3 mt-4">
          <Button
            variant="outline"
            className="px-6 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-black text-white px-6 rounded-full hover:bg-black/80"
          >
            Remove
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
