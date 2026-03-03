import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Pages from "./pages";
import CustomToaster from "./shared/components/CustomToaster";
import { UserProvider } from "./context/UserContext";
import "react-loading-skeleton/dist/skeleton.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});
export default function App() {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <Pages />
        <CustomToaster />
      </QueryClientProvider>
    </UserProvider>
  );
}
