import { UserX} from "lucide-react";
interface BanUserButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const BanUserButton = ({ onClick, disabled }: BanUserButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 text-white text-sm hover:bg-red-700 transition ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    <UserX size={16} />
    Ban User
  </button>
);