import { useDebugValue } from "react";

import { useAuthContext } from "../context/AuthContext";

export function useAuth() {
  const auth = useAuthContext();

  useDebugValue(() => {
    if (auth.loading) {
      return "Loading";
    }

    return auth.isAuthenticated
      ? `Authenticated (${auth.user?.username ?? "User"})`
      : "Unauthenticated";
  });

  return auth;
}

export default useAuth;