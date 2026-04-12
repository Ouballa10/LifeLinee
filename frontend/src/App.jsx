import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { getStoredUser } from "./lib/session.js";
import HomePage from "./pages/Home.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import SplashPage from "./pages/Splash.jsx";

function ProtectedRoute({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const user = getStoredUser();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function App() {
  return (
    <div className="app-frame">
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
