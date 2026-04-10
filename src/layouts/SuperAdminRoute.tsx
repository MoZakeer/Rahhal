import { Navigate, Outlet } from "react-router-dom";
import { getUserRole } from "../../src/utils/auth";
import { isTokenValid } from "../utils/auth";

export const SuperAdminRoute = () => {
  const isValid = isTokenValid();
  const role = getUserRole();
  if (!isValid) {
    localStorage.removeItem("user");
    return <Navigate to="/landing-page" replace />;
  }
  if (role !== "SuperAdmin") {
    return <Navigate to="/landing-page" replace />;
  }

  return <Outlet />;
};
