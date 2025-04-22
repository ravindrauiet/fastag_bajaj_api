import { Alert, Platform } from 'react-native';
import FormLogger from '../utils/FormLogger';
import { FORM_TYPES } from '../utils/FormTracker';

/**
 * Shows an error alert with the given message and handles logging
 * @param {string} title - The alert title
 * @param {string} message - The error message to display
 * @param {Function} onOk - Optional callback when OK is pressed
 * @param {boolean} allowContinue - Whether to allow the user to continue or just acknowledge the error
 */
export const showErrorAlert = (title, message, onOk = null, allowContinue = true) => {
  Alert.alert(
    title,
    message,
    [{ 
      text: allowContinue ? 'Continue' : 'OK', 
      onPress: onOk 
    }]
  );
};

/**
 * Handles API errors consistently across the app
 * @param {Error} error - The error object
 * @param {string} operation - Description of the operation that failed
 * @param {object} formData - Optional form data for logging
 * @param {string} formType - Form type from FORM_TYPES for logging
 * @param {string} actionName - Name of the action for logging
 * @param {Function} onOk - Optional callback when OK is pressed
 * @param {boolean} allowContinue - Whether to allow the user to continue or just acknowledge the error
 */
export const handleApiError = async (
  error, 
  operation = 'Operation', 
  formData = {}, 
  formType = null,
  actionName = 'api_call',
  onOk = null,
  allowContinue = true
) => {
  console.error(`${operation} error:`, error);
  
  // Get the error message from various possible sources
  const errorMessage = error.response?.errorDesc || 
                       error.response?.response?.errorDesc || 
                       error.message || 
                      `Failed to perform ${operation}`;
  
  // Show an alert with the error message
  showErrorAlert(
    `${operation} Failed`,
    `${errorMessage}. ${allowContinue ? 'You can try again later.' : ''}`,
    onOk,
    allowContinue
  );
  
  // Log the error if form type is provided
  if (formType && Object.values(FORM_TYPES).includes(formType)) {
    try {
      await FormLogger.logFormAction(
        formType,
        {
          ...formData,
          error: errorMessage,
          apiSuccess: false
        },
        actionName,
        'error',
        error
      );
    } catch (loggingError) {
      console.error('Error logging failure:', loggingError);
    }
  }
  
  // Return false to indicate failure (useful for function chaining)
  return false;
};

export default {
  showErrorAlert,
  handleApiError
}; 