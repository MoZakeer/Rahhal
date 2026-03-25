import { useMemo, useState } from "react";
import { HiOutlineUser, HiOutlineDocumentText } from "react-icons/hi2";
import SettingAvatar from "./SettingAvatar";
import { useEditChatSettings } from "../hooks/useEditChatSettings";
import { useParams } from "react-router";

export default function ChatSettingsInfo({
  chatInfo,
}: {
  chatInfo: {
    name: string;
    description: string;
    isGroup: boolean;
    avatar: string;
  };
}) {
  const [name, setName] = useState(chatInfo.name);
  const [description, setDescription] = useState(chatInfo.description);
  const [avatar, setAvatar] = useState(chatInfo.avatar);
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { isPending, editChatSetting } = useEditChatSettings();
  const { conversationId } = useParams<{ conversationId: string }>();

  const [initialData, setInitialData] = useState({
    name: chatInfo.name,
    description: chatInfo.description,
  });

  const isChanged = useMemo(() => {
    return name !== initialData.name || description !== initialData.description;
  }, [name, description, initialData]);

  function handleImageChange(e: React.ChangeEvent) {
    const selectedFile = (e.target as HTMLInputElement).files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    setAvatar(preview);
  }

  function handleSave() {
    setInitialData({ name, description });
    setIsEditing(false);
    editChatSetting({
      conversationId: conversationId || "",
      name,
      description,
      avatar: file,
    });
  }

  function handleCancel() {
    setName(initialData.name);
    setDescription(initialData.description);
    setIsEditing(false);
  }

  return (
    <div className="w-full max-w-md   flex flex-col gap-6">
      <SettingAvatar
        avatar={avatar}
        isEditing={isEditing}
        onImageChange={handleImageChange}
      />

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase flex items-center gap-1">
          <HiOutlineUser className="w-4 h-4" /> Chat Name
        </label>
        <input
          disabled={!isEditing}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`
              w-full px-4 py-2.5 rounded-xl border text-sm
              outline-none transition-all duration-200
              ${
                isEditing
                  ? "border-primary-500 bg-white focus:ring-2 focus:ring-primary-100"
                  : "border-transparent bg-gray-100 text-gray-500 cursor-not-allowed"
              }
            `}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase flex items-center gap-1">
          <HiOutlineDocumentText className="w-4 h-4" /> Description
        </label>
        <textarea
          disabled={!isEditing}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`
              w-full px-4 py-2.5 rounded-xl border text-sm resize-none
              outline-none transition-all duration-200
              ${
                isEditing
                  ? "border-primary-500 bg-white focus:ring-2 focus:ring-primary-100"
                  : "border-transparent bg-gray-100 text-gray-500 cursor-not-allowed"
              }
            `}
        />
        {isEditing && (
          <span className="text-xs text-gray-400 text-right">
            {description.length} / 120
          </span>
        )}
      </div>
      {chatInfo.isGroup && (
        <div className="flex gap-3 pt-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3 rounded-xl text-sm font-medium border border-primary-500 text-primary-600 hover:bg-primary-50 transition"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={!isChanged || isPending}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition
                ${
                  isChanged
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Save Changes
              </button>

              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
