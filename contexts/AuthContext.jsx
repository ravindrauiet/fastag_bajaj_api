import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  loginWithEmailAndPassword, 
  registerWithEmailAndPassword, 
  logoutUser, 
  updateUserProfile
} from '../api/firebaseAuth';
import {
  createOrUpdateUser,
  getUserData
} from '../api/firestoreApi';
import { serverTimestamp } from 'firebase/firestore';
import dataCache from '../utils/dataCache';

// Create auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component - NO ADMIN LOGIC
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState("");

  // Fetch user profile data from Firestore - OPTIMIZED WITH CACHING
  const fetchUserProfile = async (userId) => {
    try {
      // Check cache first
      const cachedData = dataCache.getUserData(userId);
      if (cachedData) {
        console.log('User profile loaded from cache');
        setUserProfile(cachedData);
        return cachedData;
      }

      // Fetch from Firebase if not cached
      const result = await getUserData(userId);
      if (result.success) {
        console.log('User profile fetched from Firebase');
        setUserProfile(result.user);
        
        // Cache the data
        dataCache.setUserData(userId, result.user);
        
        return result.user;
      } else {
        console.log('Failed to fetch user profile:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Check for existing Firebase session on app start - OPTIMIZED
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in - REGULAR USERS ONLY
        console.log('Auth state changed: user signed in', user.email);
        setUserInfo(user);
        setIsAuthenticated(true);
        
        // Fetch user profile for regular users only
        await fetchUserProfile(user.uid);
        
        console.log('Auth state updated for user:', user.email);
      } else {
        // User is signed out
        console.log('Auth state changed: user signed out');
        setUserInfo(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        
        // Clear cache on logout
        dataCache.clear();
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Login function - OPTIMIZED
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError("");
      
      const result = await loginWithEmailAndPassword(email, password);
      
      if (result.success) {
        setUserInfo(result.user);
        setIsAuthenticated(true);
        
        // Update lastLogin for regular users
        await createOrUpdateUser(result.user.uid, {
          lastLogin: serverTimestamp()
        });
        
        // Fetch user profile from Firestore for regular users
        await fetchUserProfile(result.user.uid);
        
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

  // Register function - REGULAR USERS ONLY
  const register = async ({ email, password, displayName }) => {
    try {
      setIsLoading(true);
      setError("");
      
      const result = await registerWithEmailAndPassword(email, password, { displayName });
      
      if (result.success) {
        setUserInfo(result.user);
        setIsAuthenticated(true);
        
        // Create user profile in Firestore
        await createOrUpdateUser(result.user.uid, {
          email: result.user.email,
          displayName: displayName || result.user.displayName,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        
        // Fetch the created profile
        await fetchUserProfile(result.user.uid);
        
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

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const result = await logoutUser();
      
      if (result.success) {
        setUserInfo(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        
        // Clear cache on logout
        dataCache.clear();
        
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

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      const result = await updateUserProfile(profileData);
      
      if (result.success) {
        // Update local user info
        setUserInfo(prev => ({
          ...prev,
          ...profileData
        }));
        
        // Update Firestore profile
        if (userInfo?.uid) {
          await createOrUpdateUser(userInfo.uid, profileData);
          await fetchUserProfile(userInfo.uid);
        }
        
        return true;
      } else {
        setError(result.error || "Profile update failed");
        return false;
      }
    } catch (e) {
      console.log('Profile update error:', e.message);
      setError(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setIsLoading(true);
      setError("");
      
      const result = await resetPassword(email);
      
      if (result.success) {
        return true;
      } else {
        setError(result.error || "Password reset failed");
        return false;
      }
    } catch (e) {
      console.log('Password reset error:', e.message);
      setError(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    userInfo,
    userProfile,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 