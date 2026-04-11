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

// Pages
import LandingPage from "./landingPage/landingPage.tsx";
import Login from "./auth/Login";
import SignUp from "./auth/SignUp.tsx";
import ForgetPassword from "./auth/ForgetPassword.tsx";
import ResetPassword from "./auth/ResetPassword.tsx";
import ChangePassword from "./auth/ChangePassword.tsx";
import VerifyEmail from "./auth/VerifyEmail.tsx";

import ProfilePage from "./profile/ProfilePage";
import EditProfilePage from "../pages/profile/EditProfilePage.tsx";
import ChangePasswordPage from "./profile/ChangePasswordPage.tsx";

import HomeFeed from "./feed/HomeFeed";
import PostDetailsPage from "./feed/PostDetails";

import TripDetail from "./TripDetail.tsx";
import CreateTrip from "./CreateTrip.tsx";
import AiPlanner from "./AiPlanner.tsx";
import TripMatching from "./TripMatching.tsx";

import GroupDetails from "./groups/GroupDetails";

import ChatPage from "./chat/ChatPage";
import ChatWindow from "../features/chat/components/ChatWindow.tsx";
import ChatSetting from "../features/chat/components/ChatSetting.tsx";
import EmptyState from "../features/chat/components/EmptyState.tsx";

import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/AuthLayout";
import SettingPage from "./settings/settingpage";

import { ReportsPage } from "./reports/ReportsPage.tsx";
import ReportsDetails from "./reports/reportDetailsPage.tsx";
import SearchResultsPage from "./search/SearchResultsPage.tsx";
import Explore from "@/pages/Explore.tsx";
import UserTrips from "@/pages/MyTrips.tsx";

import NotificationsPage from "../shared/components/NotificationsPage.tsx";
import NotFound from "./NotFound/notfound";

// React Query
const queryClient = new QueryClient();

const Pages = () => {
  const isAuthenticated = true; // عدلها حسب logic عندك

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Router>
          <Routes>
            {/* ================= AUTH ================= */}
            <Route element={<AuthLayout />}>
              <Route path="/landing-page" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route
                path="/:profileId/change-password"
                element={<ChangePassword />}
              />
            </Route>

            {/* ================= MAIN APP ================= */}
            <Route
              element={
                isAuthenticated ? (
                  <MainLayout />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            >
              {/* Profile */}
              <Route path="/profile/:profileId" element={<ProfilePage />} />
              <Route
                path="/profile/:profileId/edit"
                element={<EditProfilePage />}
              />
              <Route
                path="/profile/:profileId/change_password"
                element={<ChangePasswordPage />}
              />

              {/* Feed */}
              <Route path="/feed" element={<HomeFeed />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/post/:postId" element={<PostDetailsPage />} />

              {/* Trips */}
              <Route path="/my-trips" element={<UserTrips />} />
              <Route path="/trip/:id" element={<TripDetail />} />
              <Route path="/create-trip" element={<CreateTrip />} />
              <Route path="/ai-planner" element={<AiPlanner />} />
              <Route path="/matching" element={<TripMatching />} />

              {/* Groups */}
              <Route path="/groups/:groupId" element={<GroupDetails />} />

              {/* Search */}
              <Route path="/search-results" element={<SearchResultsPage />} />

              {/* Notifications */}
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Settings */}
              <Route path="/settings" element={<SettingPage />} />

              {/* Admin */}
              <Route path="/admin/reports/:type" element={<ReportsPage />} />
              <Route path="/report_details/:id" element={<ReportsDetails />} />

              {/* Default redirect */}
              <Route
                path="/"
                element={
                  localStorage.getItem("token") ? (
                    <Navigate to="/feed" replace />
                  ) : (
                    <Navigate to="/landing-page" replace />
                  )
                }
              />
            </Route>

            {/* ================= CHAT ================= */}
            <Route
              path="/chat"
              element={
                isAuthenticated ? <ChatPage /> : <Navigate to="/login" />
              }
            >
              <Route index element={<EmptyState />} />
              <Route path=":conversationId" element={<ChatWindow />} />
              <Route
                path=":conversationId/settings"
                element={<ChatSetting />}
              />
            </Route>

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Pages;
