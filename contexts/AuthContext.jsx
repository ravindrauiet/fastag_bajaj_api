import React, { createContext, useState, useContext, useEffect } from 'react';
// Temporary approach without AsyncStorage

// Create auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // Check for existing login on app start (simulated)
  useEffect(() => {
    // Simulate checking for authentication - for now, always start logged out
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Login function
  const login = async (userData) => {
    try {
      // Store user data in state only (no persistence for now)
      setUserInfo(userData);
      setIsAuthenticated(true);
      return true;
    } catch (e) {
      console.log('Login error:', e);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear user data from state
      setUserInfo(null);
      setIsAuthenticated(false);
      return true;
    } catch (e) {
      console.log('Logout error:', e);
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      // In a real app, you would call your API to register the user
      // For now just return success
      return true;
    } catch (e) {
      console.log('Registration error:', e);
      return false;
    }
  };

  // The context value that will be supplied to any descendants of this provider
  const authContext = {
    isAuthenticated,
    isLoading,
    userInfo,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}; 