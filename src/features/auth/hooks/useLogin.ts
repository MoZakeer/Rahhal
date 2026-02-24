import { useMutation } from "@tanstack/react-query";
import { login as loginApi } from "../services/apiAuth";
import { useUser } from "../../context/UserContext";

export function useLogin() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const { setUser } = useUser();

  const {
    isPending,
    mutate: login,
    error,
  } = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      console.log(data);
      setUser({
        token: data?.data?.token,
        userId: data?.data?.profileId,
      });
    },
  });
  return { isPending, login, error };
}
