"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Load user from cache immediately
  const getCachedUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem("user");
      const cacheTime = localStorage.getItem("user-cache-time");
      if (cached && cacheTime) {
        // User cache doesn't expire (only on logout)
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to load cached user:', e);
    }
    return null;
  };

  const [user, setUser] = useState<User | null>(getCachedUser());
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // On mount, verify cached user is still valid
    const cachedUser = getCachedUser();
    if (cachedUser) {
      setUser(cachedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("user-cache-time", Date.now().toString());
    } catch (e) {
      console.error('Failed to cache user:', e);
    }
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("user-cache-time");
      // Clear all dashboard caches on logout
      localStorage.removeItem("admin-dashboard-cache");
      localStorage.removeItem("admin-dashboard-cache-time");
      localStorage.removeItem("user-bookings-cache");
      localStorage.removeItem("user-bookings-cache-time");
    } catch (e) {
      console.error('Failed to clear cache:', e);
    }
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
