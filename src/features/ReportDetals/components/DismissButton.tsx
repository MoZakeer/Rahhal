import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

type Props = {
  type: "post" | "comment" | "user";
  id: string;
  onDismissSuccess?: () => void;
};

export default function DismissButton({ type, id, onDismissSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleDismiss = async () => {
    setLoading(true);

    try {
      const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;
      if (!token) throw new Error("Not authenticated");

      let endpoint = "";
      let data: Record<string, string> = {};

      switch (type) {
        case "post":
          endpoint = `https://rahhal-api.runasp.net/Report/RejectPostReports`;
          data = { PostId: id };
          break;
        case "comment":
          endpoint = `https://rahhal-api.runasp.net/Report/RejectCommentReport`;
          data = { CommentId: id };
          break;
        case "user":
          endpoint = `https://rahhal-api.runasp.net/Report/RejectUserReport`;
          data = { profileId: id };
          break;
      }

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        data,
      });

      setDismissed(true);
      setFlash(true);
      setTimeout(() => setFlash(false), 1000);

      onDismissSuccess?.();
    } catch (error: unknown) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Something went wrong";
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDismiss}
      disabled={loading || dismissed}
      className={`flex items-center gap-2 text-sm transition px-2 py-1 rounded ${
        dismissed
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-500 hover:text-gray-700"
      } ${flash ? "bg-green-100" : ""}`}
    >
      {loading ? (
        <span className="animate-spin border-b-2 border-gray-700 rounded-full w-4 h-4"></span>
      ) : (
        <>
          <X size={16} /> {dismissed ? "Dismissed" : "Dismiss Report"}
        </>
      )}
    </button>
  );
}