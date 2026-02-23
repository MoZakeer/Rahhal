import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
//landing page
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
import CreatePost from './feed/CreatePost';
import EditPost from './feed/EditPost.tsx';

// Trips Pages
import MyTrips from "./trips/MyTrips";

// Groups Pages
import GroupDetails from "./groups/GroupDetails";

// Chat Pages
import ChatPage from "./chat/ChatPage";

// Optional: 404 page
import NotFound from "./NotFound/notfound";
import MainLayout from "../layouts/mainLayout";
import AuthLayout from "../layouts/AuthLayout";

// setting
import SettingPage from "./settings/settingpage";

const Pages = () => {
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
          <Route path="/landing-page" element={<LandingPage/>} />
        </Route>

        <Route element={<MainLayout />}>
          {/* All pages now open directly */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/feed" element={<HomeFeed />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/groups/:groupId" element={<GroupDetails />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<SettingPage />} />

          {/* Home / Default */}
<<<<<<< HEAD
          <Route path="/" element={<Navigate to="/feed" />} />
        </Route>

=======
<Route path="/" element={<HomeFeed />} />        </Route>
>>>>>>> 93a45eba710835a6b273c232bd09035cbe2d1efc
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default Pages;