import React from "react";
import { useCommentDetails } from "../hooks/useCommentDetails";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { usePageTitle } from "@/hooks/usePageTitle";

interface Props {
  id: string;
}

const ReportedComment: React.FC<Props> = ({ id }) => {
  usePageTitle("Reported Comment Details");
  const { data, isLoading, isError } = useCommentDetails(id);
  const BASE_URL = "https://rahhal-api.runasp.net";
  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

  if (isError) return <div>Error loading comment</div>;

  const commentData = data?.data;

  return (
    <div className="border border-red-200 dark:border-red-900 rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">


          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center dark:opacity-60 transition-opacity">
            {isLoading ? (
              <Skeleton circle width={40} height={40} />
            ) : (
              <img
                src={
                  commentData?.commentAuthorPicture
                    ? commentData.commentAuthorPicture.startsWith("http")
                      ? commentData.commentAuthorPicture
                      : `${BASE_URL}${commentData.commentAuthorPicture}`
                    : DEFAULT_AVATAR
                }
                alt="user avatar"
                className="w-full h-full object-cover"
              />
            )}
          </div>


          <span className="font-semibold text-gray-800 dark:opacity-80 transition-opacity">
            {isLoading ? (
              <Skeleton width={120} />
            ) : (
              `@${commentData?.commentAuthorUserName || "Anonymous"}`
            )}
          </span>
        </div>
      </div>


      <p className="text-gray-800 mb-2 dark:opacity-80 transition-opacity">
        {isLoading ? <Skeleton count={2} /> : commentData?.commentContent}
      </p>


      <div className="text-xs text-gray-500 mb-6 dark:opacity-80 transition-opacity">
        {isLoading ? (
          <Skeleton width={150} />
        ) : (
          `Posted ${new Date(commentData?.createdDate).toLocaleString()}`
        )}
      </div>
    </div>
  );
};

export default ReportedComment;