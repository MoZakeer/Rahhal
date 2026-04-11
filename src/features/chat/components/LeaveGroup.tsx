import { useParams } from "react-router";
import { useLeavGroup } from "../hooks/useLeaveGroup";
import { useUser } from "@/context/UserContext";

function LeaveGroup() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const {
    user: { userId: profileId },
  } = useUser();
  const { isPending, leaveGroup } = useLeavGroup({
    conversationId: conversationId || "",
    profileId,
  });
  return (
    <div className="pt-4 border-t border-gray-200 space-y-4">
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        Danger Zone
      </p>

      <button
        className="text-red-600 text-sm font-medium hover:underline cursor-pointer hover:text-red-700 outline-none disabled:text-red-700 disabled:cursor-not-allowed"
        disabled={isPending}
        onClick={() => leaveGroup()}
      >
        Leave group
      </button>
    </div>
  );
}

export default LeaveGroup;
