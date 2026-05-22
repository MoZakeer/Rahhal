import { Link, useNavigate } from "react-router"; // (أو react-router-dom)
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

    const time = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `today at ${time}`;
    if (isYesterday) return `yesterday at ${time}`;

    return (
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }) + ` at ${time}`
    );
  };

  return (
    <div className="shrink-0 bg-gray-0 flex items-center gap-2 md:gap-4 border-b border-solid border-gray-200 shadow-sm px-2 py-2 w-full sm:px-6 sm:py-3">
      <button
        className="shrink-0 rounded-full p-1 text-gray-800 hover:bg-gray-100 flex items-center justify-center"
        onClick={() =>
          navigate("/chat", {
            replace: true,
          })
        }
      >
        <HiOutlineChevronLeft className="w-6 h-6" />
      </button>

      <Link
        to="settings"
        className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0"
      >
        <Avatar src={avatar} />

        <div className="flex flex-col flex-1 min-w-0">
          <h4
            className="text-lg font-semibold text-gray-900 truncate"
            title={title} // إضافة حلوة عشان لو وقف بالماوس يظهرله الاسم كامل
          >
            {title}
          </h4>
          {!isGroup ? (
            <p
              className={`text-sm font-normal truncate ${
                isOnline ? "text-green-700 font-medium" : "text-gray-500"
              }`}
            >
              {isOnline ? "online" : `last seen ${formatLastSeen(lastSeen)}`}
            </p>
          ) : (
            <p className="text-sm text-gray-500 font-medium truncate">
              {membersCount} Member{membersCount > 1 && "s"}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

export default ChatHeader;
