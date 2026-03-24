import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { HiOutlineXMark } from "react-icons/hi2";
import SettingInfo from "./SettingInfo";
import GroupMembers from "./GroupMembers";
import LeaveGroup from "./LeaveGroup";
import { useChatDetails } from "../hooks/useChatDetails";
import ChatSettingsSkeleton from "./ChatSettingSkeleton";
import { conversationImage } from "../../../utils/helper";

function ChatSettings() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { isPending, data } = useChatDetails({
    conversationId: conversationId || "",
  });
  function close() {
    setOpen(false);
    setTimeout(() => navigate(-1), 250);
  }
  const settings = data?.data;
  const mainInfo = {
    name: settings?.title || "",
    description: settings?.description || "",
    isGroup: settings?.isGroup || false,
    avatar: conversationImage({
      isGroup: settings?.isGroup || false,
      conversationPictureURL: settings?.conversationPictureURL,
    }),
  };
  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
    fixed right-0 top-0 h-full
    w-full sm:max-w-md
    bg-gray-0
    shadow-2xl
    transform transition-transform duration-300 ease-out
    flex flex-col
    ${open ? "translate-x-0" : "translate-x-full"}
  `}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold tracking-tight">
            Chat Settings
          </h2>

          <button
            onClick={close}
            className="p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <HiOutlineXMark className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {isPending ? (
          <ChatSettingsSkeleton />
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-12">
            <SettingInfo chatInfo={mainInfo} />
            {settings?.isGroup && (
              <>
                <GroupMembers
                  participants={settings.participants}
                  isAdmin={settings?.isCurrentUserAdmin}
                />
                <LeaveGroup />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatSettings;
