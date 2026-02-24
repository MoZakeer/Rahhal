import { Outlet, useMatch } from "react-router";
import ChatList from "./ChatList";

function ChatLayout() {
  const inChat = useMatch("/chat/:chatId/*");
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[370px_1fr] 
      md:grid-cols-[420px_1fr]
      border-t border-solid border-gray-100"
    >
      <aside
        className={`border-r-2 border-gray-200 border-solid ${inChat ? "hidden md:block " : "block "}`}
      >
        <ChatList />
      </aside>

      <main
        className={`h-screen w-full bg-gray-50 ${!inChat ? "hidden md:flex" : "flex"}`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default ChatLayout;
