import { useQuery } from "@tanstack/react-query";
import { getChatDetails } from "../services/getChatDetails";
import type { ChatDetailsResponse } from "../types/chatDetails.type";

export function useChatDetails({ conversationId }: { conversationId: string }) {
  return useQuery<ChatDetailsResponse>({
    queryKey: ["chat-details", conversationId],
    queryFn: () => getChatDetails({ conversationId }),
    enabled: !!conversationId,
  });
}
