import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessageItem, { TypingIndicator } from "./ChatMessage";
import {
  createMessage,
  getInitialMessages,
  sendChatMessage,
  suggestedPrompts,
  type ChatMessage,
} from "../services/chatApi";

interface Props {
  className?: string;
  showHeader?: boolean;
}

const ChatWindow = ({ className, showHeader = true }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getInitialMessages());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg = createMessage("user", trimmed);
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await sendChatMessage({ message: trimmed, history });
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", "Sorry, something went wrong. Please try again."),
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleReset = () => {
    setMessages(getInitialMessages());
    setInput("");
  };

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className={`flex h-full flex-col bg-card ${className ?? ""}`}>
      {showHeader && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/15">
              <Sparkles className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold">Rahhal AI</p>
              <p className="text-xs text-muted-foreground">Your travel assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            New chat
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex flex-col gap-4 p-4">
          {messages.map((m) => (
            <ChatMessageItem key={m.id} message={m} />
          ))}
          {loading && <TypingIndicator />}

          {showSuggestions && (
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask anything about your trip…"
            rows={1}
            className="max-h-32 min-h-[40px] resize-none"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
