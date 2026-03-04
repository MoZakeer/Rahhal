import React from "react";
import { useCommentDetails } from "../hooks/useCommentDetails";

interface Props {
  id: string;
  
}

const ReportedComment: React.FC<Props> = ({ id}) => {
  const { data, isLoading, isError } = useCommentDetails(id);

  if (isLoading) return <div>Loading comment...</div>;
  if (isError) return <div>Error loading comment</div>;

  const commentData = data?.data;
  if (!commentData) return null;

  return (
    <div className="border border-red-200 rounded-lg p-4 bg-white shadow-sm max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {commentData.commentAuthorPicture ? (
              <img
                src={commentData.commentAuthorPicture}
                alt={`${commentData.commentAuthorUserName} avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-500">
                {commentData.commentAuthorUserName
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </span>
            )}
          </div>

          <span className="font-semibold text-gray-800">
            @{commentData.commentAuthorUserName || "Anonymous"}
          </span>
        </div>

       
      </div>

      <p className="text-gray-700 mb-2">
        {commentData.commentContent}
      </p>

      <div className="text-xs text-gray-400 mb-6">
        {`Posted ${new Date(
          commentData.createdDate
        ).toLocaleString()}`}
      </div>

     
    </div>
  );
};

export default ReportedComment;