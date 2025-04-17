import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  loginWithEmailAndPassword, 
  registerWithEmailAndPassword, 
  logoutUser, 
  updateUserProfile
} from '../api/firebaseAuth';

// Create auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");

  // Check for existing Firebase session on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUserInfo(user);
        setIsAuthenticated(true);
      } else {
        // User is signed out
        setUserInfo(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Login function
  const login = async ({ email, password }) => {
    try {
      setError("");
      setIsLoading(true);
      
      const result = await loginWithEmailAndPassword(email, password);
      
      if (result.success) {
        setUserInfo(result.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setError(result.error || "Login failed");
        return false;
      }
    } catch (e) {
      console.log('Login error:', e.message);
      setError(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const result = await logoutUser();
      
      if (result.success) {
        setUserInfo(null);
        setIsAuthenticated(false);
        return true;
      } else {
        setError(result.error || "Logout failed");
        return false;
      }
    } catch (e) {
      console.log('Logout error:', e.message);
      setError(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError("");
      setIsLoading(true);
      
      const { email, password, firstName, lastName } = userData;
      const displayName = `${firstName} ${lastName}`;
      
      const result = await registerWithEmailAndPassword(email, password, { 
        displayName 
      });
      
      if (result.success) {
        // Update profile with additional information if needed
        await updateUserProfile({ 
          displayName
        });
        
        setUserInfo(result.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setError(result.error || "Registration failed");
        return false;
      }
    } catch (e) {
      console.log('Registration error:', e.message);
      setError(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // The context value that will be supplied to any descendants of this provider
  const authContext = {
    isAuthenticated,
    isLoading,
    userInfo,
    login,
    logout,
    register,
    error
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}; 