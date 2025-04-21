import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Create or update a user document in Firestore
 * @param {string} userId - Firebase Auth UID
 * @param {Object} userData - User data to store
 * @returns {Promise} - Result of the operation
 */
export const createOrUpdateUser = async (userId, userData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Reference to the user document
    const userRef = doc(db, 'users', userId);
    
    // Check if the document already exists
    const userDoc = await getDoc(userRef);
    
    // Create data object with timestamp
    let dataToSave = {
      ...userData,
      updatedAt: serverTimestamp(),
    };
    
    // If user already exists, make sure we preserve the isAdmin flag
    // Specifically handle admin@gmail.com to always have isAdmin=true
    if (userDoc.exists()) {
      const existingData = userDoc.data();
      
      // If updating admin user, always keep isAdmin as true
      if (existingData.email === 'admin@gmail.com' || userData.email === 'admin@gmail.com') {
        dataToSave.isAdmin = true;
      } 
      // Otherwise, preserve the existing isAdmin flag if not explicitly set in userData
      else if (existingData.isAdmin && !userData.hasOwnProperty('isAdmin')) {
        dataToSave.isAdmin = existingData.isAdmin;
      }
    } else {
      // It's a new user, add creation timestamp
      dataToSave.createdAt = serverTimestamp();
      
      // If it's admin@gmail.com, ensure isAdmin is true
      if (userData.email === 'admin@gmail.com') {
        dataToSave.isAdmin = true;
      }
    }
    
    // Set or update the user document
    await setDoc(userRef, dataToSave, { merge: true });
    
    console.log('User data saved:', { userId, isAdmin: dataToSave.isAdmin });
    
    return {
      success: true,
      userId
    };
  } catch (error) {
    console.error('Error creating/updating user: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get a user document from Firestore
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise} - User data
 */
export const getUserData = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Return document data
      const userData = userDoc.data();
      return {
        success: true,
        user: {
          id: userId,
          ...userData
        }
      };
    } else {
      return {
        success: false,
        error: 'User not found'
      };
    }
  } catch (error) {
    console.error('Error getting user data: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all users from Firestore (with optional filtering)
 * @param {Object} filters - Optional query filters
 * @returns {Promise} - Array of user data
 */
export const getAllUsers = async (filters = {}) => {
  try {
    // Start with the users collection reference
    const usersCollectionRef = collection(db, 'users');
    
    // Create a query with any filters
    let usersQuery = usersCollectionRef;
    
    // Apply filters if provided
    if (filters.email) {
      usersQuery = query(usersCollectionRef, where('email', '==', filters.email));
    }
    // Add more filter options as needed
    
    // Execute the query
    const querySnapshot = await getDocs(usersQuery);
    
    // Map the documents to an array of user data
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      users
    };
  } catch (error) {
    console.error('Error getting users: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update a user document in Firestore
 * @param {string} userId - Firebase Auth UID
 * @param {Object} userData - User data to update
 * @returns {Promise} - Result of the operation
 */
export const updateUserData = async (userId, userData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Reference to the user document
    const userRef = doc(db, 'users', userId);
    
    // Update the user document with timestamp
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      userId
    };
  } catch (error) {
    console.error('Error updating user: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete a user document from Firestore
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise} - Result of the operation
 */
export const deleteUserData = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Reference to the user document
    const userRef = doc(db, 'users', userId);
    
    // Delete the user document
    await deleteDoc(userRef);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting user: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get a user by email
 * @param {string} email - User email
 * @returns {Promise} - User data
 */
export const getUserByEmail = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }
    
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Get the first matching document
      const userDoc = querySnapshot.docs[0];
      return {
        success: true,
        user: {
          id: userDoc.id,
          ...userDoc.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'User not found'
      };
    }
  } catch (error) {
    console.error('Error getting user by email: ', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 