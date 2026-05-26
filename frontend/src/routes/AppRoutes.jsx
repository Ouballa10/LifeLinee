import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../utils/constants.js";

// Lazy-loaded pages for better code splitting
const Splash = lazy(() => import("../pages/Splash.jsx"));
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Register = lazy(() => import("../pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const Emergency = lazy(() => import("../pages/emergency/Emergency.jsx"));
const Dashboard = lazy(() => import("../pages/main/Dashboard.jsx"));
const Home = lazy(() => import("../pages/main/Home.jsx"));
const EditProfile = lazy(() => import("../pages/profile/EditProfile.jsx"));
const MedicalForm = lazy(() => import("../pages/profile/MedicalForm.jsx"));
const Profile = lazy(() => import("../pages/profile/Profile.jsx"));
const QRCodePage = lazy(() => import("../pages/qr/QRCodePage.jsx"));
const Scanner = lazy(() => import("../pages/qr/Scanner.jsx"));
const MedicalDossier = lazy(() => import("../pages/dossier/MedicalDossier.jsx"));

function PageLoader() {
  return (
    <div className="page-loader" aria-label="Chargement...">
      <div className="page-loader__spinner" />
    </div>
  );
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
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
          path={ROUTES.dossier}
          element={
            <ProtectedRoute>
              <MedicalDossier />
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
          element={<Scanner />}
        />
        <Route path={ROUTES.emergency} element={<Emergency />} />
        <Route path={`${ROUTES.emergency}/:token`} element={<Emergency />} />
        <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
      </Routes>
    </Suspense>
  );
}
