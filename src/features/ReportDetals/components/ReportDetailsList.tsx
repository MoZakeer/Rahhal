import ReportDetailItem from "./ReportDetailItem";
import { normalizeMediaUrl } from "../../../features/post/components/services/posts.api";
import { useReportDetails } from "../hooks/useReportDetails";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Props {
  type: string;
  id: string;
}

function ReportDetailSkeleton() {
  return (
    <div className="flex gap-3 items-start dark:opacity-60 transition-opacity">
      <Skeleton circle width={40} height={40} />

      <div className="space-y-2 dark:opacity-60 transition-opacity">
        <Skeleton width={140} height={16} />
        <Skeleton width={100} height={12} />
        <Skeleton count={2} />
      </div>
    </div>
  );
}

export default function ReportDetailsList({ type, id }: Props) {
  const { data: reports, isLoading, isError } = useReportDetails(type, id);

  if (isError) return <div>Error loading reports</div>;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-500">
        {isLoading ? (
          <Skeleton width={180} />
        ) : (
          `Report Details (${reports?.length || 0} Reports)`
        )}
      </h2>

      {isLoading
        ? Array(2)
          .fill(0)
          .map((_, i) => <ReportDetailSkeleton key={i} />)
        : reports?.map((report) => (
          <ReportDetailItem
            key={report.reportId}
            name={report.reporterUserName || "Anonymous User"}
            username={
              report.reporterUserName
                ? `@${report.reporterUserName}`
                : ""
            }
            type={report.type || "unknown"}
            time={new Date(report.createdDate).toLocaleString()}
            comment={report.description || "No comment provided"}
            avatar={
              report.reporterPicture
                ? normalizeMediaUrl(report.reporterPicture)
                : undefined
            }
          />
        ))}
    </div>
  );
}