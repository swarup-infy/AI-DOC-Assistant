import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";

import { useAuth } from "../hooks/useAuth";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <Loader2
          className="animate-spin text-primary"
          size={42}
        />

        <div className="space-y-1 text-center">
          <h2 className="text-lg font-semibold">
            Loading
          </h2>

          <p className="text-sm text-muted-foreground">
            Verifying your session...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}