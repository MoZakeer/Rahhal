type PostUserProps = {
  name?: string;
  username?: string;
  avatar?: string;
};

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

export default function PostUser({ name, username, avatar }: PostUserProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition">
      <img
        src={avatar || DEFAULT_AVATAR}
        alt={name}
        className="w-11 h-11 rounded-full object-cover"
      />

      <div className="leading-tight">
        <h1 className="font-medium text-sm text-gray-900">{name}</h1>
        <p className="text-xs text-gray-400">@{username}</p>
      </div>
    </div>
  );
}

