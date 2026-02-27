import type { CommentReport } from "../types";

interface Props {
  report: CommentReport;
}

export const UserReportCard = ({ report }: Props) => {
  return (
    <div className="bg-white shadow-sm rounded-xl p-5 flex justify-between items-center border">
      <div>
        <h3 className="font-semibold text-lg">
          Comment by {report.commentAuthorUserName}
        </h3>

        <p className="text-gray-600 mt-2 line-clamp-2">
          {report.commentContent}
        </p>

        <span className="text-sm text-red-500 mt-2 inline-block">
          {report.countReports} Reports
        </span>
      </div>

      <div className="flex gap-3">
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