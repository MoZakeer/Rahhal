import { Link, useNavigate } from "react-router";
import Avatar from "./Avatar";
import { HiOutlineChevronLeft } from "react-icons/hi2";

function ChatHeader({
  title,
  avatar,
  isOnline,
  lastSeen,
  isGroup,
  membersCount,
}: {
  title: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  isGroup: boolean;
  membersCount: number;
}) {
  const navigate = useNavigate();

  const formatLastSeen = function (lastSeen: string) {
    const date = new Date(lastSeen);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `at ${time}`;
    if (isYesterday) return `yesterday at ${time}`;

    return (
      date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + ` at ${time}`
    );
  };
  return (
    <div className="bg-gray-0 flex items-center  gap-4 border-b  border-solid border-gray-200 shadow-sm px-4 py-2 w-full sm:px-6 sm:py-3">
      <button
        className="rounded-full p-1 text-gray-800 hover:bg-gray-100 flex items-center justify-center sm:hidden"
        onClick={() => navigate("/chat")}
      >
        <HiOutlineChevronLeft className="w-6 h-6" />
      </button>
      <Link to="settings" className="flex gap-4">
        <Avatar src={avatar} />
        <div className="self-start">
          <h4 className="text-lg font-semibold text-gray-900 ">{title}</h4>
          <p
            className={`text-gray-500 font-normal 
            ${isOnline ? "text-green-700 font-medium" : ""} `}
          >
            {!isGroup ? (
              <p
                className={`text-gray-500 font-normal ${
                  isOnline ? "text-green-700 font-medium" : ""
                }`}
              >
                {isOnline ? "online" : `last seen ${formatLastSeen(lastSeen)}`}
              </p>
            ) : (
              <p className="text-gray-500 font-medium">
                {membersCount} Member{membersCount > 1 && "s"}
              </p>
            )}
          </p>
        </div>
      </Link>
    </div>
  );
}

export default ChatHeader;
