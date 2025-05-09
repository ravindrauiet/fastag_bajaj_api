import { saveFormSubmission } from '../api/formSubmissionsApi';
import FasTagTracker, { STAGES } from './FasTagTracker';

/**
 * Form Types in the FasTag Registration Flow
 */
export const FORM_TYPES = {
  VALIDATE_CUSTOMER: 'validate-customer',
  OTP_VERIFICATION: 'otp-verification',
  VEHICLE_DETAILS: 'vehicle-details',
  USER_DETAILS: 'user-details',
  DOCUMENT_UPLOAD: 'document-upload',
  PAYMENT: 'payment-details',
  FASTAG_REGISTRATION: 'fastag-registration',
  FASTAG_REPLACEMENT: 'fastag-replacement',
  VRN_UPDATE: 'vrn-update',
  KYC_VERIFICATION: 'kyc-verification'
};

/**
 * Status Types for form submissions
 */
export const SUBMISSION_STATUS = {
  STARTED: 'started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  PENDING: 'pending'
};

/**
 * Map FormTracker form types to FasTag tracker stages
 */
const FORM_TYPE_TO_STAGE_MAP = {
  [FORM_TYPES.VALIDATE_CUSTOMER]: STAGES.VALIDATE_CUSTOMER,
  [FORM_TYPES.OTP_VERIFICATION]: STAGES.VALIDATE_OTP,
  [FORM_TYPES.DOCUMENT_UPLOAD]: STAGES.DOCUMENT_UPLOAD,
  [FORM_TYPES.FASTAG_REGISTRATION]: STAGES.FASTAG_REGISTRATION
};

/**
 * Save form data at each step of the registration flow
 * 
 * @param {string} formType - Type of form from FORM_TYPES
 * @param {Object} formData - Form data to save
 * @param {string} submissionId - Optional ID to update existing submission
 * @param {string} status - Status from SUBMISSION_STATUS
 * @param {string} fastagRegistrationId - Optional ID for FasTag registration tracking
 * @returns {Promise<Object>} Result with submission ID
 */
