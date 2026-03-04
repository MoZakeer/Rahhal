
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DismissButton from "./DismissButton";
import RemovePostButton from "./RemovePostButton";
import RemoveCommentButton from "./RemoveCommentButton";
import { BanUserButton } from "./BanUserButton";
import ConfirmModal from "./confirmModal";
import { BanDurationModal } from "./BanDurationModal";
import { useRemoveComment } from "../hooks/useRemoveComment";
import { useRemovePost } from "../hooks/useRemovePost";
import { apiClient } from "../services/apiClient";

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
  const [loadingBan, setLoadingBan] = useState(false);
  const [message, setMessage] = useState("");

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
          setOpenModal(false);
          navigate("/reports");
        },
      });
    } else if (type === "posts" && postId) {
      removePostMutation.mutate(postId, {
        onSuccess: () => {
          setOpenModal(false);
          navigate("/reports");
        },
      });
    }
  };

  const isLoading =
    removeCommentMutation.isPending || removePostMutation.isPending;

  if (!id) return null;


  const handleBan = async (hours: number | null) => {

    console.log("userId:", userId);
    if (!userId) return;
    setLoadingBan(true);
    setMessage("");

    const durationInHours = hours === null ? null : Math.max(hours, 1);
    const targetType = type === "posts" ? 2 : type === "comments" ? 3 : 1;
    const targetId = type === "posts" ? postId : type === "comments" ? commentId : null;

    console.log("Ban payload:", {
      profileId: userId,
      isBanned: true,
      durationInHours,
      targetType,
      targetId: targetId || null,
    });

    try {
      console.log("About to call UpdateUserBan for userId:", userId);
      const { data } = await apiClient.post("/User/UpdateUserBan", {
        profileId: userId,
        isBanned: true,
        durationInHours,
        targetType,
        targetId: targetId || null,
      });

      if (data.isSuccess) {
        setMessage("User banned successfully ✅");
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (err: any) {
      setMessage(`Request failed: ${err.message}`);
    } finally {
      setLoadingBan(false);
    }
  };

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
          {type === "posts" && <RemovePostButton onClick={() => setOpenModal(true)} />}
          {type === "comments" && <RemoveCommentButton onClick={() => setOpenModal(true)} />}
          <BanUserButton
            onClick={() => setOpenBanModal(true)}
            disabled={loadingBan}
          />
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
        onConfirm={handleBan}
      />
      {message && <p className="hidden">{message}</p>}

    </>
  );
}