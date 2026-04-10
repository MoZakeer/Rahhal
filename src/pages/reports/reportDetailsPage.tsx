
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ReportHeader from "../../features/ReportDetals/components/ReportHeader";
import ReportedPostCard from "../../features/ReportDetals/components/ReportedPostCard";
import ReportedUserCard from "../../features/ReportDetals/components/ReportedUserCard";
import ReportedCommentCard from "../../features/ReportDetals/components/ReportedCommentCard";
import ReportDetailsList from "../../features/ReportDetals/components/ReportDetailsList";
import ReportActions from "../../features/ReportDetals/components/ReportActions";
import { getCommentById } from "../../features/ReportDetals/services/commentApi";
import { getPostById } from "../../features/ReportDetals/services/postApi";

export default function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") as "posts" | "comments" | "users";

  const [authorId, setAuthorId] = useState<string | undefined>(undefined);

 
  if (!id || !type) return null;
  const reportId: string = id;

  useEffect(() => {
    async function fetchAuthorId() {
      try {
        if (type === "posts") {
          const data = await getPostById(reportId);
          setAuthorId(data.data.userId); 
        } else if (type === "comments") {
          const data = await getCommentById(reportId);
          setAuthorId(data.data.commentAuthorId); 
        } else if (type === "users") {
          setAuthorId(reportId); 
        }
      } catch (err: any) {
        console.error("Failed to fetch authorId:", err.message);
      }
    }

    fetchAuthorId();
  }, [reportId, type]);

  const renderReportedCard = () => {
    switch (type) {
      case "posts":
        return <ReportedPostCard id={reportId} />;
      case "users":
        return <ReportedUserCard id={reportId} />;
      case "comments":
        return <ReportedCommentCard id={reportId} />;
      default:
        return <div>Invalid report type</div>;
    }
  };

  return (
    <div className="min-h-screen pt-10">
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <ReportHeader type={type} />

        {renderReportedCard()}

        <ReportDetailsList type={type} id={reportId} />

        
        {authorId && (
          <ReportActions
            type={type}
            commentId={type === "comments" ? reportId : undefined}
            postId={type === "posts" ? reportId : undefined}
            userId={authorId} 
          />
        )}
      </div>
    </div>
  );
}