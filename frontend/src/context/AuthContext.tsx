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

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(
    getCurrentUser()
  );

  const [loading, setLoading] = useState(true);

  const isAuthenticated =
    !!getAccessToken() && !!user;

  const updateUser = useCallback(
    (updatedUser: User) => {
      saveUser(updatedUser);
      setUser(updatedUser);
    },
    []
  );

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getProfile();

      saveUser(profile);

      setUser(profile);
    } catch {
      logoutService();
      setUser(null);
    }
  }, []);

  const login = useCallback(
    async (token: string) => {
      saveAccessToken(token);

      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  useEffect(() => {
    async function initialize() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [refreshUser]);

  const value = useMemo<AuthContextType>(
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
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider."
    );
  }

  return context;
}