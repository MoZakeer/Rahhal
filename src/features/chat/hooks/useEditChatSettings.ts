import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editChatSetting as editChatSettingApi } from "../services/editChatSettings";
import { useParams } from "react-router";

export function useEditChatSettings() {
  const queryClient = useQueryClient();
  const { conversationId } = useParams<{ conversationId: string }>();

  const { isPending, mutate: editChatSetting } = useMutation({
    mutationFn: editChatSettingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", conversationId] });
    },
  });
  return { isPending, editChatSetting };
}
