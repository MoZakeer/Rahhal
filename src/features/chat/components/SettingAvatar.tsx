import { HiOutlinePencilSquare } from "react-icons/hi2";

function SettingAvatar() {
  return (
    <div className="relative w-fit">
      <img
        src="/profile.jpg"
        alt="chat avatar"
        className="w-32 h-32 aspect-square rounded-full border-4 border-solid border-gray-100"
      />
      <input type="file" hidden id="change-avatar" />
      <label
        htmlFor="change-avatar"
        className="absolute right-0 bottom-1.5
    bg-gray-0 border border-primary-200
    p-1.5 rounded-full cursor-pointer
    flex items-center justify-center
    shadow-sm
    hover:bg-primary-50"
      >
        <HiOutlinePencilSquare className="w-5 h-5 aspect-square text-primary-600 " />
      </label>
    </div>
  );
}

export default SettingAvatar;
