import { useParams } from "react-router";
import { useLeavGroup } from "../hooks/useLeaveGroup";
import { useUser } from "@/context/UserContext";
import ConfirmDialog from "./ConfirmDialog";
import { useState } from "react";

function LeaveGroup({ title }: { title: string | undefined }) {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [confirmLeave, setConfirmLeave] = useState<boolean>(false);
  const {
    user: { userId: profileId },
  } = useUser();
  const { isPending, leaveGroup } = useLeavGroup({
    conversationId: conversationId || "",
    profileId,
  });
  function handleLeaveGroup() {
    leaveGroup(undefined, {
      onSuccess: () => {
        setConfirmLeave(false);
      },
    });
  }
  return (
    <div className="pt-4 border-t border-gray-200 space-y-4">
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        Danger Zone
      </p>

      <button
        className="text-red-600 text-sm font-medium hover:underline cursor-pointer hover:text-red-700 outline-none disabled:text-red-700 disabled:cursor-not-allowed"
        disabled={isPending}
        onClick={() => setConfirmLeave(true)}
      >
        Leave group
      </button>

      <ConfirmDialog
        open={confirmLeave}
        title="Leave Group"
        subTitle={`Are you sure you want to leave ${title} Trip?`}
        confirmText="Leave"
        isPending={isPending}
        onClose={() => setConfirmLeave(false)}
        onConfirm={handleLeaveGroup}
      />
    </div>
  );
}

export default LeaveGroup;
