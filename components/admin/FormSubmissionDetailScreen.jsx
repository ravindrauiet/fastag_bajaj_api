import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  getFormTypeName, 
  getFormTypeColor, 
  getFormTypeIcon, 
  getStatusColor,
  SUBMISSION_STATUS
} from '../../utils/FormTracker';
import { trackFormSubmission } from '../../utils/FormTracker';

const FormSubmissionDetailScreen = ({ navigation, route }) => {
  const { submissionId, formType } = route.params;
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Load submission details from Firestore
  useEffect(() => {
    loadSubmissionDetails();
  }, []);
  
  const loadSubmissionDetails = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Get the document from Firestore
      const submissionRef = doc(db, 'formSubmissions', submissionId);
      const docSnap = await getDoc(submissionRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSubmission({
          id: docSnap.id,
          ...data
        });
      } else {
        setErrorMessage('Submission not found');
      }
    } catch (error) {
      setErrorMessage('Error: ' + error.message);
      console.error('Error loading submission details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Update submission status
  const updateStatus = async (newStatus) => {
    try {
      await trackFormSubmission(
        submission.formType,
        { ...submission, status: newStatus },
        submissionId,
        newStatus
      );
      
      // Refresh the submission details
      loadSubmissionDetails();
      
      // Show success message
      Alert.alert(
        'Status Updated',
        `Submission status updated to ${newStatus}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(
        'Error',
        'Failed to update status: ' + error.message,
        [{ text: 'OK' }]
      );
    }
  };
  
  // Render status action buttons
  const renderStatusActions = () => {
    if (!submission) return null;
    
    const currentStatus = submission.status;
    
    return (
      <View style={styles.statusActions}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionButtons}>
          {currentStatus !== SUBMISSION_STATUS.COMPLETED && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: getStatusColor(SUBMISSION_STATUS.COMPLETED) }]}
              onPress={() => updateStatus(SUBMISSION_STATUS.COMPLETED)}
            >
              <Text style={styles.actionButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
          
          {currentStatus !== SUBMISSION_STATUS.PENDING && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: getStatusColor(SUBMISSION_STATUS.PENDING) }]}
              onPress={() => updateStatus(SUBMISSION_STATUS.PENDING)}
            >
              <Text style={styles.actionButtonText}>Mark Pending</Text>
            </TouchableOpacity>
          )}
          
          {currentStatus !== SUBMISSION_STATUS.REJECTED && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: getStatusColor(SUBMISSION_STATUS.REJECTED) }]}
              onPress={() => updateStatus(SUBMISSION_STATUS.REJECTED)}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  // Format dates for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    } else if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    
    return 'Unknown date format';
  };
  
  // Render property value based on type
  const renderValue = (key, value) => {
    // Skip rendering these fields directly
    if (['apiResponse', 'id', 'formType', 'status', 'userId', 'userName', 'userEmail'].includes(key)) {
      return null;
    }
    
    // Format timestamps
    if (
      key === 'createdAt' ||
      key === 'updatedAt' ||
      key === 'submissionTimestamp' ||
      key === 'flowStartedAt' ||
      key.toLowerCase().includes('timestamp') ||
      key.toLowerCase().includes('date')
    ) {
      return (
        <View style={styles.fieldItem} key={key}>
          <Text style={styles.fieldLabel}>{formatFieldName(key)}:</Text>
          <Text style={styles.fieldValue}>{formatDate(value)}</Text>
        </View>
      );
    }
    
    // Handle objects and arrays
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <View style={styles.fieldItem} key={key}>
            <Text style={styles.fieldLabel}>{formatFieldName(key)}:</Text>
            <View style={styles.nestedValue}>
              {value.map((item, index) => (
                <Text key={index} style={styles.fieldValue}>
                  {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                </Text>
              ))}
            </View>
          </View>
        );
      } else {
        return (
          <View style={styles.fieldItem} key={key}>
            <Text style={styles.fieldLabel}>{formatFieldName(key)}:</Text>
            <View style={styles.nestedValue}>
              {Object.entries(value).map(([nestedKey, nestedValue]) => (
                <Text key={nestedKey} style={styles.fieldValue}>
                  {nestedKey}: {typeof nestedValue === 'object' ? JSON.stringify(nestedValue) : String(nestedValue)}
                </Text>
              ))}
            </View>
          </View>
        );
      }
    }
    
    // Simple string/number values
    return (
      <View style={styles.fieldItem} key={key}>
        <Text style={styles.fieldLabel}>{formatFieldName(key)}:</Text>
        <Text style={styles.fieldValue}>{String(value)}</Text>
      </View>
    );
  };
  
  // Format field names for better display
  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/_/g, ' ') // Replace underscores with spaces
      .trim();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submission Details</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadSubmissionDetails}
        >
          <Text style={styles.refreshButtonText}>↻</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333333" />
          <Text style={styles.loadingText}>Loading submission details...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadSubmissionDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : submission ? (
        <ScrollView style={styles.contentContainer}>
          {/* Submission Header */}
          <View style={[
            styles.submissionHeader,
            { backgroundColor: getFormTypeColor(submission.formType) }
          ]}>
            <View style={styles.formTypeContainer}>
              <Text style={styles.formTypeIcon}>{getFormTypeIcon(submission.formType)}</Text>
              <Text style={styles.formTypeName}>{getFormTypeName(submission.formType)}</Text>
            </View>
            
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(submission.status) }
            ]}>
              <Text style={styles.statusText}>{submission.status}</Text>
            </View>
          </View>
          
          {/* User Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Information</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{submission.userName || 'Unknown User'}</Text>
              <Text style={styles.userEmail}>{submission.userEmail || 'No Email'}</Text>
              <Text style={styles.userId}>User ID: {submission.userId || 'N/A'}</Text>
            </View>
          </View>
          
          {/* Status Actions */}
          {renderStatusActions()}
          
          {/* Form Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Form Data</Text>
            <View style={styles.formFields}>
              {submission && Object.entries(submission).map(([key, value]) => 
                renderValue(key, value)
              )}
            </View>
          </View>
          
          {/* API Response (if available) */}
          {submission.apiResponse && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>API Response</Text>
              <View style={styles.apiResponse}>
                <Text style={styles.apiResponseText}>
                  {typeof submission.apiResponse === 'string' 
                    ? submission.apiResponse 
                    : JSON.stringify(submission.apiResponse, null, 2)}
                </Text>
              </View>
            </View>
          )}
          
          {/* Submission Meta */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Submission Meta</Text>
            <View style={styles.metaInfo}>
              <Text style={styles.metaItem}>ID: {submission.id}</Text>
              <Text style={styles.metaItem}>
                Created: {formatDate(submission.createdAt || submission.submissionTimestamp)}
              </Text>
              <Text style={styles.metaItem}>
                Updated: {formatDate(submission.updatedAt)}
              </Text>
              <Text style={styles.metaItem}>
                Form Type: {submission.formType}
              </Text>
              <Text style={styles.metaItem}>
                Registration Step: {submission.registrationStep || 'N/A'}
              </Text>
            </View>
          </View>
          
          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No submission data found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  formTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  formTypeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  userInfo: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#999999',
  },
  formFields: {
    
  },
  fieldItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333333',
  },
  nestedValue: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
  },
  metaInfo: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  metaItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  apiResponse: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  apiResponseText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333333',
  },
  statusActions: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
    width: '30%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default FormSubmissionDetailScreen; 