import Message from "./Message";

function MessageList() {
  return (
    <div className="flex-1 overflow-y-auto">
      <ul className="flex flex-col gap-5 px-3 py-4 sm:py-6 sm:px-10">
        <Message type="send" time="12:23">
          Hello Mohamed Abdelnaser
        </Message>
        <Message type="receive" time="11:11" name="Mohamed abdelnaser">
          Hello Mahmoud Abdelrazek
        </Message>
      </ul>
    </div>
  );
}

export default MessageList;
