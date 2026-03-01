import { useState, useMemo } from "react";
import type { ReportType } from "../types";
import { useReports } from "../hooks/useReports";
import { CommentReportCard } from "./CommentReportCard";
import { PostReportCard } from "./PostReportCard";
import { UserReportCard } from "./UserReportCard";
import Spinner from "../../../shared/components/Spinner";

interface Props {
  type: ReportType;
}

export const ReportList = ({ type }: Props) => {
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading } = useReports(type, 0, 10000); // Fetch all for sorting

  const sortedReports = useMemo(() => {
    return [...(data?.items ?? [])].sort((a, b) =>
      sortDesc
        ? b.countReports - a.countReports
        : a.countReports - b.countReports
    );
  }, [data, sortDesc]);

if (isLoading && !data) return <Spinner />;;

  return (
    <div className="space-y-4">
      {/* Sort Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setSortDesc((prev) => !prev)}
          className="border border-gray-300 px-2 py-1 rounded-lg text-gray-600 text-sm hover:bg-gray-100"
        >
          Sort {sortDesc ? "↓" : "↑"}
        </button>
      </div>

      {/* Render based on type */}
      {sortedReports.map((report) => {
        switch (type) {
          case "comments":
            return (
              <CommentReportCard
                key={report.commentId}
                report={report}
              />
            );

          case "posts":
            return (
              <PostReportCard
                key={report.id}
                report={report}
              />
            );

          case "users":
            return (
              <UserReportCard
                key={report.reportedUserId}
                report={report}
              />
            );

          default:
            return null;
        }
      })}

      
    </div>
  );
};