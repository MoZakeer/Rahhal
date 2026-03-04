import { useParams, useSearchParams } from "react-router-dom";
import ReportHeader from "../../features/ReportDetals/components/ReportHeader";
import ReportedPostCard from "../../features/ReportDetals/components/ReportedPostCard";
import ReportedUserCard from "../../features/ReportDetals/components/ReportedUserCard";
import ReportedCommentCard from "../../features/ReportDetals/components/ReportedCommentCard";
import ReportDetailsList from "../../features/ReportDetals/components/ReportDetailsList";
import ReportActions from "../../features/ReportDetals/components/ReportActions";

export default function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") as
    | "posts"
    | "comments"
    | "users";

  if (!type || !id) return null;

  const renderReportedCard = () => {
    switch (type) {
      case "posts":
        return <ReportedPostCard id={id} />;
      case "users":
        return <ReportedUserCard id={id} />;
      case "comments":
        return <ReportedCommentCard id={id} />;
      default:
        return <div>Invalid report type</div>;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <ReportHeader type={type} />

        {renderReportedCard()}

        <ReportDetailsList type={type} id={id} />

        <ReportActions
          type={type}
          commentId={type === "comments" ? id : undefined}
          postId={type === "posts" ? id : undefined}
          userId={type === "users" ? id : undefined}
        />
      </div>
    </div>
  );
}