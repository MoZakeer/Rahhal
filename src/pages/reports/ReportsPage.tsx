import { useParams } from "react-router-dom";
import { ReportList } from "../../features/reports/components/ReportList";
import type { ReportType } from "../../features/reports/types";
import { ReportTabs } from "../../features/reports/components/ReportTabs";
export const ReportsPage = () => {
  const { type } = useParams();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ReportTabs ></ReportTabs>

      <h1 className="text-2xl font-bold mb-6">Report Queue</h1>

      <ReportList type={type as ReportType} />
    </div>
  );
};