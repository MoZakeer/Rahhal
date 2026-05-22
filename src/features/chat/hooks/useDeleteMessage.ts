import { useMutation } from "@tanstack/react-query";
import { deleteMessage as deleteMessageApi } from "../services/deleteMessage";

export function useDeleteMessage() {
  const { isPending, mutate: deleteMessage } = useMutation({
    mutationFn: deleteMessageApi,
    
  });
  return { isPending, deleteMessage };
}
