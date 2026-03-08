
type Props = {
  caption: string;
  onChange: (value: string) => void;
  maxChars: number;
  placeholder?: string;
};

export default function PostCaption({
  caption,
  onChange,
  maxChars,
  placeholder,
}: Props) {


  const remaining = maxChars - caption.length;
  const warning = remaining <= 50;

  return (
    <div className="flex flex-col gap-2 relative w-full">
      <div className="relative">
        <textarea
          value={caption}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxChars}
          placeholder={placeholder}
          rows={5}
          className="
            w-full
            resize-none
            bg-gray-50
            rounded-xl
            px-4
            py-3
            border border-gray-100
            text-sm
            text-gray-800
            placeholder:text-gray-400
            outline-none
            focus:ring-2
            focus:ring-[var(--color-primary-500)]
          "
        />


      </div>

      <div
        className={`text-right text-xs ${warning ? "text-red-500" : "text-gray-400"}`}
      >
        {caption.length}/{maxChars}
      </div>


    </div>
  );
}
