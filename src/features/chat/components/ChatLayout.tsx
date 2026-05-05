import { Outlet, useMatch } from "react-router-dom";
import ChatList from "./ChatList";
import { useSidebarUpdates } from "../hooks/useSidebarUpdates";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useRealtime } from "@/context/RealtimeContext";
import { useFavicon } from "@/hooks/useFavicon";

function ChatLayout() {
  const inChat = useMatch("/chat/:conversationId/*");
  const { chatConnection } = useRealtime();
  usePageTitle("Chatting");
  useFavicon("/bubble-chat.png");
  useSidebarUpdates(chatConnection);
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[370px_1fr] 
      md:grid-cols-[420px_1fr]
      "
    >
      <aside
        className={`border-r-2 border-gray-200 border-solid ${inChat ? "hidden md:block " : "block "}`}
      >
        <ChatList />
      </aside>

      <main
        className={`h-screen w-full bg-gray-50 ${!inChat ? "hidden md:flex" : "flex"}`}
      >
        <Outlet context={{ chatConnection }} />
      </main>
    </div>
  );
}

export default ChatLayout;
