import { Outlet, useMatch } from "react-router-dom";
import ChatList from "./ChatList";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useFavicon } from "@/hooks/useFavicon";
import { useSidebarUpdates } from "../hooks/useSidebarUpdates";

function ChatLayout() {
  const inChat = useMatch("/chat/:conversationId/*");

  usePageTitle("Chatting");
  useFavicon("/bubble-chat.png");

  useSidebarUpdates();
  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[420px_1fr]">
      <aside
        className={`border-r-2 border-gray-200 border-solid ${
          inChat ? "hidden md:block" : "block"
        }`}
      >
        <ChatList />
      </aside>

      <main
        className={`h-screen w-full bg-gray-50 ${
          !inChat ? "hidden md:flex" : "flex"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default ChatLayout;
