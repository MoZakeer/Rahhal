type Props = {
  name?: string;
};

function TypingIndicator({ name }: Props) {
  return (
    <li className="flex w-full justify-end">
      <div
        className="
          px-2 py-1
          rounded-tr-lg rounded-bl-lg
          bg-gray-0
          shadow-md
          max-w-fit
        "
      >
        {name && (
          <p className="text-[11px] text-primary-600 font-medium mb-1">
            {name}
          </p>
        )}

        <div className="flex items-center gap-1 px-3 py-2">
          <span
            className="
              w-2 h-2 rounded-full bg-primary-700
              animate-bounce
            "
          />

          <span
            className="
              w-2 h-2 rounded-full bg-primary-700
              animate-bounce
              [animation-delay:0.15s]
            "
          />

          <span
            className="
              w-2 h-2 rounded-full bg-primary-700
              animate-bounce
              [animation-delay:0.3s]
            "
          />
        </div>
      </div>
    </li>
  );
}

export default TypingIndicator;
