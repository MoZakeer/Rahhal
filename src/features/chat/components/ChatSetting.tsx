import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { HiOutlineXMark } from "react-icons/hi2";
import SettingInfo from "./SettingInfo";
import GroupMembers from "./GroupMembers";
import GroupRequests from "./GroupRequests";
import LeaveGroup from "./LeaveGroup";

function ChatSettings() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(true);
  }, []);

  function close() {
    setOpen(false);
    setTimeout(() => navigate(-1), 250);
  }

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
    bg-white
    shadow-2xl
    transform transition-transform duration-300 ease-out
    flex flex-col
    ${open ? "translate-x-0" : "translate-x-full"}
  `}
      >
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-12">
          <SettingInfo />
          <GroupMembers />
          <GroupRequests />
          <LeaveGroup />
        </div>
      </div>
    </div>
  );
}

export default ChatSettings;
