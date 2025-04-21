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

// Create auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState("");

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (userId) => {
    try {
      const result = await getUserData(userId);
      if (result.success) {
        console.log('User profile fetched:', result.user);
        
        // Set user profile
        setUserProfile(result.user);
        
        // Check if this user is the admin and set the flag accordingly
        if (result.user.email === ADMIN_EMAIL || result.user.isAdmin === true) {
          console.log('Setting isAdmin flag to true from Firestore data');
          setIsAdmin(true);
        }
        
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
        console.log('Auth state changed: user signed in', user.email);
        setUserInfo(user);
        setIsAuthenticated(true);
        
        // Preliminary check if user is admin by email
        const isAdminByEmail = user.email === ADMIN_EMAIL;
        console.log('User authenticated, email:', user.email);
        console.log('Is admin by email check?', isAdminByEmail);
        
        // Set initial admin status by email
        if (isAdminByEmail) {
          setIsAdmin(true);
        }
        
        // Fetch user profile from Firestore which might update the admin status
        const profile = await fetchUserProfile(user.uid);
        
        // Final admin status check after profile is loaded
        console.log('Final admin status after profile load:', isAdmin, 'profile:', profile);
      } else {
        // User is signed out
        console.log('Auth state changed: user signed out');
        setUserInfo(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
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
      
      // Check if login is with admin credentials
      const isAdminLogin = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
      console.log('Login attempt with:', { email, isAdminAttempt: isAdminLogin });
      
      // If trying to log in as admin, handle it directly
      if (isAdminLogin) {
        console.log('Admin login detected');
        // For admin login, we need to sign in with Firebase first
        const result = await loginWithEmailAndPassword(email, password);
        
        if (result.success) {
          console.log('Firebase login successful for admin');
          setUserInfo(result.user);
          setIsAuthenticated(true);
          setIsAdmin(true); // Explicitly set admin status
          
          // Make sure admin user has a profile in Firestore
          const firestoreResult = await createOrUpdateUser(result.user.uid, {
            email: result.user.email,
            displayName: 'Admin User',
            isAdmin: true,
            role: 'admin',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
          
          console.log('Admin Firestore update result:', firestoreResult);
          
          // Fetch the admin profile
          const profileResult = await fetchUserProfile(result.user.uid);
          console.log('Admin profile fetched:', profileResult);
          
          console.log('Admin login successful, isAdmin set to:', isAdmin);
          return true;
        } else {
          console.error('Admin login failed:', result.error);
          setError("Admin login failed. Please check your credentials.");
          return false;
        }
      }
      
      // Regular user login
      const result = await loginWithEmailAndPassword(email, password);
      
      if (result.success) {
        setUserInfo(result.user);
        setIsAuthenticated(true);
        
        // Check if this is the admin email (as a fallback)
        if (result.user.email === ADMIN_EMAIL) {
          console.log('Admin email detected, setting admin privileges');
          setIsAdmin(true);
          
          // Ensure the admin flag is set in Firestore
          await createOrUpdateUser(result.user.uid, {
            isAdmin: true,
            role: 'admin',
            lastLogin: serverTimestamp()
          });
        } else {
          setIsAdmin(false);
        }
        
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
        setIsAdmin(false);
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
        
        // Check if user is admin (should never be true for new registrations)
        setIsAdmin(email === ADMIN_EMAIL);
        
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
    isAdmin,
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