import { HiOutlineCamera } from "react-icons/hi2";

function SettingAvatar({
  avatar,
  isEditing,
  onImageChange,
}: {
  avatar: string;
  isEditing: boolean;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex justify-center">
      <div
        className={`relative group transition ${
          !isEditing ? "pointer-events-none opacity-80" : ""
        }`}
      >
        <img
          src={avatar}
          className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md ring-4 ring-gray-100"
        />

        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center cursor-pointer transition"
        >
          <HiOutlineCamera className="text-white w-6 h-6" />
        </label>

        <input
          id="avatar-upload"
          type="file"
          hidden
          accept="image/*"
          onChange={onImageChange}
        />
      </div>
    </div>
  );
}
export default SettingAvatar;
