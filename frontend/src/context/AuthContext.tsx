import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import api from "../api/api";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(token: string) {
    localStorage.setItem("access_token", token);

    const response = await api.get("/auth/me");

    setUser(response.data.user);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch {
        localStorage.removeItem("access_token");
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthContext not found.");
  }

  return context;
}