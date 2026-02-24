import SettingAvatar from "./SettingAvatar";
import EditInput from "./EditInput";
import { useState } from "react";

function SettingInfo() {
  const [name, setName] = useState("Mohamed Abdelnaser");
  const [description, setDescription] = useState(
    "Frontend developer & chat app enthusiast",
  );

  return (
    <div
      className="
        bg-gray-0 w-full max-w-md sm:max-w-xl
        flex flex-col items-center gap-6 px-6 py-6 "
    >
      <SettingAvatar />

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
