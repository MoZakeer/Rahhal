import { useState } from "react";
import { useUserDetails } from "../hooks/useUserDetails";
import { useUserProfile } from "../hooks/useUserProfile";
import { normalizeMediaUrl } from "../../../features/post/components/services/posts.api";
import { usePageTitle } from "@/hooks/usePageTitle";

interface Props {
  id: string;
}

interface ReportAttachment {
  id: string;
  url: string;
}

interface ReportItem {
  reportId: string;
  messageContent: string;
  attachments?: ReportAttachment[];
}

export default function UserReportsCard({ id }: Props) {
  usePageTitle("Reported User Details");

  const { data: reportsData } = useUserDetails(id);
  const { data: profileData } = useUserProfile(id);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

  const user = profileData?.data;
  const reports: ReportItem[] = reportsData?.data?.items ?? [];

  if (reports.length === 0) return null;

  return (
    <>
      {/* Main Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 transition-colors ">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <img
              src={normalizeMediaUrl(user?.profilePicture) || DEFAULT_AVATAR}
              className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-slate-700"
            />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-5">
            {/* User Info */}
            <div>
              <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-600">
                {user?.fullName}
              </h2>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                @{user?.userName}
              </p>
            </div>

            {/* Reports */}
            {reports.map((report) => (
              <div
                key={report.reportId}
                className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 space-y-3 border border-red-200 dark:border-red-900 transition-colors"
              >
                {/* Message */}
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {report.messageContent}
                </p>

                {/* Attachments */}
                {report.attachments?.length ? (
                  <div className="flex gap-3 flex-wrap">
                    {report.attachments.map((file) => (
                      <img
                        key={file.id}
                        src={`https://rahhal-api.runasp.net${file.url}`}
                        onClick={() =>
                          setSelectedImage(
                            `https://rahhal-api.runasp.net${file.url}`,
                          )
                        }
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            className="max-w-[80%] max-h-[80%] rounded-xl shadow-xl"
          />
        </div>
      )}
    </>
  );
}
