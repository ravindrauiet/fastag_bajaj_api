import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';

// Collection name for FastTag inventory
const FASTAG_COLLECTION = 'fastags';

/**
 * Add a new FastTag to the inventory
 * @param {Object} fastagData - FastTag data object
 * @param {string} fastagData.serialNo - FastTag serial number
 * @param {string} fastagData.tid - FastTag TID (optional)
 * @param {string} fastagData.mobileNo - Customer mobile number (optional)
 * @param {string} fastagData.vehicleNo - Vehicle number (optional)
 * @param {string} fastagData.assignedTo - Admin ID the FastTag is assigned to (optional)
 * @returns {Promise<Object>} Result with FastTag ID
 */
export const addFastag = async (fastagData) => {
  try {
    // Get current user (if authenticated)
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!fastagData.serialNo) {
      throw new Error('Serial number is required');
    }
    
    // Check if this serial number already exists
    const existingTag = await getTagBySerialNo(fastagData.serialNo);
    if (existingTag.success && existingTag.fastag) {
      return {
        success: false,
        error: 'A FastTag with this serial number already exists',
        existingId: existingTag.fastag.id
      };
    }
    
    // Create the FastTag document
    const fastagDoc = {
      serialNo: fastagData.serialNo,
      tid: fastagData.tid || null,
      status: fastagData.status || 'available', // available, assigned, active, inactive
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Customer info (if available)
      mobileNo: fastagData.mobileNo || null,
      vehicleNo: fastagData.vehicleNo || null,
      name: fastagData.name || null,
      walletId: fastagData.walletId || null,
      
      // Vehicle details (if available)
      chassisNo: fastagData.chassisNo || null,
      engineNo: fastagData.engineNo || null,
      
      // Assignment info
      assignedTo: fastagData.assignedTo || null,
      assignedBy: user ? user.uid : null,
      assignedAt: fastagData.assignedTo ? serverTimestamp() : null,
      
      // Activation details
      activatedAt: null,
      
      // Track creator
      createdBy: user ? {
        uid: user.uid,
        displayName: user.displayName || null,
        email: user.email || null
      } : null
    };
    
    const docRef = await addDoc(collection(db, FASTAG_COLLECTION), fastagDoc);
    
    return {
      success: true,
      fastagId: docRef.id
    };
  } catch (error) {
    console.error('Error adding FastTag:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update an existing FastTag
 * @param {string} fastagId - FastTag ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Result
 */
export const updateFastag = async (fastagId, updateData) => {
  try {
    const fastagRef = doc(db, FASTAG_COLLECTION, fastagId);
    
    // Check if the FastTag exists
    const fastagSnapshot = await getDoc(fastagRef);
    
    if (!fastagSnapshot.exists()) {
      return {
        success: false,
        error: 'FastTag not found'
      };
    }
    
    // Add updated timestamp
    updateData.updatedAt = serverTimestamp();
    
    // If we're assigning this FastTag
    if (updateData.assignedTo && !fastagSnapshot.data().assignedTo) {
      const auth = getAuth();
      const user = auth.currentUser;
      
      updateData.assignedBy = user ? user.uid : null;
      updateData.assignedAt = serverTimestamp();
      updateData.status = 'assigned';
    }
    
    // If we're activating this FastTag
    if (updateData.status === 'active' && fastagSnapshot.data().status !== 'active') {
      updateData.activatedAt = serverTimestamp();
    }
    
    await updateDoc(fastagRef, updateData);
    
    return {
      success: true,
      fastagId
    };
  } catch (error) {
    console.error('Error updating FastTag:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get FastTag by ID
 * @param {string} fastagId - FastTag ID
 * @returns {Promise<Object>} FastTag data
 */
export const getFastag = async (fastagId) => {
  try {
    const fastagRef = doc(db, FASTAG_COLLECTION, fastagId);
    const fastagSnapshot = await getDoc(fastagRef);
    
    if (fastagSnapshot.exists()) {
      return {
        success: true,
        fastag: {
          id: fastagId,
          ...fastagSnapshot.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'FastTag not found'
      };
    }
  } catch (error) {
    console.error('Error getting FastTag:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get FastTag by serial number
 * @param {string} serialNo - FastTag serial number
 * @returns {Promise<Object>} FastTag data
 */
export const getTagBySerialNo = async (serialNo) => {
  try {
    const fastagRef = collection(db, FASTAG_COLLECTION);
    const q = query(fastagRef, where('serialNo', '==', serialNo));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Return the first match (should be only one)
      const doc = querySnapshot.docs[0];
      return {
        success: true,
        fastag: {
          id: doc.id,
          ...doc.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'FastTag not found with this serial number'
      };
    }
  } catch (error) {
    console.error('Error getting FastTag by serial number:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all FastTags assigned to a specific admin
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object>} List of FastTags
 */
export const getTagsByAdmin = async (adminId) => {
  try {
    const fastagRef = collection(db, FASTAG_COLLECTION);
    const q = query(fastagRef, where('assignedTo', '==', adminId));
    const querySnapshot = await getDocs(q);
    
    const fastags = [];
    querySnapshot.forEach((doc) => {
      fastags.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      fastags
    };
  } catch (error) {
    console.error('Error getting FastTags by admin:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all FastTags with a specific status
 * @param {string} status - Status to filter by (available, assigned, active, inactive)
 * @returns {Promise<Object>} List of FastTags
 */
export const getTagsByStatus = async (status) => {
  try {
    const fastagRef = collection(db, FASTAG_COLLECTION);
    const q = query(fastagRef, where('status', '==', status));
    const querySnapshot = await getDocs(q);
    
    const fastags = [];
    querySnapshot.forEach((doc) => {
      fastags.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      fastags
    };
  } catch (error) {
    console.error('Error getting FastTags by status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  addFastag,
  updateFastag,
  getFastag,
  getTagBySerialNo,
  getTagsByAdmin,
  getTagsByStatus
}; 