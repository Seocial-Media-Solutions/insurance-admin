import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const data = await authService.getCurrentUser();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        // Only clear user if it's explicitly an auth error (401)
        if (error.response?.status === 401) {
          setUser(null);
        }
        // Other errors (rate limits, server errors) shouldn't necessarily log the user out
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success && !data.otpRequired) {
      setUser(data.user);
    }
    return data; // Return data so caller can check if otpRequired
  };

  const verifyOTP = async (otpData) => {
    const data = await authService.verifyOTP(otpData);
    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  const resendOTP = async (otpToken) => {
    const data = await authService.resendOTP(otpToken);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyOTP, resendOTP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
