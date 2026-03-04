import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DismissButton from "./DismissButton";
import RemovePostButton from "./RemovePostButton";
import BanUserButton from "./BanUserButton";
import RemoveCommentButton from "./RemoveCommentButton";
import ConfirmModal from "./confirmModal";
import { BanDurationModal } from "./BanDurationModal";
import { useRemoveComment } from "../hooks/useRemoveComment";
import { useRemovePost } from "../hooks/useRemovePost";

interface Props {
  type: "posts" | "comments" | "users";
  commentId?: string;
  postId?: string;
  userId?: string;
}

export default function ReportActions({
  type,
  commentId,
  postId,
  userId,
}: Props) {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [openBanModal, setOpenBanModal] = useState(false);

  const removeCommentMutation = useRemoveComment();
  const removePostMutation = useRemovePost();

  const id =
    type === "posts" ? postId :
    type === "comments" ? commentId :
    userId;

  const singularType =
    type === "posts" ? "post" :
    type === "comments" ? "comment" :
    "user";

  const handleConfirm = () => {
    if (type === "comments" && commentId) {
      removeCommentMutation.mutate(commentId, {
        onSuccess: () => {
          setOpenModal(false),
          navigate("/reports");
        }
      });
    }

    if (type === "posts" && postId) {
      removePostMutation.mutate(postId, {
        onSuccess: () => {
          setOpenModal(false);
          navigate("/reports");
        },
      });
    }
  };

  const isLoading =
    removeCommentMutation.isPending ||
    removePostMutation.isPending;

  if (!id) return null;

  return (
    <>
      <div className="flex justify-between items-center pt-6 border-t">
        <DismissButton
          type={singularType}
          id={id}
          onDismissSuccess={() => {
            console.log("Reports dismissed successfully");
            navigate("/reports");
          }}
        />

        <div className="flex gap-3">
          {type === "posts" && (
            <RemovePostButton onClick={() => setOpenModal(true)} />
          )}
          {type === "comments" && (
            <RemoveCommentButton onClick={() => setOpenModal(true)} />
          )}
          <BanUserButton onClick={() => setOpenBanModal(true)} />
        </div>
      </div>

      {(type === "posts" || type === "comments") && (
        <ConfirmModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onConfirm={handleConfirm}
          loading={isLoading}
          itemType={singularType as "post" | "comment"}
        />
      )}

      <BanDurationModal
        open={openBanModal}
        onClose={() => setOpenBanModal(false)}
        onConfirm={(hours) => {
          console.log(`Ban confirmed for ${hours} hours`);
          setOpenBanModal(false);
        }}
      />
    </>
  );
}