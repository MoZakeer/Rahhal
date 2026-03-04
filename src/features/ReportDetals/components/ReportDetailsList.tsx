import { useReportDetails } from "../hooks/useReportDetails";
import ReportDetailItem from "./ReportDetailItem";
import { normalizeMediaUrl } from "../../../features/post/components/services/posts.api";

interface Props {
  type: string;
  id: string;
}

export default function ReportDetailsList({ type, id }: Props) {
  const { data, isLoading, isError } = useReportDetails(type, id);

  if (isLoading) return <div>Loading reports...</div>;
  if (isError) return <div>Error loading reports</div>;

  
  let reports: any[] = [];
  if (type === "posts") {
    reports = data?.data?.reportInfo ?? [];
  } else if (type === "comments" || type === "users") {
    reports = data?.data?.items ?? [];
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">
        Report Details ({reports.length} Reports)
      </h2>

      {reports.map((report: any) => (
        <ReportDetailItem
          key={report.reportId}
          name={report.reporterUserName || "Anonymous User"}
          username={report.reporterUserName ? `@${report.reporterUserName}` : ""}
          type={report.type}
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