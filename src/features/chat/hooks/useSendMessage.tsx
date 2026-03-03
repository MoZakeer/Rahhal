import { useMutation } from "@tanstack/react-query";
import { sendMessage as sendMessageApi } from "../services/sendMessage";

export function useSendMessage() {
  
  const { isPending, mutate: sendMessage } = useMutation({
    mutationFn: sendMessageApi,
  });
  return { isPending, sendMessage };
}
