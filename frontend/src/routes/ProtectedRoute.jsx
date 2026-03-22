import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protect routes based on auth and role.
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};
