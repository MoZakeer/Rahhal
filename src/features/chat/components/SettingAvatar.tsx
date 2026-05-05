import { HiOutlineCamera } from "react-icons/hi2";

function SettingAvatar({
  avatar,
  isEditing,
  onImageChange,
  onDeleteImage,
  hasRealAvatar,
  isAdmin,
}: {
  avatar: string;
  isEditing: boolean;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: () => void;
  hasRealAvatar: boolean;
  isAdmin: boolean;
}) {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-3">
        {/* Avatar */}
        <div
          className={`relative group transition ${
            !isEditing ? "pointer-events-none opacity-80" : ""
          }`}
        >
          <img
            src={avatar}
            alt="chat-avatar"
            className="w-36 h-36 rounded-full object-cover border-4 border-gray-0 shadow-md ring-4 ring-gray-100"
          />

          {/* Upload Overlay */}
          {isEditing && (
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center cursor-pointer transition"
            >
              <HiOutlineCamera className="text-white w-6 h-6" />
            </label>
          )}

          {/* Hidden Input */}
          <input
            id="avatar-upload"
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              onImageChange(e);
              e.target.value = "";    
            }}
          />
        </div>

        {/* Remove Image Button */}
        {isEditing && isAdmin && hasRealAvatar && (
          <button
            type="button"
            onClick={onDeleteImage}
            className="
              text-sm font-medium
              text-red-500
              hover:text-red-600
              hover:underline
              transition
            "
          >
            Remove image
          </button>
        )}
      </div>
    </div>
  );
}

export default SettingAvatar;
