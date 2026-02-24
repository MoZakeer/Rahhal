import Member from "./Member";

function GroupRequests() {
  return (
    <div className="space-y-6">
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        Join Requests (4)
      </p>

      <ul className="space-y-3">
        <Member  type="request" />
      </ul>
    </div>
  );
}

export default GroupRequests;
