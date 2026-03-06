import Avatar from "./Avatar";
import { HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";
import type { Participant } from "../types/chatDetails.type";
import { conversationImage } from "../../../utils/helper";
import { useRemoveParticipant } from "../hooks/useRemoveParticipant";
import { useParams } from "react-router";
import { useUser } from "../../../context/UserContext";
type Props = {
  type?: "request" | "member";
  participant: Participant;
  isAdmin: boolean;
};
function Member({ type = "member", participant, isAdmin }: Props) {
  const { conversationId } = useParams<{ conversationId: string }>();
  const {
    user: { userId },
  } = useUser();
  const { isPending, removeParticipant } = useRemoveParticipant({
    profileId: participant?.profileId,
    conversationId: conversationId || "",
  });

  return (
    <li className="flex items-center justify-between py-2">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3 flex-1 rounded-lg px-2 py-2 transition hover:bg-gray-50">
        <Avatar
          src={conversationImage({
            isGroup: false,
            otherUserProfilePicture: participant?.profilePicture,
          })}
        />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {participant?.userName}
            </h4>
          </div>

          <p className="text-xs text-gray-500 truncate">
            {participant.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-3">
        {isAdmin && userId !== participant?.profileId && (
          <>
            {type === "member" ? (
              <button
                className="text-xs text-red-500 hover:text-red-600 transition cursor-pointer"
                disabled={isPending}
                onClick={() => removeParticipant()}
              >
                Remove
              </button>
            ) : (
              <>
                <button className="p-1 rounded-md text-green-600 hover:bg-green-50 transition cursor-pointer">
                  <HiOutlineCheck className="w-4 h-4" />
                </button>

                <button className="p-1 rounded-md text-red-600 hover:bg-red-50 transition cursor-pointer">
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </li>
  );
}

export default Member;
