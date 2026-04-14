import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute.jsx";
import { useAuth } from "../hooks/useAuth.js";
import Splash from "../pages/Splash.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import Emergency from "../pages/emergency/Emergency.jsx";
import Dashboard from "../pages/main/Dashboard.jsx";
import Home from "../pages/main/Home.jsx";
import EditProfile from "../pages/profile/EditProfile.jsx";
import MedicalForm from "../pages/profile/MedicalForm.jsx";
import Profile from "../pages/profile/Profile.jsx";
import QRCodePage from "../pages/qr/QRCodePage.jsx";
import Scanner from "../pages/qr/Scanner.jsx";
import { ROUTES } from "../utils/constants.js";

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.splash} element={<Splash />} />
      <Route
        path={ROUTES.login}
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path={ROUTES.register}
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path={ROUTES.home}
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.dashboard}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.profile}
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.editProfile}
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.medicalForm}
        element={
          <ProtectedRoute>
            <MedicalForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.qr}
        element={
          <ProtectedRoute>
            <QRCodePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.scanner}
        element={
          <ProtectedRoute>
            <Scanner />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.emergency} element={<Emergency />} />
      <Route path={`${ROUTES.emergency}/:token`} element={<Emergency />} />
      <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
    </Routes>
  );
}
