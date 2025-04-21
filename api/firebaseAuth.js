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
  EmailAuthProvider,
  fetchSignInMethodsForEmail
} from 'firebase/auth';

// Admin credentials for testing
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '123456';

// Check if admin user exists, create if not (for testing purposes)
export const ensureAdminExists = async () => {
  try {
    // Check if the admin email already exists
    const methods = await fetchSignInMethodsForEmail(auth, ADMIN_EMAIL);
    
    if (methods.length === 0) {
      // Admin user doesn't exist, create it
      console.log('Creating admin user for testing...');
      const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      
      // Update the admin user profile
      await updateProfile(userCredential.user, {
        displayName: 'Admin User'
      });
      
      console.log('Admin user created successfully');
      return true;
    }
    
    console.log('Admin user already exists');
    return true;
  } catch (error) {
    // Don't treat email-already-in-use as a fatal error
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists (caught from error)');
      return true;
    }
    
    console.error('Error ensuring admin exists:', error);
    return false;
  }
};

// Call this function early to ensure the admin user exists
ensureAdminExists().catch(console.error);

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - User credential
 */
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    // For admin login, ensure the admin exists first
    if (email === ADMIN_EMAIL) {
      await ensureAdminExists();
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.log('Login error:', error.message);
    
    // If this is an admin login attempt and it failed, try to create the admin account
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      try {
        console.log('Attempting to create admin user on login...');
        await ensureAdminExists();
        
        // Try login again
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
          success: true,
          user: userCredential.user
        };
      } catch (createError) {
        console.error('Admin creation error:', createError);
      }
    }
    
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