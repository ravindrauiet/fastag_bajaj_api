import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';

/**
 * Save form submission data to Firestore
 * This function is used by any screen where users enter data
 * 
 * @param {string} formType - The type/name of the form (e.g., 'vehicle-details', 'user-profile')
 * @param {Object} formData - The form data to be saved
 * @param {string} [submissionId] - Optional ID for updating an existing submission
 * @returns {Promise} - Result of the operation with the submission ID
 */
export const saveFormSubmission = async (formType, formData, submissionId = null) => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to save form data');
    }

    const userId = auth.currentUser.uid;
    const timestamp = new Date();
    
    // Prepare the submission data with metadata
    const submissionData = {
      formType,
      userId,
      data: formData,
      status: 'pending',
      createdAt: submissionId ? undefined : timestamp,
      updatedAt: timestamp,
    };
    
    console.log(`Saving ${formType} form data:`, submissionData);
    
    let submissionRef;
    
    // Update existing submission or create new one
    if (submissionId) {
      submissionRef = doc(db, 'formSubmissions', submissionId);
      await updateDoc(submissionRef, submissionData);
      console.log(`Updated form submission: ${submissionId}`);
      return { id: submissionId, ...submissionData };
    } else {
      const formSubmissionsRef = collection(db, 'formSubmissions');
      const docRef = await addDoc(formSubmissionsRef, submissionData);
      console.log(`Created new form submission: ${docRef.id}`);
      return { id: docRef.id, ...submissionData };
    }
  } catch (error) {
    console.error('Error saving form submission:', error);
    throw error;
  }
};

/**
 * Get all submissions by the current user
 * @param {string} [formType] - Optional filter by form type
 * @returns {Promise} - Array of submissions
 */
export const getUserSubmissions = async (formType = null) => {
  try {
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Start with the submissions collection
    const submissionsRef = collection(db, 'submissions');
    
    // Create a query with filters
    let submissionsQuery = query(submissionsRef, where('userId', '==', user.uid));
    
    // Apply additional filter if formType is provided
    if (formType) {
      submissionsQuery = query(submissionsQuery, where('formType', '==', formType));
    }
    
    // Execute the query
    const querySnapshot = await getDocs(submissionsQuery);
    
    // Map the documents to an array of submissions
    const submissions = [];
    querySnapshot.forEach((doc) => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      submissions
    };
  } catch (error) {
    console.error('Error getting user submissions: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all form submissions (admin only)
 * @param {string} [formType] - Optional filter by form type
 * @returns {Promise} - Array of all submissions
 */
export const getAllSubmissions = async (formType = null) => {
  try {
    // Get current user
    const user = auth.currentUser;
    if (!user || user.email !== 'admin@gmail.com') {
      throw new Error('Only admin can access all submissions');
    }
    
    // Start with the submissions collection
    const submissionsRef = collection(db, 'submissions');
    
    // Create a query with filters
    let submissionsQuery = submissionsRef;
    
    // Apply filter if formType is provided
    if (formType) {
      submissionsQuery = query(submissionsRef, where('formType', '==', formType));
    }
    
    // Execute the query
    const querySnapshot = await getDocs(submissionsQuery);
    
    // Map the documents to an array of submissions
    const submissions = [];
    querySnapshot.forEach((doc) => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      submissions
    };
  } catch (error) {
    console.error('Error getting all submissions: ', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get all form submissions for a user
export const getUserFormSubmissions = async (userId) => {
  try {
    const formSubmissionsRef = collection(db, 'formSubmissions');
    const q = query(
      formSubmissionsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions = [];
    
    querySnapshot.forEach((doc) => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return submissions;
  } catch (error) {
    console.error('Error getting user form submissions:', error);
    throw error;
  }
};

// Get a single form submission by ID
export const getFormSubmission = async (submissionId) => {
  try {
    const submissionRef = doc(db, 'formSubmissions', submissionId);
    const docSnap = await getDoc(submissionRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Form submission not found');
    }
  } catch (error) {
    console.error('Error getting form submission:', error);
    throw error;
  }
};

// Get all form submissions (for admin)
export const getAllFormSubmissions = async (formType = null, status = null, limit = 100) => {
  try {
    const formSubmissionsRef = collection(db, 'formSubmissions');
    let q = query(formSubmissionsRef, orderBy('createdAt', 'desc'));
    
    // Apply filters if provided
    if (formType) {
      q = query(q, where('formType', '==', formType));
    }
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    // Limit the number of results
    q = query(q, limit(limit));
    
    const querySnapshot = await getDocs(q);
    const submissions = [];
    
    querySnapshot.forEach((doc) => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return submissions;
  } catch (error) {
    console.error('Error getting all form submissions:', error);
    throw error;
  }
};

// Update form submission status
export const updateFormSubmissionStatus = async (submissionId, status, notes = '') => {
  try {
    const submissionRef = doc(db, 'formSubmissions', submissionId);
    
    await updateDoc(submissionRef, {
      status,
      adminNotes: notes,
      updatedAt: new Date(),
      processedBy: auth.currentUser ? auth.currentUser.uid : null
    });
    
    console.log(`Updated submission ${submissionId} status to: ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating form submission status:', error);
    throw error;
  }
}; 