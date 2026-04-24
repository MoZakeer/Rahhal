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
import { useState } from "react";
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
import { SuperAdminRoute } from "../layouts/SuperAdminRoute.tsx";

import SettingPage from "./settings/settingpage";

import { ReportsPage } from "./reports/ReportsPage.tsx";
import ReportsDetails from "./reports/reportDetailsPage.tsx";
import SearchResultsPage from "./search/SearchResultsPage.tsx";
import Explore from "@/pages/Explore.tsx";
import UserTrips from "@/pages/MyTrips.tsx";
import { isTokenValid } from "../utils/auth";

import NotificationsPage from "../features/Notifications/NotificationsPage.tsx";
import NotFound from "./NotFound/notfound";
import { NotificationProvider } from "@/context/NotificationProvider.tsx";

// React Query
const queryClient = new QueryClient();

const Pages = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid());

  // This function flips the state and triggers a re-render
  const handleAuthChange = () => {
    setIsAuthenticated(isTokenValid());
  };
  const updateAuth = () => setIsAuthenticated(isTokenValid());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Router>
          <NotificationProvider>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/feed" replace />
                ) : (
                  <Navigate to="/landing-page" replace />
                )
              }
            />
            {/* ================= AUTH ================= */}
            <Route element={<AuthLayout />}>
              <Route path="/landing-page" element={<LandingPage />} />
              <Route
                path="/login"
                element={<Login onLoginSuccess={handleAuthChange} />}
              />
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
                  // <NotificationProvider>
                    <MainLayout onLogout={updateAuth} />
                  // </NotificationProvider>
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
              <Route
                path="/feed"
                element={
                  isAuthenticated ? (
                    <HomeFeed />
                  ) : (
                    <Navigate to="/landing-page" />
                  )
                }
              />
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
              <Route element={<SuperAdminRoute />}>
                <Route path="/admin/reports/:type" element={<ReportsPage />} />
                <Route
                  path="/report_details/:id"
                  element={<ReportsDetails />}
                />
              </Route>
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
          </NotificationProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Pages;
