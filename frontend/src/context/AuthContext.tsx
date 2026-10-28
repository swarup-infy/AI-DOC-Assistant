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

  login: (token: string) => void;
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
      logout();
      throw new Error(
        "Failed to refresh user."
      );
    }
  }, [logout]);

  const login = useCallback((token: string) => {
    // Authentication should not wait for an extra profile request.
    saveAccessToken(token);

    // Use cached details immediately; fetch the newest profile after navigation.
    const cachedUser = getCurrentUser();
    if (cachedUser) setUser(cachedUser);

    void getProfile()
      .then((profile) => {
        saveUser(profile);
        setUser(profile);
      })
      .catch(() => {
        // Sign-in already succeeded. Profile refresh can be retried later.
      });
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
      } finally {
        if (mounted) {
          setLoading(false);
        }
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