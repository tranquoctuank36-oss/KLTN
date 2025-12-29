"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquareMore } from "lucide-react";

type ChatFabProps = {
  bottom?: number;  
  right?: number;
};

export default function ChatFab({ bottom = 24, right = 24 }: ChatFabProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          aria-label="Open chat"
          className="
            fixed z-50 grid place-items-center rounded-full
            h-12 w-12 md:h-14 md:w-14
            bg-[#1e7bf4] text-white
            drop-shadow-lg hover:bg-blue-800
          "
          style={{ bottom, right }}
        >
          <MessageSquareMore className="!h-8 !w-8 !md:h-10 !md:w-10" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl" aria-describedby={undefined}>
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle>Chat with us</DialogTitle>
        </DialogHeader>

        <div className="h-[380px] overflow-y-auto p-5 space-y-3 bg-white">
          <div className="text-sm text-slate-600">
            👋 Hi! How can we help you today?
          </div>
          {/* …nhúng component chat thật ở đây */}
        </div>

        <form
          className="flex items-center gap-2 border-t p-3"
          onSubmit={(e) => {
            e.preventDefault();
            // handle send…
          }}
        >
          <input
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Type a message…"
          />
          <Button type="submit">Send</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
