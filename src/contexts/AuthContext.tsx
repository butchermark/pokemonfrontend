import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

/**
 * Provide a non-undefined context value via the custom hook `useAuth`.
 * We keep the initial createContext value `undefined` to force consumers
 * to use the hook and ensure a provider is present.
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - holds authentication state and exposes login/register/logout
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const STORAGE_TOKEN_KEY = "accessToken";
  const STORAGE_USER_KEY = "user";

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const savedUser = localStorage.getItem(STORAGE_USER_KEY);

    if (savedToken) {
      setAccessToken(savedToken);
      authService.setAuthToken(savedToken);
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response: AuthResponse = await authService.login(credentials);

      setUser(response.user);
      setAccessToken(response.accessToken);

      localStorage.setItem(STORAGE_TOKEN_KEY, response.accessToken);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.user));

      authService.setAuthToken(response.accessToken);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      const response: AuthResponse = await authService.register(credentials);

      setUser(response.user);
      setAccessToken(response.accessToken);

      localStorage.setItem(STORAGE_TOKEN_KEY, response.accessToken);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.user));

      authService.setAuthToken(response.accessToken);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    setAccessToken(null);

    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);

    authService.clearAuthToken();
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    login,
    register,
    logout,

    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to consume AuthContext — throws if used outside of provider.
 * Use this in your components instead of useContext(AuthContext).
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
