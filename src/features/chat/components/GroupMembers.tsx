import Member from "./Member";
function GroupMembers() {
  return (
    <div className="space-y-6">
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        Members (10)
      </p>

      <ul className="space-y-3">
        <Member type="member" />
        <Member type="member" />
      </ul>
    </div>
  );
}

export default GroupMembers;
