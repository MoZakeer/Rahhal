import { useState, useMemo } from "react";
import type { ReportType } from "../types";
import { useReports } from "../hooks/useReports";
import { CommentReportCard } from "./CommentReportCard";
import { PostReportCard } from "./PostReportCard";
import { UserReportCard } from "./UserReportCard";

interface Props {
  type: ReportType;
}

export const ReportList = ({ type }: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading } = useReports(type, pageIndex, 10);

  const sortedReports = useMemo(() => {
    return [...(data?.items ?? [])].sort((a, b) =>
      sortDesc
        ? b.countReports - a.countReports
        : a.countReports - b.countReports
    );
  }, [data, sortDesc]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Sort Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setSortDesc((prev) => !prev)}
          className="border px-4 py-2 rounded-lg"
        >
          Sort by Reports {sortDesc ? "↓" : "↑"}
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
                key={report.postId}
                report={report}
              />
            );

          case "users":
            return (
              <UserReportCard
                key={report.userId}
                report={report}
              />
            );

          default:
            return null;
        }
      })}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={pageIndex === 0}
          onClick={() => setPageIndex((prev) => prev - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {pageIndex + 1} of {data?.pages ?? 1}
        </span>

        <button
          disabled={pageIndex + 1 >= (data?.pages ?? 0)}
          onClick={() => setPageIndex((prev) => prev + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};