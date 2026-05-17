import ChatWindow from "@/features/aiChatBot/components/ChatWindow";

const Chat = () => {
  return (
    <div className="container max-w-3xl mx-auto pt-20 pb-6">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold">Rahhal AI Assistant</h1>

        <p className="text-sm text-muted-foreground">
          Plan trips, get recommendations, and discover hidden gems — all in one
          chat.
        </p>
      </div>

      <div className="h-[calc(100vh-11rem)] overflow-hidden rounded-xl border border-secondary/70 shadow-card">
        <ChatWindow />
      </div>
    </div>
  );
};

export default Chat;
