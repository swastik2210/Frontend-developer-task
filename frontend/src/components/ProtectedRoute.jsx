import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While auth state is loading (token → profile)
  if (loading) {
    return (
      <div
        style={{
          marginTop: "60px",
          textAlign: "center",
          fontSize: "18px",
          color: "#475569",
          animation: "fadeIn 0.4s ease"
        }}
      >
        Checking authentication...
      </div>
    );
  }

  // If no user logged in → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise show protected screen
  return children;
}
