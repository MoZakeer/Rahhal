import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { deleteMessage as deleteMessageApi } from "../services/deleteMessage";

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { isPending, mutate: deleteMessage } = useMutation({
    mutationFn: deleteMessageApi,
    onSuccess: function () {
      if (!conversationId) return;
      queryClient.invalidateQueries({
        queryKey: ["chat", conversationId],
        exact: true,
      });
    },
  });
  return { isPending, deleteMessage };
}
