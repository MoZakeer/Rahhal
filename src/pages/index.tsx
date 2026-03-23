import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Landing page
import LandingPage from "./landingPage/landingPage.tsx";

// Auth Pages
import Login from "./auth/Login";
import SignUp from "./auth/SignUp.tsx";
import ForgetPassword from "./auth/ForgetPassword.tsx";
import ResetPassword from "./auth/ResetPassword.tsx";
import ChangePassword from "./auth/ChangePassword.tsx";
import VerifyEmail from "./auth/VerifyEmail.tsx";

// Profile Pages
import ProfilePage from "./profile/ProfilePage";
import EditProfilePage from "../pages/profile/EditProfilePage.tsx";
import ChangePasswordPage from "./profile/ChangePasswordPage.tsx";

// Feed Pages
import HomeFeed from "./feed/HomeFeed";
import PostDetailsPage from "./feed/PostDetails";

// Trips Pages
// import MyTrips from "./trips/MyTrips";
import TripDetail from "./TripDetail.tsx";
import CreateTrip from "./CreateTrip.tsx";
import AiPlanner from "./AiPlanner.tsx";
import TripMatching from "./TripMatching.tsx";

// Groups Pages
import GroupDetails from "./groups/GroupDetails";

// Chat Pages
import ChatPage from "./chat/ChatPage";
import ChatWindow from "../features/chat/components/ChatWindow.tsx";
import ChatSetting from "../features/chat/components/ChatSetting.tsx";
import EmptyState from "../features/chat/components/EmptyState.tsx";

// Layouts & Settings
import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/AuthLayout";
import SettingPage from "./settings/settingpage";

// Admin & Search
import { ReportsPage } from "./reports/ReportsPage.tsx";
import ReportsDetails from "./reports/reportDetailsPage.tsx";
import SearchResultsPage from "./search/SearchResultsPage.tsx";
import Explore from "@/pages/Explore.tsx";
import UserTrips from "@/pages/MyTrips.tsx";

// 404 page
import NotFound from "./NotFound/notfound";

// Initialize React Query Client
const queryClient = new QueryClient();

const Pages = () => {
  const isAuthenticated = true;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Global UI Components */}
        <Toaster />
        <Sonner />
        
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/:profileId/change-password" element={<ChangePassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/landing-page" element={<LandingPage />} />
              <Route path="/report_details/:id" element={<ReportsDetails />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            {/* Chat Routes */}
            <Route
              path="/chat"
              element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
            >
              <Route index element={<EmptyState />} />
              <Route path=":conversationId" element={<ChatWindow />} />
              <Route path=":conversationId/settings" element={<ChatSetting />} />
            </Route>

            <Route
              path="/settings"
              element={isAuthenticated ? <SettingPage /> : <Navigate to="/login" />}
            />

            {/* Main App Routes (Protected via Layout) */}
            <Route element={<MainLayout />}>
              {/* Profile */}
              <Route path="/profile/:profileId" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
              <Route path="/profile/:profileId/edit" element={isAuthenticated ? <EditProfilePage /> : <Navigate to="/login" />} />
              <Route path="/profile/:profileId/change_password" element={isAuthenticated ? <ChangePasswordPage /> : <Navigate to="/login" />} />

              {/* Social / Feed / Explore */}
              <Route path="/feed" element={isAuthenticated ? <HomeFeed /> : <Navigate to="/login" />} />
              <Route path="/explore" element={isAuthenticated ? <Explore /> : <Navigate to="/login" />} />
              <Route path="/post/:postId" element={isAuthenticated ? <PostDetailsPage /> : <Navigate to="/login" />} />
              
              {/* Trips & Planning */}
              <Route path="/my-trips" element={isAuthenticated ? <UserTrips /> : <Navigate to="/login" />} />
              <Route path="/trip/:id" element={isAuthenticated ? <TripDetail /> : <Navigate to="/login" />} />
              <Route path="/create-trip" element={isAuthenticated ? <CreateTrip /> : <Navigate to="/login" />} />
              <Route path="/ai-planner" element={isAuthenticated ? <AiPlanner /> : <Navigate to="/login" />} />
              <Route path="/matching" element={isAuthenticated ? <TripMatching /> : <Navigate to="/login" />} />
              
              {/* Groups & Search */}
              <Route path="/groups/:groupId" element={isAuthenticated ? <GroupDetails /> : <Navigate to="/login" />} />
              <Route path="/search-results" element={isAuthenticated ? <SearchResultsPage /> : <Navigate to="/login" />} />
              
              {/* Admin */}
              <Route path="/admin/reports/:type" element={isAuthenticated ? <ReportsPage /> : <Navigate to="/login" />} />

              {/* Default Home / Redirect */}
              <Route
                path="/"
                element={
                  localStorage.getItem("token")
                    ? <Navigate to="/feed" replace />
                    : <Navigate to="/landing-page" replace />
                }
              />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Pages;