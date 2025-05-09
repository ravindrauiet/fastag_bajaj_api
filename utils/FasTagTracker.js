import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth';

// Collection names
const FASTAG_REGISTRATIONS_COLLECTION = 'fastagRegistrations';
const REGISTRATION_STAGES_COLLECTION = 'registrationStages';

// Registration stages in order
export const STAGES = {
  VALIDATE_CUSTOMER: 'validate-customer',
  VALIDATE_OTP: 'validate-otp',
  DOCUMENT_UPLOAD: 'document-upload',
  MANUAL_ACTIVATION: 'manual-activation',
  FASTAG_REGISTRATION: 'fastag-registration'
};

// Registration status values
export const STATUS = {
  STARTED: 'started',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PENDING: 'pending'
};

/**
 * Track a FasTag registration stage
 * @param {string} stage - The stage name (from STAGES)
 * @param {Object} data - The form data submitted at this stage
 * @param {string} [registrationId] - Optional existing registration ID to update
 * @param {string} [sessionId] - Optional session ID from API responses
 * @returns {Promise<Object>} Result with registration ID
 */
export const trackRegistrationStage = async (stage, data, registrationId = null, sessionId = null) => {
  try {
    // Get current user (if authenticated)
    const auth = getAuth();
    const user = auth.currentUser;
    
    // Create registration data with user information when available
    const now = serverTimestamp();
    const stageData = {
      stage,
      data,
      status: STATUS.COMPLETED,
      timestamp: now,
      stageCompletedAt: now,
      sessionId: sessionId || data.sessionId || null,
    };
    
    // Add user information if authenticated
    if (user) {
      stageData.user = {
        uid: user.uid,
        displayName: user.displayName || null,
        email: user.email || null
      };
    }
    
    let result;
    
    // If we have a registration ID, update the existing registration
    if (registrationId) {
      result = await updateExistingRegistration(registrationId, stage, stageData);
    } else {
      // Otherwise, start a new registration
      result = await createNewRegistration(stage, stageData);
    }
    
    return result;
  } catch (error) {
    console.error('Error tracking registration stage:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create a new registration entry
 * @param {string} stage - Current stage
 * @param {Object} stageData - Stage data
 * @returns {Promise<Object>} Result with registration ID
 */
const createNewRegistration = async (stage, stageData) => {
  // Create the main registration document
  const registrationData = {
    currentStage: stage,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stages: {
      [stage]: stageData
    },
    // Track if the user was authenticated
    isAuthenticated: !!stageData.user,
    // Add user data if available
    ...(stageData.user ? { user: stageData.user } : {})
  };
  
  // Add mobile number for easier querying
  if (stageData.data && stageData.data.mobileNo) {
    registrationData.mobileNo = stageData.data.mobileNo;
  }
  
  // Add vehicle number for easier querying
  if (stageData.data && stageData.data.vehicleNo) {
    registrationData.vehicleNo = stageData.data.vehicleNo;
  }
  
  // Create the registration document
  const docRef = await addDoc(collection(db, FASTAG_REGISTRATIONS_COLLECTION), registrationData);
  
  // Also save the stage to a separate collection for analytics
  await addDoc(collection(db, REGISTRATION_STAGES_COLLECTION), {
    registrationId: docRef.id,
    ...stageData
  });
  
  return {
    success: true,
    registrationId: docRef.id,
    isNew: true
  };
};

/**
 * Update an existing registration with a new stage
 * @param {string} registrationId - Registration ID
 * @param {string} stage - Current stage
 * @param {Object} stageData - Stage data
 * @returns {Promise<Object>} Result with registration ID
 */
const updateExistingRegistration = async (registrationId, stage, stageData) => {
  // Get the registration document reference
  const registrationRef = doc(db, FASTAG_REGISTRATIONS_COLLECTION, registrationId);
  
  // Check if the registration exists
  const registrationSnapshot = await getDoc(registrationRef);
  
  if (!registrationSnapshot.exists()) {
    // Registration doesn't exist, create a new one instead
    return createNewRegistration(stage, stageData);
  }
  
  // Add the new stage to the existing registration
  const updateData = {
    currentStage: stage,
    updatedAt: serverTimestamp(),
    [`stages.${stage}`]: stageData
  };
  
  // Update user information if authenticated and not previously set
  if (stageData.user && !registrationSnapshot.data().user) {
    updateData.user = stageData.user;
    updateData.isAuthenticated = true;
  }
  
  // Add mobile number for easier querying
  if (stageData.data && stageData.data.mobileNo && !registrationSnapshot.data().mobileNo) {
    updateData.mobileNo = stageData.data.mobileNo;
  }
  
  // Add vehicle number for easier querying
  if (stageData.data && stageData.data.vehicleNo && !registrationSnapshot.data().vehicleNo) {
    updateData.vehicleNo = stageData.data.vehicleNo;
  }
  
  // Update the registration document
  await updateDoc(registrationRef, updateData);
  
  // Also save the stage to the stages collection for analytics
  await addDoc(collection(db, REGISTRATION_STAGES_COLLECTION), {
    registrationId,
    ...stageData
  });
  
  return {
    success: true,
    registrationId,
    isNew: false
  };
};

/**
 * Get a registration by ID
 * @param {string} registrationId - Registration ID
 * @returns {Promise<Object>} Registration data
 */
export const getRegistration = async (registrationId) => {
  try {
    const registrationRef = doc(db, FASTAG_REGISTRATIONS_COLLECTION, registrationId);
    const registrationSnapshot = await getDoc(registrationRef);
    
    if (registrationSnapshot.exists()) {
      return {
        success: true,
        registration: {
          id: registrationId,
          ...registrationSnapshot.data()
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
 * @returns {Promise<Object>} List of matching registrations
 */
export const getRegistrationsByMobile = async (mobileNo) => {
  try {
    const registrationsRef = collection(db, FASTAG_REGISTRATIONS_COLLECTION);
    const q = query(registrationsRef, where('mobileNo', '==', mobileNo));
    const querySnapshot = await getDocs(q);
    
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
 * @param {string} userId - User ID
 * @returns {Promise<Object>} List of matching registrations
 */
export const getRegistrationsByUser = async (userId) => {
  try {
    const registrationsRef = collection(db, FASTAG_REGISTRATIONS_COLLECTION);
    const q = query(registrationsRef, where('user.uid', '==', userId));
    const querySnapshot = await getDocs(q);
    
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

export default {
  trackRegistrationStage,
  getRegistration,
  getRegistrationsByMobile,
  getRegistrationsByUser,
  STAGES,
  STATUS
}; 