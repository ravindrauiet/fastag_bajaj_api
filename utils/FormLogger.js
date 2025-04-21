import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Collection name
const FORM_LOGS_COLLECTION = 'formLogs';

/**
 * Logs form data to Firestore with user info and timestamps
 * @param {string} formType - The type of form being logged
 * @param {Object} formData - The form data to log
 * @param {string} action - The action performed (e.g., 'submit', 'update', 'validate')
 * @param {string} status - The status of the form action (e.g., 'success', 'error', 'pending')
 * @param {Object} [error] - Optional error information if status is 'error'
 * @returns {Promise<Object>} Object containing success status and log document ID
 */
export const logFormAction = async (formType, formData, action, status, error = null) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!formType || !formData) {
      console.error('FormLogger: Missing required parameters');
      return { success: false, error: 'Missing required parameters' };
    }
    
    const timestamp = new Date().toISOString();
    
    const logData = {
      formType,
      formData,
      action,
      status,
      timestamp,
      userId: user ? user.uid : 'guest',
      userEmail: user ? user.email : 'guest',
      createdAt: timestamp,
    };
    
    // Add error information if provided
    if (error && status === 'error') {
      logData.error = {
        message: error.message || String(error),
        code: error.code || 'unknown',
        stack: error.stack || null
      };
    }
    
    // Save to Firestore
    console.log('Saving form log:', logData);
    const docRef = await addDoc(collection(db, FORM_LOGS_COLLECTION), logData);
    
    console.log('Form log saved with ID:', docRef.id);
    return { success: true, logId: docRef.id };
  } catch (error) {
    console.error('Error logging form action:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get form logs by form type
 * @param {string} formType - The type of form to retrieve logs for
 * @param {number} [maxResults=20] - Maximum number of results to return
 * @returns {Promise<Array>} Array of form log entries
 */
export const getFormLogs = async (formType, maxResults = 20) => {
  try {
    const formLogsRef = query(
      collection(db, FORM_LOGS_COLLECTION),
      where('formType', '==', formType),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(formLogsRef);
    const logs = [];
    
    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return logs;
  } catch (error) {
    console.error('Error getting form logs:', error);
    return [];
  }
};

/**
 * Get form logs by user ID
 * @param {string} userId - The user ID to retrieve logs for
 * @param {number} [maxResults=20] - Maximum number of results to return
 * @returns {Promise<Array>} Array of form log entries
 */
export const getUserFormLogs = async (userId, maxResults = 20) => {
  try {
    const formLogsRef = query(
      collection(db, FORM_LOGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(formLogsRef);
    const logs = [];
    
    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return logs;
  } catch (error) {
    console.error('Error getting user form logs:', error);
    return [];
  }
};

/**
 * Get all form logs for admin review
 * @param {number} [maxResults=50] - Maximum number of results to return
 * @returns {Promise<Array>} Array of form log entries
 */
export const getAllFormLogs = async (maxResults = 50) => {
  try {
    const formLogsRef = query(
      collection(db, FORM_LOGS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(formLogsRef);
    const logs = [];
    
    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return logs;
  } catch (error) {
    console.error('Error getting all form logs:', error);
    return [];
  }
};

export default {
  logFormAction,
  getFormLogs,
  getUserFormLogs,
  getAllFormLogs
}; 