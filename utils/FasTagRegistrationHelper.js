import FasTagTracker from './FasTagTracker';
import { getAuth } from 'firebase/auth';

/**
 * Helper functions to integrate FasTag tracking with existing screens
 * without modifying them directly.
 * 
 * This adds a layer of tracking on top of the existing form submissions.
 */

/**
 * Track the ValidateCustomer stage
 * @param {Object} formData - Data from the ValidateCustomer form
 * @param {string} [registrationId] - Optional registration ID to update
 * @returns {Promise<Object>} Result with registration ID
 */
export const trackValidateCustomer = async (formData, registrationId = null) => {
  return await FasTagTracker.trackRegistrationStage(
    FasTagTracker.STAGES.VALIDATE_CUSTOMER,
    formData,
    registrationId
  );
};

/**
 * Track the ValidateOTP stage
 * @param {Object} formData - Data from the ValidateOTP form
 * @param {string} [registrationId] - Optional registration ID to update
 * @returns {Promise<Object>} Result with registration ID
 */
export const trackValidateOtp = async (formData, registrationId = null) => {
  return await FasTagTracker.trackRegistrationStage(
    FasTagTracker.STAGES.VALIDATE_OTP,
    formData,
    registrationId,
    formData.sessionId // Include session ID if available
  );
};

/**
 * Track the DocumentUpload stage
 * @param {Object} formData - Data from the DocumentUpload form
 * @param {string} [registrationId] - Optional registration ID to update
 * @returns {Promise<Object>} Result with registration ID
 */
export const trackDocumentUpload = async (formData, registrationId = null) => {
  return await FasTagTracker.trackRegistrationStage(
    FasTagTracker.STAGES.DOCUMENT_UPLOAD,
    formData,
    registrationId,
    formData.sessionId // Include session ID if available
  );
};

/**
 * Track the ManualActivation stage
 * @param {Object} formData - Data from the ManualActivation form
 * @param {string} [registrationId] - Optional registration ID to update
 * @returns {Promise<Object>} Result with registration ID
 */
export const trackManualActivation = async (formData, registrationId = null) => {
  return await FasTagTracker.trackRegistrationStage(
    FasTagTracker.STAGES.MANUAL_ACTIVATION,
    formData,
    registrationId,
    formData.sessionId // Include session ID if available
  );
};

/**
 * Track the FasTagRegistration stage (final stage)
 * @param {Object} formData - Data from the FasTagRegistration form
 * @param {string} [registrationId] - Optional registration ID to update
 * @returns {Promise<Object>} Result with registration ID
 */
export const trackFasTagRegistration = async (formData, registrationId = null) => {
  return await FasTagTracker.trackRegistrationStage(
    FasTagTracker.STAGES.FASTAG_REGISTRATION,
    formData,
    registrationId,
    formData.sessionId || formData.regDetails?.sessionId // Include session ID if available
  );
};

/**
 * Get currently logged in user info or null if not logged in
 * @returns {Object|null} User info or null
 */
export const getCurrentUserInfo = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  return {
    uid: user.uid,
    displayName: user.displayName || null,
    email: user.email || null,
    photoURL: user.photoURL || null
  };
};

export default {
  trackValidateCustomer,
  trackValidateOtp,
  trackDocumentUpload,
  trackManualActivation,
  trackFasTagRegistration,
  getCurrentUserInfo
}; 