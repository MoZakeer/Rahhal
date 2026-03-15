import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster"
import Pages from "./pages";
import CustomToaster from "./shared/components/CustomToaster";
import { UserProvider } from "./context/UserContext";
import "react-loading-skeleton/dist/skeleton.css";
import { ThemeProvider } from "./context/ThemeContext";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});
export default function App() {
  return (
    <ThemeProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          <Pages />
          <CustomToaster />
        </QueryClientProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
