import { LuSendHorizontal } from "react-icons/lu";

function MessageInput() {
  return (
    <div className="bg-gray-50 px-3 py-4 sm:pt-6 sm:pb-8 sm:px-15 ">
      <form className="flex gap-6 ">
        <input
          placeholder="Type a message..."
          className="w-full border border-solid border-gray-200 outline-none bg-gray-0 px-6 py-3 rounded-full"
        />
        <button className="bg-primary-600 px-2.5 py-2 rounded-full cursor-pointer ">
          <LuSendHorizontal className="w-8 h-8 aspect-square text-primary-50 " />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
