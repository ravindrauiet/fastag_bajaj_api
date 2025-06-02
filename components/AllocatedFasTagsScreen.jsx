import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import FastagManager from '../utils/FastagManager';

const AllocatedFasTagsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [allocatedTags, setAllocatedTags] = useState([]);
  const { userInfo, userProfile } = useAuth();
  
  // New state variables for the activation request form
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    fetchAllocatedTags();
  }, []);
  
  const fetchAllocatedTags = async () => {
    setLoading(true);
    try {
      // Get user BC_Id from profile
      const bcId = userProfile?.bcId || userProfile?.BC_Id;
      
      if (!bcId) {
        Alert.alert("Error", "BC ID not found. Please contact support.");
        setLoading(false);
        return;
      }
      
      // Query Firestore for all allocated FastTags for this user
      const fastagRef = collection(db, "allocatedFasTags");
      const q = query(
        fastagRef, 
        where('bcId', '==', bcId),
        where('status', 'in', ['available', 'used', 'revoked', 'pending_activation', 'inactive', 'allocated'])
      );
      const querySnapshot = await getDocs(q);
      
      const tags = [];
      querySnapshot.forEach((doc) => {
        tags.push({
          id: doc.id,
          serialNo: doc.data().serialNumber,
          status: doc.data().status,
          activatedAt: doc.data().allocatedAt,
          vehicleNo: doc.data().vehicleNo || '',
          usedStyle: doc.data().status === 'used' ? styles.usedTag : 
                    doc.data().status === 'allocated' ? styles.allocatedTag : {}
        });
      });
      
      // Sort by status first (available first), then by serial number
      tags.sort((a, b) => {
        if (a.status === 'available' && b.status !== 'available') return -1;
        if (a.status !== 'available' && b.status === 'available') return 1;
        return a.serialNo.localeCompare(b.serialNo);
      });
      
      setAllocatedTags(tags);
    } catch (error) {
      console.error("Error fetching allocated tags:", error);
      Alert.alert("Error", "Failed to load your allocated tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectTag = (tag) => {
    if (tag.status !== 'inactive') {
      Alert.alert("Invalid Tag", "Only inactive tags can be activated.");
      return;
    }
    
    // Set the selected tag and show the modal
    setSelectedTag(tag);
    setModalVisible(true);
    
    // Reset form fields
    setVehicleNumber('');
    setContactNumber(userInfo?.phoneNumber || '');
    setRemarks('');
    setFormErrors({});
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!vehicleNumber.trim()) {
      errors.vehicleNumber = "Vehicle number is required";
    } else if (!/^[A-Z0-9]{5,11}$/.test(vehicleNumber.trim())) {
      errors.vehicleNumber = "Enter a valid vehicle number (e.g., MH01AB1234)";
    }
    
    if (!contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(contactNumber.trim())) {
      errors.contactNumber = "Enter a valid 10-digit contact number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmitRequest = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const bcId = userProfile?.bcId || userProfile?.BC_Id;
      
      // Create an activation request document
      const requestRef = await addDoc(collection(db, "fastagActivationRequests"), {
        serialNumber: selectedTag.serialNo,
        bcId: bcId,
        userId: userInfo?.uid,
        userName: userInfo?.displayName || userProfile?.name || "Unknown",
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        contactNumber: contactNumber.trim(),
        remarks: remarks.trim(),
        status: "pending", // pending, approved, rejected
        requestedAt: serverTimestamp(),
        allocationId: selectedTag.id
      });
      
      // Update the allocated FasTag status to "pending_activation"
      await updateDoc(doc(db, "allocatedFasTags", selectedTag.id), {
        status: "pending_activation"
      });
      
      // Refresh the tags list
      fetchAllocatedTags();
      
      // Close the modal and show success message
      setModalVisible(false);
      Alert.alert(
        "Request Submitted",
        "Your FasTag activation request has been submitted successfully. The administrator will review your request.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error submitting activation request:", error);
      Alert.alert("Error", "Failed to submit your activation request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancelRequest = () => {
    setModalVisible(false);
  };
  
  // Option to go to manual activation directly
  const handleProceedToManualActivation = () => {
    setModalVisible(false);
    
    // Navigate to ManualActivation with the selected tag
    navigation.navigate('ManualActivation', {
      serialNo: selectedTag.serialNo,
      preSelectedTag: true
    });
  };
  
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.tagItem, item.usedStyle]}
      onPress={() => handleSelectTag(item)}
      disabled={item.status === 'active' || item.status === 'used' || item.status === 'pending_activation' || item.status !== 'inactive'}
    >
      <View style={styles.tagInfo}>
        <Text style={styles.serialNo}>{item.serialNo}</Text>
        <Text style={styles.tagStatus}>
          Status: {item.status === 'available' 
            ? 'Available' 
            : item.status === 'pending_activation' 
              ? 'Activation Pending'
              : item.status === 'inactive'
                ? 'Inactive'
                : item.status === 'allocated'
                  ? 'Allocated'
                  : 'Used'}
        </Text>
        {item.vehicleNo && (
          <Text style={styles.vehicleNo}>
            Vehicle: {item.vehicleNo}
          </Text>
        )}
        {item.activatedAt && (
          <Text style={styles.tagDate}>
            Activated: {new Date(item.activatedAt.seconds * 1000).toLocaleDateString()}
          </Text>
        )}
      </View>
      
      {item.status === 'inactive' && (
        <View style={styles.activateButton}>
          <Text style={styles.activateButtonText}>Activate</Text>
        </View>
      )}
      
      {item.status === 'pending_activation' && (
        <View style={styles.pendingButton}>
          <Text style={styles.pendingButtonText}>Pending</Text>
        </View>
      )}

      {item.status === 'allocated' && (
        <View style={styles.allocatedButton}>
          <Text style={styles.allocatedButtonText}>Allocated</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Allocated FasTags</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Your FasTag Inventory</Text>
        <Text style={styles.infoText}>
          Below are the FasTags allocated to you by the administrator. You can activate inactive tags to proceed with the registration process.
        </Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333333" />
          <Text style={styles.loadingText}>Loading your allocated tags...</Text>
        </View>
      ) : allocatedTags.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No FasTags allocated to you yet.</Text>
          <Text style={styles.emptySubtext}>Contact your administrator to get FasTags allocated.</Text>
        </View>
      ) : (
        <FlatList
          data={allocatedTags}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.countText}>
                {allocatedTags.filter(t => t.status === 'inactive').length} inactive tags
              </Text>
              <TouchableOpacity onPress={fetchAllocatedTags} style={styles.refreshButton}>
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      
      {/* Activation Request Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelRequest}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>FasTag Activation Request</Text>
              
              <View style={styles.modalInfoCard}>
                <Text style={styles.modalInfoTitle}>Serial Number:</Text>
                <Text style={styles.modalInfoValue}>{selectedTag?.serialNo}</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vehicle Number <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, formErrors.vehicleNumber && styles.inputError]}
                  placeholder="Enter vehicle number (e.g., MH01AB1234)"
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                  autoCapitalize="characters"
                />
                {formErrors.vehicleNumber && (
                  <Text style={styles.errorText}>{formErrors.vehicleNumber}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Number <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, formErrors.contactNumber && styles.inputError]}
                  placeholder="Enter 10-digit contact number"
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {formErrors.contactNumber && (
                  <Text style={styles.errorText}>{formErrors.contactNumber}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Remarks</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Enter any additional information (optional)"
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelRequest}
                  disabled={submitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitRequest}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.advancedButton}
                onPress={handleProceedToManualActivation}
              >
                <Text style={styles.advancedButtonText}>Proceed to Manual Activation</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#333333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#333333',
    padding: 16,
    margin: 16,
    borderRadius: 16,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#777777',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  countText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    color: '#666666',
    fontSize: 14,
  },
  tagItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  usedTag: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDDDDD',
    opacity: 0.8,
  },
  tagInfo: {
    flex: 1,
  },
  serialNo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  tagStatus: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  tagDate: {
    fontSize: 12,
    color: '#999999',
  },
  activateButton: {
    backgroundColor: '#333333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pendingButton: {
    backgroundColor: '#F0AD4E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pendingButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInfoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  modalInfoTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#FF0000',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  advancedButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
  },
  advancedButtonText: {
    color: '#666666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  allocatedTag: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  allocatedButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  allocatedButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  vehicleNo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
});

export default AllocatedFasTagsScreen; 