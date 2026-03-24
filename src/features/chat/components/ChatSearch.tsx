function ChatSearch({ onSearch }: { onSearch: (value: string) => void }) {
  return (
    <form>
      <input
        onChange={(e) => onSearch(e.target.value)}
        className="px-6 py-3 bg-gray-50 text-gray-800 w- outline-none w-full  border border-solid border-gray-300 rounded-full"
        placeholder="Search... "
      />
    </form>
  );
}

export default ChatSearch;
