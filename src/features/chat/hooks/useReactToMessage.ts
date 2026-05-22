import { useMutation } from "@tanstack/react-query";

import { reactToMessage } from "../services/reactToMessage";

export function useReactToMessage() {
  const { isPending, mutate: react } = useMutation({
    mutationFn: reactToMessage,
  });

  return {
    isPending,
    react,
  };
}
