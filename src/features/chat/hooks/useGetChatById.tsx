import { useParams } from "react-router";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatById } from "../services/getChatById";
import type { UserType } from "../../../types/UserType";
import type { ChatResponse } from "../types/chat.types";

export function useGetChatById() {
  const [user] = useLocalStorage<UserType>("user", {
    token: "",
    userId: "",
  });

  const { conversationId } = useParams<{ conversationId: string }>();
  const { isPending, data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<ChatResponse>({
      queryKey: ["chat", conversationId],
      queryFn: ({ pageParam = 1 }) =>
        getChatById({
          token: user?.token,
          conversationId: conversationId!,
          page: pageParam as number,
        }),

      initialPageParam: 1,
      getNextPageParam: (lastPage: ChatResponse) => {
        const messages = lastPage.data.messages;
        if (!messages) return undefined;
        const { pageIndex, pages } = messages;
        return pageIndex < pages ? pageIndex + 1 : undefined;
      },
      enabled: !!conversationId && !!user.token,
    });
  return { isPending, data, fetchNextPage, hasNextPage, isFetchingNextPage };
}
