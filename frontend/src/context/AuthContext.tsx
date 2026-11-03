/* The provider intentionally exports the hook alongside the component for compatibility with existing imports. */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getAccessToken,
  getCurrentUser,
  getProfile,
  logout as logoutService,
  saveAccessToken,
  saveUser,
  type User,
} from "../services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (token: string, fallbackUser?: User) => Promise<void>;
  logout: () => void;

  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(
      getCurrentUser()
    );

  const [loading, setLoading] =
    useState(true);

  const isAuthenticated =
    !!user && !!getAccessToken();

  const updateUser = useCallback(
    (nextUser: User) => {
      saveUser(nextUser);
      setUser(nextUser);
    },
    []
  );

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile =
        await getProfile();

      saveUser(profile);
      setUser(profile);
    } catch {
      // Keep a still-valid cached session during temporary API/network failures.
      // A 401 response is handled centrally by the API client and clears the token.
      if (!getAccessToken()) {
        setUser(null);
      }
      throw new Error("Failed to refresh user.");
    }
  }, [logout]);

  const login = useCallback(async (token: string, fallbackUser?: User) => {
    saveAccessToken(token);

    // Use the user returned by the login endpoint immediately. This avoids
    // navigating to a protected route while user state is still null.
    const cachedUser = fallbackUser ?? getCurrentUser();
    if (cachedUser) {
      saveUser(cachedUser);
      setUser(cachedUser);
    }

    try {
      const profile = await getProfile();
      saveUser(profile);
      setUser(profile);
    } catch (error) {
      // The login endpoint already authenticated this token and supplied the
      // user object. Keep the session on transient profile failures; a 401
      // interceptor clears the token and therefore still prevents access.
      if (!getAccessToken() || !cachedUser) {
        logoutService();
        setUser(null);
        throw error;
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      if (!getAccessToken()) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        await refreshUser();
      } catch {
        // Network/server errors must not leave the app stuck on a loader.
        // A valid cached user remains signed in; invalid tokens are cleared by
        // the API client's 401 handler.
        if (!getAccessToken() && mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      refreshUser,
      updateUser,
    }),
    [
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      refreshUser,
      updateUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used within AuthProvider."
    );
  }

  return context;
}