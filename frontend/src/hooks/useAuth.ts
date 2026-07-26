import { useMemo } from "react";

import { useAuthContext } from "../context/AuthContext";

import {
  getAccessToken,
  getCurrentUser,
  isAuthenticated,
  logout,
} from "../services/authService";

export function useAuth() {
  const auth = useAuthContext();

  return useMemo(
    () => ({
      ...auth,

      token: getAccessToken(),

      user:
        auth.user ??
        getCurrentUser(),

      isAuthenticated:
        auth.isAuthenticated ??
        isAuthenticated(),

      logout,
    }),
    [auth]
  );
}

export default useAuth;