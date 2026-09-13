"use client";
import {
  createContext,
  createElement,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import apiClient from "@/lib/api/client";
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  wallet_id?: string;
  is_admin: boolean;
  created_at?: string;
  advertiser?: { id: number; status: string; balance: string };
  publisher?: {
    id: number;
    status: string;
    website_url: string;
    website_name: string;
    commission_offer?: import("@/components/publisher/PublisherOffer").CommissionOffer;
  };
}
interface AuthState {
  user: User | null;
  isAuthenticated: boolean | null;
  isLoading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}
const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: null,
  isLoading: true,
  error: false,
  refresh: async () => {},
});
let pending: Promise<User> | null = null;
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    user: null as User | null,
    isAuthenticated: null as boolean | null,
    isLoading: true,
    error: false,
  });
  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: false,
      });
      return;
    }
    try {
      pending ||= apiClient
        .get("/auth/user")
        .then((r) => r.data.data)
        .finally(() => {
          pending = null;
        });
      const user = await pending;
      if (!localStorage.getItem("token")) return;
      setState({ user, isAuthenticated: true, isLoading: false, error: false });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("token");
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: false,
        });
      } else setState((s) => ({ ...s, isLoading: false, error: true }));
    }
  }, []);
  useEffect(() => {
    void refresh();
    const listener = () => {
      void refresh();
    };
    window.addEventListener("authStateChanged", listener);
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener("authStateChanged", listener);
      window.removeEventListener("storage", listener);
    };
  }, [refresh]);
  return createElement(
    AuthContext.Provider,
    { value: { ...state, refresh } },
    children,
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
