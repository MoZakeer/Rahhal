function LeaveGroup() {
  return (
    <div className="pt-4 border-t border-gray-200 space-y-4">
      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        Danger Zone
      </p>

      <button className="text-red-600 text-sm font-medium hover:underline cursor-pointer hover:text-red-700 outline-none">
        Leave group
      </button>
    </div>
  );
}

export default LeaveGroup;
