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

  login: (token: string) => Promise<void>;
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

  const login = useCallback(
    async (token: string) => {
      saveAccessToken(token);

      await refreshUser();
    },
    [refreshUser]
  );

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