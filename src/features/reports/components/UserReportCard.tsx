import type { UserReport } from "../types";
import {  normalizeMediaUrl } from "../../post/components/services/posts.api";
import { useNavigate } from "react-router-dom";
interface Props {
  report: UserReport;
}

export const UserReportCard = ({ report }: Props) => {
    const navigate = useNavigate();
  return (
    <div className="bg-white shadow-sm rounded-xl p-5 flex justify-between items-center border border-gray-300 ">
            <div >

 <div className="flex items-center gap-3">
         <img
                  src={normalizeMediaUrl(report.reportedUserPicture) || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.reportedUserName)}`}
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                        <div className="min-w-0">

        <h5 className="font-semibold text-gray-600 cursor-pointer"             onClick={() => navigate(`/profile/${report.reportedUserId}`)}
>
           {report.reportedUserName}
        </h5>
       <p className="text-sm text-gray-400 truncate">
            Reported user
          </p>
          </div>
       </div>
      </div>
  <div className="flex flex-col items-end "> 
         <span className="text-sm  text-gray-500 mt-2 inline-block">
            impact 
          </span>
        <span className="text-sm font-bold text-gray-700 mb-4  inline-block">
          {report.countReports} Reports
        </span>
       <button onClick={() => navigate(`/report_details/${report.reportedUserId}?type=users`)} className="px-2 py-1 rounded-lg border border-gray-500 text-gray-700 hover:border-black hover:text-black transition">
  Review Case
</button>
      </div>
    </div>
  );
};