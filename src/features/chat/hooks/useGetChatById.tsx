import { useParams } from "react-router";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { useQuery } from "@tanstack/react-query";
import { getChatById } from "../services/getChatById";

export function useGetChatById() {
  type UserType = {
    token: string;
    userId: string;
  };

  const [user] = useLocalStorage<UserType>("user", {
    token: "",
    userId: "",
  });

  const { chatId } = useParams<{ chatId: string }>();

  const { isPending, data } = useQuery({
    queryKey: ["open-chat", chatId],
    queryFn: () =>
      getChatById({
        token: user.token,
        chatId: chatId as string,
      }),
    enabled: !!chatId && !!user.token,
  });

  return { isPending, data };
}
