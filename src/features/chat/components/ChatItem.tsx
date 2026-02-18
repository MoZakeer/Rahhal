import { NavLink } from "react-router";
import Avatar from "./Avatar";

function ChatItem() {
  return (
    <NavLink
      to={`/chat/${1}`}
      className={({ isActive }) =>
        `flex items-center gap-2  px-4 py-2.5 rounded-lg cursor-pointer   transition-all duration-300 hover:bg-gray-100  active:bg-gray-100 ${isActive && "bg-gray-100"} `
      }
    >
      <Avatar src="/profile.jpg" />
      <div className="flex flex-col">
        <h4 className="text-xl font-medium">Mohamed Abdelnaser</h4>
        <p className="whitespace-nowrap overflow-hidden text-ellipsis text-gray-500 w-64 sm:w-56">
          Hello ahmed kdjald adklfjalksdj lasdkfja;lskd asldkfja;klsdj
        </p>
      </div>
      <p className="bg-primary-600  px-2 py rounded-full font-medium text-primary-50  ml-auto">
        4
      </p>
    </NavLink>
  );
}

export default ChatItem;
