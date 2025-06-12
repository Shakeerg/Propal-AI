"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  isAuthReady: boolean;
  login: (email: string, rememberMe: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserEmail = localStorage.getItem("userEmail");
      const storedRememberMeToken = localStorage.getItem("rememberMeToken");
      if (storedUserEmail && storedRememberMeToken === "true") {
        setIsLoggedIn(true);
        setUserEmail(storedUserEmail);
      }
      setIsAuthReady(true);
    }
  }, []);

  const login = (email: string, rememberMe: boolean) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    if (rememberMe) {
      localStorage.setItem("userEmail", email);
      localStorage.setItem("rememberMeToken", "true");
    }
    router.push("/dashboard/agent");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("rememberMeToken");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, isAuthReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}