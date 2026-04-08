import { getToken } from "../../../utils/getToken";

export const isAuthenticated = (): boolean => {
  return !!getToken();
};