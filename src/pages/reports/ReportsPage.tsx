import { useParams } from "react-router-dom";
import { ReportList } from "../../features/reports/components/ReportList";
import type { ReportType } from "../../features/reports/types";
import { ReportTabs } from "../../features/reports/components/ReportTabs";
export const ReportsPage = () => {
  const { type } = useParams();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl text-gray-700 font-bold mb-3">Report Queue</h1>
            <p className=" text-gray-500  mb-6">Review and manage reported content to maintain platform safety.</p>

      <ReportTabs ></ReportTabs>


      <ReportList type={type as ReportType} />
    </div>
  );
};