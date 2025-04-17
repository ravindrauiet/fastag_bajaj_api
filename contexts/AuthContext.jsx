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

// Create auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState("");

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (userId) => {
    try {
      const result = await getUserData(userId);
      if (result.success) {
        setUserProfile(result.user);
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

  // Check for existing Firebase session on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        setUserInfo(user);
        setIsAuthenticated(true);
        
        // Fetch user profile from Firestore
        await fetchUserProfile(user.uid);
      } else {
        // User is signed out
        setUserInfo(null);
        setUserProfile(null);
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
        
        // Fetch user profile from Firestore
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

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const result = await logoutUser();
      
      if (result.success) {
        setUserInfo(null);
        setUserProfile(null);
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
      
      const { email, password, firstName, lastName, phone } = userData;
      const displayName = `${firstName} ${lastName}`;
      
      const result = await registerWithEmailAndPassword(email, password, { 
        displayName 
      });
      
      if (result.success) {
        // Update profile with additional information if needed
        await updateUserProfile({ 
          displayName
        });
        
        // Store user data in Firestore
        const firestoreData = {
          displayName,
          firstName,
          lastName,
          email,
          phone: phone || '',
          photoURL: result.user.photoURL || '',
        };
        
        await createOrUpdateUser(result.user.uid, firestoreData);
        
        // Set user info
        setUserInfo(result.user);
        setUserProfile({ id: result.user.uid, ...firestoreData });
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

  // Update user profile data
  const updateProfile = async (profileData) => {
    try {
      setError("");
      setIsLoading(true);
      
      if (!userInfo || !userInfo.uid) {
        throw new Error('No authenticated user found');
      }
      
      // Update Firestore user data
      const result = await createOrUpdateUser(userInfo.uid, profileData);
      
      if (result.success) {
        // Update local state
        const updatedProfile = await fetchUserProfile(userInfo.uid);
        
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

  // The context value that will be supplied to any descendants of this provider
  const authContext = {
    isAuthenticated,
    isLoading,
    userInfo,
    userProfile,
    login,
    logout,
    register,
    updateProfile,
    error
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}; 