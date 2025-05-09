import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getDoc,
  doc,
  startAfter
} from 'firebase/firestore';
import { db } from '../services/firebase';

// Collection names
const FASTAG_REGISTRATIONS_COLLECTION = 'fastagRegistrations';
const REGISTRATION_STAGES_COLLECTION = 'registrationStages';

/**
 * Get all FasTag registrations with pagination
 * @param {Object} options - Query options
 * @param {number} [options.limit=20] - Maximum number of results
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.stage] - Filter by current stage
 * @param {string} [options.mobileNo] - Filter by mobile number
 * @param {string} [options.vehicleNo] - Filter by vehicle number
 * @param {string} [options.startAfter] - Pagination cursor (document ID)
 * @returns {Promise<Object>} Result with registrations array
 */
export const getAllRegistrations = async (options = {}) => {
  try {
    const {
      limitVal = 20,
      status,
      stage,
      mobileNo,
      vehicleNo,
      startAfter: startAfterId
    } = options;
    
    // Start with the base collection reference
    let q = query(
      collection(db, FASTAG_REGISTRATIONS_COLLECTION),
      orderBy('updatedAt', 'desc'),
      limit(limitVal)
    );
    
    // Apply filters if provided
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    if (stage) {
      q = query(q, where('currentStage', '==', stage));
    }
    
    if (mobileNo) {
      q = query(q, where('mobileNo', '==', mobileNo));
    }
    
    if (vehicleNo) {
      q = query(q, where('vehicleNo', '==', vehicleNo));
    }
    
    // Apply pagination cursor if provided
    if (startAfterId) {
      const startAfterDoc = await getDoc(doc(db, FASTAG_REGISTRATIONS_COLLECTION, startAfterId));
      if (startAfterDoc.exists()) {
        q = query(q, startAfter(startAfterDoc));
      }
    }
    
    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Map the documents to an array of registrations
    const registrations = [];
    querySnapshot.forEach((doc) => {
      registrations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last visible document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      success: true,
      registrations,
      lastVisible: lastVisible ? lastVisible.id : null,
      hasMore: querySnapshot.docs.length === limitVal
    };
  } catch (error) {
    console.error('Error getting registrations:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get a single FasTag registration by ID
 * @param {string} registrationId - Registration ID
 * @returns {Promise<Object>} Result with registration data
 */
export const getRegistrationById = async (registrationId) => {
  try {
    if (!registrationId) {
      throw new Error('Registration ID is required');
    }
    
    const registrationRef = doc(db, FASTAG_REGISTRATIONS_COLLECTION, registrationId);
    const registrationDoc = await getDoc(registrationRef);
    
    if (registrationDoc.exists()) {
      return {
        success: true,
        registration: {
          id: registrationId,
          ...registrationDoc.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Registration not found'
      };
    }
  } catch (error) {
    console.error('Error getting registration:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get registrations by mobile number
 * @param {string} mobileNo - Mobile number
 * @param {number} [maxResults=10] - Maximum number of results
 * @returns {Promise<Object>} Result with registrations array
 */
export const getRegistrationsByMobile = async (mobileNo, maxResults = 10) => {
  try {
    if (!mobileNo) {
      throw new Error('Mobile number is required');
    }
    
    const registrationsRef = query(
      collection(db, FASTAG_REGISTRATIONS_COLLECTION),
      where('mobileNo', '==', mobileNo),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(registrationsRef);
    
    const registrations = [];
    querySnapshot.forEach((doc) => {
      registrations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      registrations
    };
  } catch (error) {
    console.error('Error getting registrations by mobile:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get registrations by user ID
 * @param {string} userId - Firebase Auth UID
 * @param {number} [maxResults=10] - Maximum number of results
 * @returns {Promise<Object>} Result with registrations array
 */
export const getRegistrationsByUser = async (userId, maxResults = 10) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const registrationsRef = query(
      collection(db, FASTAG_REGISTRATIONS_COLLECTION),
      where('user.uid', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(registrationsRef);
    
    const registrations = [];
    querySnapshot.forEach((doc) => {
      registrations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      registrations
    };
  } catch (error) {
    console.error('Error getting registrations by user:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all registration stages by registration ID
 * @param {string} registrationId - Registration ID
 * @returns {Promise<Object>} Result with stages array
 */
export const getRegistrationStages = async (registrationId) => {
  try {
    if (!registrationId) {
      throw new Error('Registration ID is required');
    }
    
    const stagesRef = query(
      collection(db, REGISTRATION_STAGES_COLLECTION),
      where('registrationId', '==', registrationId),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(stagesRef);
    
    const stages = [];
    querySnapshot.forEach((doc) => {
      stages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      stages
    };
  } catch (error) {
    console.error('Error getting registration stages:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  getAllRegistrations,
  getRegistrationById,
  getRegistrationsByMobile,
  getRegistrationsByUser,
  getRegistrationStages
}; 