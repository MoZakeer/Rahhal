import type { CommentReport } from "../types";
import {  normalizeMediaUrl } from "../../post/components/services/posts.api";
import { useNavigate } from "react-router-dom";

interface Props {
  report: CommentReport;
}

export const CommentReportCard = ({ report }: Props) => {
    const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm rounded-xl p-5 flex justify-between items-center border border-gray-300">
      <div>
 <div className="flex items-center gap-3">
        <img
          src={normalizeMediaUrl(report.commentAuthorPicture) ||`https://ui-avatars.com/api/?name=${encodeURIComponent(report.commentAuthorUserName)}`}
          alt="profile"
          className="w-12 h-12 rounded-full object-cover"
        />

        <div>
          <h3 className="font-semibold  text-gray-600">
            {report.commentAuthorUserName}
          </h3>

          
        </div>
      </div>

        <p className="text-gray-600 mt-2 line-clamp-2">
          {report.commentContent}
        </p>

      
      </div>

      <div className="flex flex-col items-end ">
         <span className="text-sm  text-gray-500 mt-2 inline-block">
            impact 
          </span>
        <span className="text-sm font-bold text-gray-700 mb-4  inline-block">
          {report.countReports} Reports
        </span>
       <button className="px-2 py-1 rounded-lg border border-gray-500 text-gray-700 hover:border-black hover:text-black transition"
                onClick={() => navigate(`/report_details/${report.commentId}?type=comments`)}
       >
  Review Case
</button>
      </div>
    </div>
  );
};