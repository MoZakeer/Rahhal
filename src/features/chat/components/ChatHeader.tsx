import { Link, useNavigate } from "react-router";
import Avatar from "./Avatar";
import { HiOutlineChevronLeft } from "react-icons/hi2";

function ChatHeader({ title, avatar }: { title: string; avatar: string }) {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-0 flex items-center  gap-4 border-b  border-solid border-gray-200 shadow-sm px-4 py-2 w-full sm:px-6 sm:py-3">
      <button
        className="rounded-full p-1 text-gray-800 hover:bg-gray-100 flex items-center justify-center sm:hidden"
        onClick={() => navigate(-1)}
      >
        <HiOutlineChevronLeft className="w-6 h-6" />
      </button>
      <Link to="settings" className="flex gap-4">
        <Avatar src={avatar} />
        <div className="self-start">
          <h4 className="text-lg font-semibold ">{title}</h4>
          {/* <p
            className={`text-gray-500 font-normal 
            ${isOnline ? "text-green-700 font-medium" : ""} `}
          >
            {isOnline ? "online" : "last seen at 12:14 pm"}
          </p> */}
        </div>
      </Link>
    </div>
  );
}

export default ChatHeader;
