import { auth } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - User credential
 */
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data
 * @returns {Promise} - User credential
 */
export const registerWithEmailAndPassword = async (email, password, userData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // If additional userData is provided, update the user profile
    if (userData.displayName) {
      await updateProfile(userCredential.user, {
        displayName: userData.displayName
      });
    }
    
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Log out the current user
 * @returns {Promise}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user profile (display name, etc.)
 * @param {Object} profileData - Data to update
 * @returns {Promise}
 */
export const updateUserProfile = async (profileData) => {
  try {
    if (!auth.currentUser) {
      throw new Error('No authenticated user found');
    }
    
    await updateProfile(auth.currentUser, profileData);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user email
 * @param {string} email - New email address
 * @returns {Promise}
 */
export const updateUserEmail = async (email) => {
  try {
    if (!auth.currentUser) {
      throw new Error('No authenticated user found');
    }
    
    await updateEmail(auth.currentUser, email);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Reauthenticate user (required for sensitive operations)
 * @param {string} password - Current password
 * @returns {Promise}
 */
export const reauthenticateUser = async (password) => {
  try {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No authenticated user found');
    }
    
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise}
 */
export const updateUserPassword = async (newPassword) => {
  try {
    if (!auth.currentUser) {
      throw new Error('No authenticated user found');
    }
    
    await updatePassword(auth.currentUser, newPassword);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}; 