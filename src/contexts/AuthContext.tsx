// src/contexts/AuthContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

// 🛑 IMPORTANT: Define the base URL for your Express backend Auth routes
const API_BASE_URL = 'http://localhost:5000/api/auth'; 

interface User {
  id: string;
  name: string;
  email: string;
  role?: string; // Essential for isAdmin check
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUserAndToken: (userData: User, newToken: string) => void; // For OAuth Callback
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely initialize user state from localStorage
const initializeUser = (): User | null => {
  const storedUser = localStorage.getItem('user');
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(initializeUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // 1. Local Login (via API)
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      
      const { token: newToken, user: userData } = response.data;

      // Update state and persistence
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (error) {
      // Safely extract error message from Axios response or default
      let message = 'Network error or unknown failure';
      if (axios.isAxiosError(error)) {
        message = ((error as any).response?.data as { msg?: string })?.msg || 'API request failed';
      }
      
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 2. OAuth Login Helper (used by OAuthCallback.tsx)
  const setUserAndToken = (userData: User, newToken: string) => {
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
  };
  
  const isAdmin = user?.role === 'admin'; 

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token, 
        isAdmin,
        setUserAndToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}