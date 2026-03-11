import { useState } from "react";
import type { CommentItem, ReplyItem } from "../../../types/post";
import { Heart } from "lucide-react";
import * as commentApi from "../components/services/commentApi";

interface Props {
  comment: CommentItem;
  postId: string;
  currentUserId: string;
  onReply: (id: string, name: string) => void;
}

export function CommentRow({ comment, onReply }: Props) {
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [showReplies, setShowReplies] = useState(false);

  const loadReplies = async () => {
    if (!showReplies && replies.length === 0) {
      const res = await commentApi.fetchReplies(comment.commentId);
      setReplies(res.data.items || []);
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className="flex gap-3">
      <img src={comment.profilePicture} className="w-9 h-9 rounded-full" />
      <div className="flex-1">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl relative">
          <p className="text-sm font-bold dark:text-white">{comment.userName}</p>
          <p className="text-sm dark:text-slate-300">{comment.description}</p>
        </div>
        
        <div className="flex gap-4 mt-2 text-xs font-bold text-slate-500 ml-2">
          <button className="flex items-center gap-1">
            <Heart size={14} fill={comment.isLikedByCurrentUser ? "currentColor" : "none"} />
            {comment.likesCount}
          </button>
          <button onClick={() => onReply(comment.commentId, comment.userName)}>Reply</button>
          {comment.repliesCount > 0 && (
            <button onClick={loadReplies}>
              {showReplies ? "Hide" : `View ${comment.repliesCount} replies`}
            </button>
          )}
        </div>

        {/* Render Replies using the ReplyItem type */}
        {showReplies && (
          <div className="mt-4 space-y-4 border-l-2 border-slate-100 dark:border-slate-800 pl-4">
            {replies.map((reply: ReplyItem) => (
              <div key={reply.replyId} className="flex gap-2">
                <img src={reply.profilePicture} className="w-6 h-6 rounded-full" />
                <div className="flex-1">
                   <div className="bg-slate-50 dark:bg-slate-800/30 p-2 rounded-xl">
                      <p className="text-xs font-bold">{reply.userName}</p>
                      <p className="text-xs">{reply.description}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}