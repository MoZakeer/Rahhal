import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const useAuthNavigation = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (isAuthenticated()) {
      navigate(path); 
    } else {
      navigate("/login");
    }
  };

  return handleNavigation;
};

export default useAuthNavigation;