import { useDebugValue } from "react";

import { useAuthContext } from "../context/AuthContext";

export function useAuth() {
  const auth = useAuthContext();

  // Shows auth status in React DevTools
  useDebugValue(
    auth.isAuthenticated ? "Authenticated" : "Unauthenticated"
  );

  return auth;
}

export default useAuth;