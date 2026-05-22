import { HiOutlineFaceSmile } from "react-icons/hi2";

type Props = {
  isSend: boolean;
  onClick: () => void;
};

function MessageReactionTrigger({ isSend, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        absolute top-1/2 -translate-y-1/2
        ${isSend ? "-right-8" : "-left-8"}

        opacity-0
        group-hover:opacity-100

        transition-all duration-200
        
        rounded-full
        flex items-center justify-center
        z-30
      `}
    >
      <HiOutlineFaceSmile className="w-6 h-6 text-lg text-gray-800 " />
    </button>
  );
}

export default MessageReactionTrigger;
