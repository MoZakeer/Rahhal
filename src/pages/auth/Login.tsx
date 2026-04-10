import LoginForm from "../../features/auth/components/loginForm";

// Define the interface so TypeScript knows about the prop
interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // Pass the prop down to the actual form
  return <LoginForm onLoginSuccess={onLoginSuccess} />;
}