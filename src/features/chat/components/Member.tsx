import { Link } from "react-router";
import Avatar from "./Avatar";
import { HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";
type Props = {
  type: "request" | "member";
};
function Member({ type = "member" }: Props) {
  return (
    <li className="flex items-center justify-between py-2">
      {/* LEFT SIDE */}
      <Link
        to={`/chat/${1}`}
        className="flex items-center gap-3 flex-1 rounded-lg px-2 py-2 transition hover:bg-gray-50"
      >
        <Avatar src="/profile.jpg" />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              Mohamed Abdelnaser
            </h4>
          </div>

          <p className="text-xs text-gray-500 truncate">
            hello ahmed kdjald adklfjalksdj...
          </p>
        </div>
      </Link>

      {/* ACTIONS (شكل ثابت حالياً) */}
      <div className="flex items-center gap-2 ml-3">
        {type === "member" ? (
          <button className="text-xs text-red-500 hover:text-red-600 transition cursor-pointer">
            Remove
          </button>
        ) : (
          <>
            <button className="p-1 rounded-md text-green-600 hover:bg-green-50 transition cursor-pointer">
              <HiOutlineCheck className="w-4 h-4" />
            </button>

            <button className="p-1 rounded-md text-red-600 hover:bg-red-50 transition cursor-pointer">
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default Member;
