import type { PostReport } from "../types";
import { normalizeMediaUrl } from "../../post/components/services/posts.api";
import { useNavigate } from "react-router-dom";

interface Props {
  report: PostReport;
}

export const PostReportCard = ({ report }: Props) => {
  const mediaList = report.mediaUrLs ?? [];
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={
                normalizeMediaUrl(report.profileUrl) ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  report.userName
                )}`
              }
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
              <h3 className="font-semibold text-gray-600">
                {report.userName}
              </h3>

              <p className="text-sm text-gray-500">
                {new Date(report.createdDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 wrap-break-word line-clamp-2 bg-gray-100 rounded-lg p-2">
            {report.description}
          </p>

          {/* Media Preview */}
          {mediaList.length >= 1 && (
            <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  className="relative h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition opacity-80 hover:opacity-100"
                >
                  <img
                    src={normalizeMediaUrl(m.url)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 text-sm text-gray-600">
            <span>{report.likes} likes</span>
            <span>{report.comments} comments</span>
          </div>
        </div>

        {/*  Actions */}
        <div className="flex flex-col justify-center items-end">
          <div className="text-right">
            <span className="text-sm text-gray-500 block">impact</span>
        <span className="text-sm font-bold text-gray-700 mb-4  inline-block">
              {report.countReports} Reports
            </span>
          </div>

          <button             onClick={() => navigate(`/report_details/${report.id}?type=posts`)}
        className="px-2 py-1 rounded-lg border border-gray-500 text-gray-700 hover:border-black hover:text-black transition">
            Review Case
          </button>
        </div>

      </div>
    </div>
  );
};