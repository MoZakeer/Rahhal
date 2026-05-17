import Avatar from "./Avatar";
import type { Participant } from "../types/chatDetails.type";
import { conversationImage } from "../../../utils/helper";
import { useRemoveParticipant } from "../hooks/useRemoveParticipant";
import { Link, useParams } from "react-router";
import { useUser } from "../../../context/UserContext";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

type Props = {
  participant: Participant;
  isAdmin: boolean;
};

function Member({ participant, isAdmin }: Props) {
  const { conversationId } = useParams<{ conversationId: string }>();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const {
    user: { userId },
  } = useUser();

  const { isPending, removeParticipant } = useRemoveParticipant({
    profileId: participant?.profileId,
    conversationId: conversationId || "",
  });

  const handleRemoveParticipant = async () => {
    await removeParticipant();
    setIsOpen(false);
  };

  return (
    <li className="flex items-center justify-between py-2">
      {/* LEFT SIDE */}
      <Link to={`/profile/${participant.profileId}`} className="w-100">
        <div className="flex items-center gap-3 flex-1 rounded-lg px-2 py-2 transition hover:bg-gray-50">
          <Avatar
            src={conversationImage({
              isGroup: false,
              otherUserProfilePicture: participant?.profilePicture,
            })}
          />

          <div className="flex flex-col min-w-0">
            {/* NAME + ADMIN BADGE */}
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {participant?.userName}
              </h4>

              {participant.isAdmin && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium whitespace-nowrap">
                  Admin
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            <p className="text-xs text-gray-500 truncate">
              {participant.description}
            </p>
          </div>
        </div>
      </Link>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 ml-3">
        {isAdmin && userId !== participant?.profileId && (
          <button
            className="text-xs text-red-500 hover:text-red-600 transition cursor-pointer disabled:opacity-50"
            disabled={isPending}
            onClick={() => setIsOpen(true)}
          >
            Remove
          </button>
        )}
      </div>

      <ConfirmDialog
        title="Remove Participant"
        subTitle={
          <>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-gray-700">
              {participant.userName}
            </span>{" "}
            from the group?
          </>
        }
        isPending={isPending}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleRemoveParticipant}
      />
    </li>
  );
}

export default Member;
