import LoginForm from "../../features/auth/components/loginForm";
interface LoginProps {
  onLoginSuccess: () => void;
}
export default function Login({ onLoginSuccess }: LoginProps) {
  return <LoginForm onLoginSuccess={onLoginSuccess} />;
}