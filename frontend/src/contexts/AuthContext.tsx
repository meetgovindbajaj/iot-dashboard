"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, AuthState } from "@/types";
import { authApi } from "@/utils/api";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  forceLogoutAll: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = () => {
      const token = Cookies.get("token");
      const userData = Cookies.get("user");

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user, token },
          });
        } catch (error) {
          console.error("Error parsing user data:", error);
          logout();
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await authApi.login({ email, password });
      const { access_token, user } = response.data;

      // Store in cookies
      Cookies.set("token", access_token, { expires: 1 });
      Cookies.set("user", JSON.stringify(user), { expires: 1 });

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token: access_token },
      });

      toast.success(`Welcome back, ${user.name}!`);
    } catch (error: any) {
      dispatch({ type: "LOGIN_FAILURE" });
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    dispatch({ type: "LOGIN_START" });

    try {
      await authApi.register({ email, password, name });
      toast.success("Registration successful! Please log in.");
      dispatch({ type: "LOGIN_FAILURE" });
    } catch (error: any) {
      dispatch({ type: "LOGIN_FAILURE" });
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const forceLogoutAll = () => {
    logout();
    // In a real app, you'd call an API to invalidate all sessions
    // For now, just redirect to login
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, forceLogoutAll }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
