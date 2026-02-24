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
<<<<<<< HEAD
      console.log(data);
      setUser({
        token: data?.data?.token,
        userId: data?.data?.profileId,
      });
=======
      console.log(data?.data?.token);
      setToken(data?.data?.token);
      localStorage.setItem("profileId", JSON.stringify(data?.data?.profileId));
>>>>>>> e628c46d50ad8d1c1769a05b03fd0db1da8d50ab
    },
  });
  return { isPending, login, error };
}
