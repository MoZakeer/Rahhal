import { UserX } from "lucide-react";

export default function BanUserButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 text-white text-sm hover:bg-red-700 transition"
    >
      <UserX size={16} />
      Ban User
    </button>
  );
}