import SettingAvatar from "./SettingAvatar";
import EditInput from "./EditInput";
import { useState } from "react";

function SettingInfo({
  info,
}: {
  info: {
    title: string;
    description: string;
    avatar: string;
  };
}) {
  const [name, setName] = useState(info?.title);
  const [description, setDescription] = useState(info?.description);

  return (
    <div
      className="
        bg-gray-0 w-full max-w-md sm:max-w-xl
        flex flex-col items-center gap-6 px-6 py-6 "
    >
      <SettingAvatar avatar={info?.avatar} />

      <EditInput
        label="Chat name"
        value={name}
        setValue={setName}
        textClass="text-2xl font-semibold"
      />

      <EditInput
        label="Description"
        value={description}
        setValue={setDescription}
        textClass="text-sm text-gray-500"
      />
    </div>
  );
}

export default SettingInfo;
