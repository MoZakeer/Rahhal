import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { getAllChats } from "../services/getAllChats";

export function useGetAllChats() {
  const [user] = useLocalStorage("user", { token: "", userId: "" });
  const { isPending, data, error } = useQuery({
    queryKey: ["all-chats"],
    queryFn: () => getAllChats(user.token),
  });
  return { isPending, data, error };
}
