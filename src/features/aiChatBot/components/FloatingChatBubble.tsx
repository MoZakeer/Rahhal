import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatWindow from "./ChatWindow";

const FloatingChatBubble = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hide bubble on the dedicated /AIChatBot page to avoid duplication.
  if (location.pathname === "/AIChatBot") return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[560px] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl animate-in slide-in-from-bottom-4 fade-in">
          <ChatWindow />
        </div>
      )}
      <Button
        onClick={() => setOpen((v) => !v)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </>
  );
};

export default FloatingChatBubble;