export const trackFormSubmission = async (
  formType,
  formData,
  submissionId = null,
  status = SUBMISSION_STATUS.IN_PROGRESS,
  fastagRegistrationId = null
) => {
  try {
    // Add status to the form data
    const enrichedData = {
      ...formData,
      status,
      submissionTimestamp: new Date().toISOString(),
      // Add step tracking information
      registrationStep: getStepNumberForForm(formType),
      stepName: formType
    };
    
    console.log(`Tracking form submission for ${formType}`, enrichedData);
    
    // Save to Firestore using existing method
    const result = await saveFormSubmission(formType, enrichedData, submissionId);
    
    // For completed FasTag registration steps, also track in our new system
    let fastagResult = null;
    if (status === SUBMISSION_STATUS.COMPLETED && FORM_TYPE_TO_STAGE_MAP[formType]) {
      try {
        console.log(`Also tracking in FasTag registration system: ${formType}`);
        fastagResult = await FasTagTracker.trackRegistrationStage(
          FORM_TYPE_TO_STAGE_MAP[formType],
          enrichedData,
          fastagRegistrationId, // Use provided ID if available
          enrichedData.sessionId || null // Include session ID if available
        );
        
        console.log('FasTag tracking result:', fastagResult);
      } catch (trackingError) {
        console.error('Error in FasTag tracking:', trackingError);
        // Don't fail the whole operation if this fails
      }
    }
    
    return {
      ...result,
      fastagRegistrationId: fastagResult?.registrationId || fastagRegistrationId || null
    };
  } catch (error) {
    console.error('Form tracking error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get the step number in the registration flow for a specific form type
 */
export const getStepNumberForForm = (formType) => {
  const stepMap = {
    [FORM_TYPES.VALIDATE_CUSTOMER]: 1,
    [FORM_TYPES.OTP_VERIFICATION]: 2,
    [FORM_TYPES.VEHICLE_DETAILS]: 3,
    [FORM_TYPES.USER_DETAILS]: 4,
    [FORM_TYPES.DOCUMENT_UPLOAD]: 5,
    [FORM_TYPES.PAYMENT]: 6,
    [FORM_TYPES.FASTAG_REGISTRATION]: 7,
    [FORM_TYPES.FASTAG_REPLACEMENT]: 7,
    [FORM_TYPES.VRN_UPDATE]: 7,
    [FORM_TYPES.KYC_VERIFICATION]: 8
  };
  
  return stepMap[formType] || 0;
};

/**
 * Get human-readable name for form type
 */
export const getFormTypeName = (formType) => {
  const nameMap = {
    [FORM_TYPES.VALIDATE_CUSTOMER]: 'Customer Validation',
    [FORM_TYPES.OTP_VERIFICATION]: 'OTP Verification',
    [FORM_TYPES.VEHICLE_DETAILS]: 'Vehicle Details',
    [FORM_TYPES.USER_DETAILS]: 'User Information',
    [FORM_TYPES.DOCUMENT_UPLOAD]: 'Document Upload',
    [FORM_TYPES.PAYMENT]: 'Payment Details',
    [FORM_TYPES.FASTAG_REGISTRATION]: 'FasTag Registration',
    [FORM_TYPES.FASTAG_REPLACEMENT]: 'FasTag Replacement',
    [FORM_TYPES.VRN_UPDATE]: 'VRN Update',
    [FORM_TYPES.KYC_VERIFICATION]: 'KYC Verification'
  };
  
  return nameMap[formType] || 'Unknown Form';
};

/**
 * Get color for form type (for UI display)
 */
export const getFormTypeColor = (formType) => {
  const colorMap = {
    [FORM_TYPES.VALIDATE_CUSTOMER]: '#E3F2FD',
    [FORM_TYPES.OTP_VERIFICATION]: '#E8F5E9',
    [FORM_TYPES.VEHICLE_DETAILS]: '#FFF8E1',
    [FORM_TYPES.USER_DETAILS]: '#F3E5F5',
    [FORM_TYPES.DOCUMENT_UPLOAD]: '#FFEBEE',
    [FORM_TYPES.PAYMENT]: '#E0F7FA',
    [FORM_TYPES.FASTAG_REGISTRATION]: '#F1F8E9',
    [FORM_TYPES.FASTAG_REPLACEMENT]: '#FFF3E0',
    [FORM_TYPES.VRN_UPDATE]: '#F5F5F5',
    [FORM_TYPES.KYC_VERIFICATION]: '#E8EAF6'
  };
  
  return colorMap[formType] || '#F5F5F5';
};

/**
 * Get icon for form type (for UI display)
 */
export const getFormTypeIcon = (formType) => {
  const iconMap = {
    [FORM_TYPES.VALIDATE_CUSTOMER]: '👤',
    [FORM_TYPES.OTP_VERIFICATION]: '📱',
    [FORM_TYPES.VEHICLE_DETAILS]: '🚗',
    [FORM_TYPES.USER_DETAILS]: '👨‍💼',
    [FORM_TYPES.DOCUMENT_UPLOAD]: '📄',
    [FORM_TYPES.PAYMENT]: '💰',
    [FORM_TYPES.FASTAG_REGISTRATION]: '📋',
    [FORM_TYPES.FASTAG_REPLACEMENT]: '🔄',
    [FORM_TYPES.VRN_UPDATE]: '🔢',
    [FORM_TYPES.KYC_VERIFICATION]: '🔐'
  };
  
  return iconMap[formType] || '📝';
};

/**
 * Get status color (for UI display)
 */
export const getStatusColor = (status) => {
  const colorMap = {
    [SUBMISSION_STATUS.STARTED]: '#FFB74D',
    [SUBMISSION_STATUS.IN_PROGRESS]: '#64B5F6',
    [SUBMISSION_STATUS.COMPLETED]: '#81C784',
    [SUBMISSION_STATUS.REJECTED]: '#E57373',
    [SUBMISSION_STATUS.PENDING]: '#FFD54F'
  };
  
  return colorMap[status] || '#9E9E9E';
}; 