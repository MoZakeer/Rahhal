import type { Participant } from "../types/chatDetails.type";
import Member from "./Member";
function GroupMembers({
  participants,
  isAdmin,
}: {
  participants: Participant[];
  isAdmin: boolean;
}) {
  return (
    <div className="space-y-6">
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        Members (10)
      </p>

      <ul className="space-y-3">
        {participants.map((participant) => (
          <Member
            key={participant.profileId}
            participant={participant}
            isAdmin={isAdmin}
          />
        ))}
      </ul>
    </div>
  );
}

export default GroupMembers;
