import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Switch,
  Modal
} from 'react-native';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const FormDetailScreen = ({ route, navigation }) => {
  const { submissionId } = route.params;
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubmission, setEditedSubmission] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigation.replace('HomeScreen');
      return;
    }
    loadSubmissionData();
  }, [submissionId, isAdmin]);

  const loadSubmissionData = async () => {
    try {
      const submissionDoc = await getDoc(doc(db, 'formSubmissions', submissionId));
      if (submissionDoc.exists()) {
        const submissionData = {
          id: submissionDoc.id,
          ...submissionDoc.data(),
          createdAt: submissionDoc.data().createdAt?.toDate().toLocaleDateString() || 'N/A',
          updatedAt: submissionDoc.data().updatedAt?.toDate().toLocaleDateString() || 'N/A'
        };
        setSubmission(submissionData);
        setEditedSubmission(submissionData);
      } else {
        Alert.alert('Error', 'Form submission not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading submission:', error);
      Alert.alert('Error', 'Failed to load form submission data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const submissionRef = doc(db, 'formSubmissions', submissionId);
      await updateDoc(submissionRef, {
        ...editedSubmission,
        updatedAt: new Date(),
        updatedBy: 'admin'
      });

      setSubmission(editedSubmission);
      setIsEditing(false);
      Alert.alert('Success', 'Form submission updated successfully');
    } catch (error) {
      console.error('Error updating submission:', error);
      Alert.alert('Error', 'Failed to update form submission');
    }
  };

  const handleCancel = () => {
    setEditedSubmission(submission);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedSubmission(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusChange = async () => {
    if (!newStatus) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    try {
      const submissionRef = doc(db, 'formSubmissions', submissionId);
      await updateDoc(submissionRef, {
        status: newStatus,
        statusNote: statusNote,
        updatedAt: new Date(),
        updatedBy: 'admin'
      });

      setSubmission(prev => ({
        ...prev,
        status: newStatus,
        statusNote: statusNote
      }));
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNote('');
      Alert.alert('Success', 'Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowStatusModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Form Status</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusButtons}>
              {['pending', 'approved', 'rejected'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    newStatus === status && styles.selectedStatusButton
                  ]}
                  onPress={() => setNewStatus(status)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    newStatus === status && styles.selectedStatusButtonText
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status Note</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={statusNote}
              onChangeText={setStatusNote}
              placeholder="Enter status note (optional)"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => {
                setShowStatusModal(false);
                setNewStatus('');
                setStatusNote('');
              }}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleStatusChange}
            >
              <Text style={styles.buttonText}>Update Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333333" />
        <Text style={styles.loadingText}>Loading form submission...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.formType}>{submission?.formType || 'Unknown Form'}</Text>
          <Text style={styles.submissionId}>ID: {submission?.id}</Text>
        </View>

        {/* Form Details */}
        <View style={styles.formContainer}>
          {/* Status Section */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Status Information</Text>
              <TouchableOpacity 
                style={styles.statusButton}
                onPress={() => setShowStatusModal(true)}
              >
                <Text style={styles.statusButtonText}>Update Status</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.statusInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Status</Text>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(submission?.status) }
                ]}>
                  {submission?.status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
              
              {submission?.statusNote && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status Note</Text>
                  <Text style={styles.infoValue}>{submission.statusNote}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Form Data Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Form Data</Text>
            
            {Object.entries(submission || {}).map(([key, value]) => {
              // Skip system fields and status information
              if (['id', 'formType', 'status', 'statusNote', 'createdAt', 'updatedAt', 'updatedBy'].includes(key)) {
                return null;
              }

              return (
                <View key={key} style={styles.inputGroup}>
                  <Text style={styles.label}>{formatFieldName(key)}</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.input, typeof value === 'string' && value.length > 50 && styles.textArea]}
                      value={editedSubmission[key]}
                      onChangeText={(text) => handleInputChange(key, text)}
                      placeholder={`Enter ${formatFieldName(key).toLowerCase()}`}
                      multiline={typeof value === 'string' && value.length > 50}
                      numberOfLines={typeof value === 'string' && value.length > 50 ? 4 : 1}
                    />
                  ) : (
                    <Text style={styles.infoValue}>{value?.toString() || 'N/A'}</Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Metadata Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Submission Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Submitted By</Text>
              <Text style={styles.infoValue}>{submission?.userName || 'Unknown User'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User Email</Text>
              <Text style={styles.infoValue}>{submission?.userEmail || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created At</Text>
              <Text style={styles.infoValue}>{submission?.createdAt}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>{submission?.updatedAt}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isEditing ? (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.editButton]} 
              onPress={handleEdit}
            >
              <Text style={styles.buttonText}>Edit Form</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {renderStatusModal()}
    </SafeAreaView>
  );
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return '#4CAF50';
    case 'rejected':
      return '#F44336';
    default:
      return '#FF9800';
  }
};

const formatFieldName = (fieldName) => {
  return fieldName
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    padding: 20,
    backgroundColor: '#333333',
  },
  formType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  submissionId: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  formContainer: {
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  statusInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#333333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#333333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedStatusButton: {
    backgroundColor: '#333333',
  },
  statusButtonText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedStatusButtonText: {
    color: '#FFFFFF',
  },
});

export default FormDetailScreen; 