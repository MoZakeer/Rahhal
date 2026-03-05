import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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

// Feed Pages
import HomeFeed from "./feed/HomeFeed";
import CreatePost from "./feed/CreatePost";
import EditPost from "./feed/EditPost.tsx";

// Trips Pages
import MyTrips from "./trips/MyTrips";

// Groups Pages
import GroupDetails from "./groups/GroupDetails";

// Chat Pages
import ChatPage from "./chat/ChatPage";
import ChatWindow from "../features/chat/components/ChatWindow.tsx";
import ChatSetting from "../features/chat/components/ChatSetting.tsx";
import EmptyState from "../features/chat/components/EmptyState.tsx";

// Optional: 404 page
import NotFound from "./NotFound/notfound";

import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Settings
import SettingPage from "./settings/settingpage";
// Admin Pages
import { ReportsPage } from "./reports/ReportsPage.tsx";
import EditProfilePage from "../pages/profile/EditProfilePage.tsx";
import ChangePasswordPage from "./profile/ChangePasswordPage.tsx";
import SearchResultsPage from "./search/SearchResultsPage.tsx";
import ReportsDetails from "./reports/reportDetailsPage.tsx";
const Pages = () => {
  const isAuthenticated = true; 

  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/edit-post/:postId" element={<EditPost />} />
          <Route path="/landing-page" element={<LandingPage />} />
          <Route path="/report_details/:id" element={<ReportsDetails />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

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
        {/* Main App */}
        <Route element={<MainLayout />}>
          <Route
            path="/profile/:profileId?"
            element={
              isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/profile/edit"
            element={
              isAuthenticated ? <EditProfilePage /> : <Navigate to="/login" />
            }
          />
          <Route 
          path="/profile/change_password"
          element={
            isAuthenticated ? <ChangePasswordPage /> : <Navigate to="/login" />
          }
          />
          <Route
            path="/feed"
            element={isAuthenticated ? <HomeFeed /> : <Navigate to="/login" />}
          />
          {/* search */}
          <Route
            path="/search-results"
            element={
              isAuthenticated ? <SearchResultsPage /> : <Navigate to="/login" />
            }
          />
 {/* Admin */}
          <Route
  path="/admin/reports/:type"
  element={
    isAuthenticated ? <ReportsPage /> : <Navigate to="/login" />
  }
/>
          <Route
            path="/trips"
            element={isAuthenticated ? <MyTrips /> : <Navigate to="/login" />}
          />

          <Route
            path="/groups/:groupId"
            element={
              isAuthenticated ? <GroupDetails /> : <Navigate to="/login" />
            }
          />

          {/* Default Home */}
          <Route
            path="/"
            element={
              localStorage.getItem("token")
                ? <Navigate to="/feed" replace />
                : <Navigate to="/landing-page" replace />
            }
          />
         
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

    </Router>
  );
};

export default Pages;
