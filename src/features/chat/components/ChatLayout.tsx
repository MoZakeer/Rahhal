import { Outlet, useMatch } from "react-router";
import ChatList from "./ChatList";
import { useSignalRConnection } from "../hooks/useSignalRConnection";
import { useSidebarUpdates } from "../hooks/useSidebarUpdates";
import { usePageTitle } from "@/hooks/usePageTitle";

function ChatLayout() {
  const inChat = useMatch("/chat/:conversationId/*");

  const connection = useSignalRConnection();
  usePageTitle("Chatting");
  useSidebarUpdates(connection);
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
        <Outlet context={{ connection }} />
      </main>
    </div>
  );
}

export default ChatLayout;
