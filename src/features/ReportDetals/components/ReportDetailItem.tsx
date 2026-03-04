type Props = {
  name: string;
  username?: string;
  type: string;
  time: string;
  comment: string;
  avatar?: string;
};
const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

export default function ReportDetailItem({
  name,
  username,
  type,
  time,
  comment,
  avatar,
}: Props) {
  return (
    <div className="rounded-2xl p-6 shadow-sm space-y-3 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <img
              src={avatar && avatar.trim() !== "" ? avatar : DEFAULT_AVATAR}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
          </div>

          
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-800 flex gap-1 items-center">
              {name}
              {username && (
                <span className="text-gray-400 text-xs">{username}</span>
              )}
            </p>

            <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 mt-1">
              {type}
            </span>
          </div>
        </div>

        <span className="text-xs text-gray-400 whitespace-nowrap">
          {new Date(time).toLocaleString()}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        {comment || "No comment provided"}
      </p>
    </div>
  );
}