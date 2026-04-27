"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Defines the shape of the authentication context
type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

// Create the context with default values
// These defaults are mainly placeholders before the provider initializes
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  token: null,
  login: async () => false,
  logout: () => {},
});

// Provider component that wraps the app and supplies auth state
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  // On initial load, check localStorage for an existing token
  // This allows the user to stay logged in after refreshing the page
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) setToken(stored);
  }, []);

  // Handles user login by sending credentials to the backend
  const login = async (username: string, password: string): Promise<boolean> => {
    // FastAPI OAuth2 expects form-encoded data rather than JSON
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await fetch("http://localhost:8000/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      // If the request fails, return false so the UI can handle it
      if (!res.ok) return false;

      const data = await res.json();
      const accessToken = data.access_token;

      // Save token to localStorage so it persists across page reloads
      localStorage.setItem("token", accessToken);
      setToken(accessToken);

      return true;
    } catch {
      // Network or unexpected error
      return false;
    }
  };

  // Clears authentication state and removes token from storage
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token, // converts token to boolean
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing auth context throughout the app
export const useAuth = () => useContext(AuthContext);