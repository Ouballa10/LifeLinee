import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Loader from "../ui/Loader.jsx";
import { ROUTES } from "../../utils/constants.js";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading && (!isAuthenticated || !user)) {
    return <Loader label="Connexion en cours..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return children;
}
