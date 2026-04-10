import { useParams } from "react-router-dom";
import { ReportList } from "../../features/reports/components/ReportList";
import type { ReportType } from "../../features/reports/types";
import { ReportTabs } from "../../features/reports/components/ReportTabs";

export const ReportsPage = () => {
  const { type } = useParams();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Report Queue
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Review and manage reported content to maintain platform safety.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Tabs Header Area */}
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
            <ReportTabs />
          </div>

          {/* List Area */}
          <div className="p-6">
            <ReportList type={type as ReportType} />
          </div>
        </div>
      </div>
    </main>
  );
};