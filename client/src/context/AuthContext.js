import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { loginUser, registerUser, getCurrentUser, deleteAccountRequest } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On first load, if a token exists, verify it and fetch the user profile
  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await getCurrentUser();
        setUser(res.data);
        setToken(storedToken);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await loginUser({ email, password });
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    setError(null);
    try {
      const res = await registerUser({ fullName, email, password });
      const { token: newToken, ...userData } = res.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Permanently deletes the account + all transactions, then clears the session
  const deleteAccount = useCallback(async (password) => {
    try {
      await deleteAccountRequest(password);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Could not delete account. Please try again.' };
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    error,
    login,
    register,
    logout,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
