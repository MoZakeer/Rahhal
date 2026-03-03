import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeParticipant as removeParticipantApi } from "../services/removeParticipant";

export function useRemoveParticipant({
  conversationId,
  profileId,
}: {
  conversationId: string;
  profileId: string;
}) {
  const queryClient = useQueryClient();
  const { isPending, mutate: removeParticipant } = useMutation({
    mutationFn: () => removeParticipantApi({ conversationId, profileId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat-details", conversationId],
      });
    },
  });
  return { isPending, removeParticipant };
}
