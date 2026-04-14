import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveGroup as leaveGroupApi } from "../services/leaveGroup";
import { useNavigate } from "react-router";

export function useLeavGroup({
  conversationId,
  profileId,
}: {
  conversationId: string;
  profileId: string;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isPending, mutate: leaveGroup } = useMutation({
    mutationFn: () => leaveGroupApi({ conversationId, profileId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["all-chats"],
      });
      navigate("/chat");
    },
  });
  return { isPending, leaveGroup };
}
