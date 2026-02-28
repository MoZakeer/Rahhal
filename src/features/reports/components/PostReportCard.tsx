import type { PostReport } from "../types";

interface Props {
  report: PostReport;
}

export const PostReportCard = ({ report }: Props) => {
  const mediaList = report.mediaUrLs ?? [];
  return (
    <div className="bg-white shadow-sm rounded-xl p-5 border flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <img
          src={report.profileUrl || "/default-avatar.png"}
          alt="profile"
          className="w-12 h-12 rounded-full object-cover"
        />

        <div>
          <h3 className="font-semibold text-lg">
            {report.userName}
          </h3>

          <p className="text-sm text-gray-500">
            {new Date(report.createdDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 line-clamp-2">
        {report.description}
      </p>

      {/* Media Preview */}
     {mediaList.length > 0 && (
  <div className="grid grid-cols-3 gap-2">
    {mediaList.map((media) => (
      <img
        key={media.id}
        src={media.url}
        alt="post media"
        className="w-full h-24 object-cover rounded-lg"
      />
    ))}
  </div>
)}

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span> {report.likes} likes</span>
        <span> {report.comments} comments</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button className="text-gray-500 hover:text-black">
          Dismiss
        </button>

        <button className="bg-black text-white px-4 py-2 rounded-lg">
          Review Case
        </button>
      </div>
    </div>
  );
};