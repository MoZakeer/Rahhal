import { useMutation } from "@tanstack/react-query";
import { login as loginApi } from "../services/apiAuth";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

export function useLogin() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setToken] = useLocalStorage("", "token");
  const {
    isPending,
    mutate: login,
    error,
  } = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      console.log(data?.data?.token);
      setToken(data?.data?.token);
      localStorage.setItem("profileId", JSON.stringify(data?.data?.profileId));
    },
  });
  return { isPending, login, error };
}
