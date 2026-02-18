import { useRef, useState } from "react";
import { HiOutlineCheck, HiOutlinePencil } from "react-icons/hi2";
type Props = {
  label?: string;
  value: string;
  setValue: (value: string) => void;
  textClass?: string;
};
function EditInput({ label, value, setValue, textClass = "" }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  function startEdit() {
    setIsEditing(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function finishEdit() {
    setIsEditing(false);
    // api calling..
  }

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium text-gray-400 uppercase">
          {label}
        </span>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          value={value}
          disabled={!isEditing}
          onChange={(e) => setValue(e.target.value)}
          onBlur={finishEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") finishEdit();
            if (e.key === "Escape") setIsEditing(false);
          }}
          className={`
            bg-transparent w-full outline-none
            transition-all duration-200
            ${textClass}
            ${
              isEditing
                ? "border-b border-primary-500 pb-0.5"
                : "border-b border-transparent"
            }
          `}
        />

        <button
          onClick={isEditing ? finishEdit : startEdit}
          className="text-primary-600 hover:text-primary-700 transition duration-300 cursor-pointer"
        >
          {isEditing ? (
            <HiOutlineCheck className="w-5 h-5" />
          ) : (
            <HiOutlinePencil className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default EditInput;
