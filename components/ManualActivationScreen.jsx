import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Alert,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';
import { AntDesign } from '@expo/vector-icons';
import bajajApi from '../api/bajajApi';
import { API_URL, API_ENDPOINTS } from '../config';
import ErrorHandler from './ValidationErrorHandler';
import { FORM_TYPES, SUBMISSION_STATUS, trackFormSubmission } from '../utils/FormTracker';
import FormLogger from '../utils/FormLogger';
import FasTagRegistrationHelper from '../utils/FasTagRegistrationHelper';
import FastagManager from '../utils/FastagManager';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

// Helper function to generate request ID
const generateRequestId = () => {
  return `REQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const ManualActivationScreen = ({ route, navigation }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [serialNo, setSerialNo] = useState('');
  const [tid, setTid] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // UI state
  const [loading, setLoading] = useState(false);
  
  // Serial number suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Get user info for BC_Id
  const { userProfile } = useAuth();
  
  // Extract all required data from route.params
  const { 
    // Base data
    requestId,
    sessionId,
    mobileNo,
    vehicleNo, 
    chassisNo,
    engineNo,
    customerId,
    walletId,
    name,
    lastName,
    
    // Vehicle details from OTP response
    vehicleManuf,
    model,
    vehicleColour,
    type,
    rtoStatus,
    tagVehicleClassID,
    npciVehicleClassID,
    vehicleType,
    rechargeAmount,
    securityDeposit,
    tagCost,
    vehicleDescriptor,
    isNationalPermit,
    permitExpiryDate,
    stateOfRegistration,
    commercial,
    npciStatus,
    documentDetails,
    channel,
    agentId,
    
    // Optional fields
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    debitAmt = "400.00",

    // Form tracking IDs from previous screens
    formSubmissionId = null,
    fastagRegistrationId = null,
    
    // Pre-selected tag from AllocatedFasTagsScreen
    preSelectedTag = false,
    serialNo: preSelectedSerialNo = ""
  } = route.params || {};
  
  // Load pre-selected serial number if provided
  useEffect(() => {
    if (preSelectedTag && preSelectedSerialNo) {
      setSerialNo(preSelectedSerialNo);
    }
  }, [preSelectedTag, preSelectedSerialNo]);
  
  // Load allocated FastTags for this user
  useEffect(() => {
    fetchAllocatedTags();
  }, []);
  
  // Animation effect on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Fetch allocated tags for this user
  const fetchAllocatedTags = async () => {
    setLoadingSuggestions(true);
    try {
      // Get user BC_Id from profile
      const bcId = userProfile?.bcId || userProfile?.BC_Id;
      
      if (!bcId) {
        setLoadingSuggestions(false);
        return;
      }
      
      // Query Firestore for available FastTags for this user from allocatedFasTags collection
      const fastagRef = collection(db, "allocatedFasTags");
      const q = query(
        fastagRef, 
        where('bcId', '==', bcId),
        where('status', '==', 'available')
      );
      const querySnapshot = await getDocs(q);
      
      const tags = [];
      querySnapshot.forEach((doc) => {
        tags.push({
          id: doc.id,
          serialNo: doc.data().serialNumber,  // Changed from serialNo to serialNumber to match admin dashboard
          status: doc.data().status,
          allocatedAt: doc.data().allocatedAt
        });
      });
      
      // Sort by serial number
      tags.sort((a, b) => (a.serialNo || '').localeCompare(b.serialNo || ''));
      
      console.log("Loaded allocated tags:", tags.length);
      setSuggestions(tags);
    } catch (error) {
      console.error("Error fetching allocated tags:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };
  
  // Filter suggestions based on input
  const getFilteredSuggestions = () => {
    if (!serialNo.trim()) return suggestions;
    
    return suggestions.filter(tag => 
      tag.serialNo.toLowerCase().includes(serialNo.toLowerCase())
    );
  };
  
  // Handle suggestion selection
  const handleSelectSuggestion = (tag) => {
    setSerialNo(tag.serialNo);
    setShowSuggestions(false);
  };
  
  // Basic validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Serial Number
    if (!serialNo.trim()) {
      newErrors.serialNo = 'Serial Number is required';
      isValid = false;
    } else if (serialNo.trim().length < 3) {
      newErrors.serialNo = 'Serial Number is too short';
      isValid = false;
    } else if (serialNo.trim().length > 40) {
      newErrors.serialNo = 'Serial Number is too long';
      isValid = false;
    }
    
    // TID
    if (!tid.trim()) {
      newErrors.tid = 'TID is required';
      isValid = false;
    } else if (tid.trim().length < 3) {
      newErrors.tid = 'TID is too short';
      isValid = false;
    } else if (tid.trim().length > 40) {
      newErrors.tid = 'TID is too long';
      isValid = false;
    }
    
    setErrors(newErrors);
    
    if (!isValid) {
      // Use error handler for validation errors instead of Alert
      ErrorHandler.showErrorAlert(
        'Validation Error',
        'Please fix the errors in the form before continuing.',
        null,
        false
      );
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Starting FasTag registration process...');
      console.log('Document details status:', JSON.stringify(documentDetails));
      console.log('Using session ID:', sessionId);
      
      // Create form data for tracking
      const formData = {
        requestId,
        sessionId,
        mobileNo,
        vehicleNo,
        chassisNo,
        engineNo,
        customerId,
        walletId,
        name,
        serialNo: serialNo.trim(),
        tid: tid.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Add FasTag to the database inventory
      const fastagInventoryResult = await FastagManager.addFastag({
        serialNo: serialNo.trim(),
        tid: tid.trim(),
        mobileNo,
        vehicleNo,
        name,
        walletId,
        chassisNo,
        engineNo,
        status: 'pending'  // Will be set to 'active' after registration completes
      });
      
      if (!fastagInventoryResult.success && !fastagInventoryResult.existingId) {
        console.error('Error adding FasTag to inventory:', fastagInventoryResult.error);
        // Continue with registration process even if FastTag DB addition fails
        // This ensures backward compatibility
      } else {
        console.log('FasTag added to inventory with ID:', fastagInventoryResult.fastagId || fastagInventoryResult.existingId);
        // Store the FastTag ID for later use
        formData.fastagDbId = fastagInventoryResult.fastagId || fastagInventoryResult.existingId;
      }
      
      // Track with FormTracker - start the manual activation process
      const trackingResult = await trackFormSubmission(
        FORM_TYPES.FASTAG_REGISTRATION,
        formData,
        formSubmissionId, // Use ID from previous screen if available
        SUBMISSION_STATUS.STARTED
      );
      
      // Track with FormLogger
      await FormLogger.logFormAction(
        FORM_TYPES.FASTAG_REGISTRATION,
        formData,
        'manual_activation',
        'started'
      );
      
      // Track with FasTag registration system
      const fastagResult = await FasTagRegistrationHelper.trackManualActivation(
        formData,
        fastagRegistrationId // Use ID from previous screen if available
      );
      console.log('FasTag tracking for manual activation started:', fastagResult);
      
      // First check if user has downloaded Bajaj app and visited FasTag section
      const appStatusResponse = await bajajApi.checkBajajAppStatus(mobileNo);
      
      if (appStatusResponse && appStatusResponse.response && appStatusResponse.response.status === 'success') {
        if (!appStatusResponse.appInstalled) {
          Alert.alert(
            'Bajaj App Required',
            'Please install the Bajaj Finserv App and visit the FasTag section before continuing with registration.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }
      } else {
        console.log('App status check failed, continuing with registration...');
      }
    
      // Create the registration data object to match exact API documentation order
      const registrationData = {
        regDetails: {
          requestId: requestId || generateRequestId(),
          sessionId: sessionId || requestId || generateRequestId(),
          channel: channel || 'CBPL',
          agentId: agentId || '70003',
          reqDateTime: new Date().toISOString().replace('T', ' ').substring(0, 23)
        },
        vrnDetails: {
          vrn: vehicleNo || "",
          chassis: chassisNo || "",
          engine: engineNo || "",
          vehicleManuf: vehicleManuf || "",
          model: model || "",
          vehicleColour: vehicleColour || "",
          type: type || "",
          status:  rtoStatus || "ACTIVE",
          npciStatus: "ACTIVE",
          isCommercial: commercial === true ? true : false,
          tagVehicleClassID: tagVehicleClassID || "4",
          npciVehicleClassID: npciVehicleClassID || "4",
          vehicleType: vehicleType || "",
          rechargeAmount: rechargeAmount || "0.00",
          securityDeposit: securityDeposit || "100.00",
          tagCost: tagCost || "100.00",
          debitAmt: debitAmt || "400.00",
          vehicleDescriptor: vehicleDescriptor || "DIESEL",
          isNationalPermit: isNationalPermit || "1",
          permitExpiryDate: permitExpiryDate || "31/12/2025",
          stateOfRegistration: stateOfRegistration || "MH"
        },
        custDetails: {
          name: name || "",
          mobileNo: mobileNo || "",
          walletId: walletId || ""
        },
        fasTagDetails: {
          serialNo: serialNo.trim(),
          tid: tid.trim(),
          udf1: udf1 || "",
          udf2: udf2 || "",
          udf3: udf3 || "",
          udf4: udf4 || "",
          udf5: udf5 || ""
        }
      };
      
      // Validate all required document uploads
      if (!documentDetails || 
          !documentDetails.RCFRONT || 
          !documentDetails.RCBACK || 
          !documentDetails.VEHICLEFRONT || 
          !documentDetails.VEHICLESIDE || 
          !documentDetails.TAGAFFIX) {
        console.error('Missing document uploads:', JSON.stringify(documentDetails));
        
        // Use error handler instead of Alert
        ErrorHandler.showErrorAlert(
          'Missing Documents',
          'Some required documents are missing. Please go back and ensure all documents are uploaded.',
          null,
          false
        );
        setLoading(false);
        return;
      }

      console.log('FasTag Registration Request:', JSON.stringify(registrationData, null, 2));
      
      // Update FormTracker with success
      await trackFormSubmission(
        FORM_TYPES.FASTAG_REGISTRATION,
        {
          ...formData,
          registrationData,
          documentDetails,
          apiSuccess: true
        },
        trackingResult.id,
        SUBMISSION_STATUS.IN_PROGRESS
      );
      
      // Log success with FormLogger
      await FormLogger.logFormAction(
        FORM_TYPES.FASTAG_REGISTRATION,
        {
          ...formData,
          registrationData,
          documentDetails,
          apiSuccess: true
        },
        'manual_activation',
        'success'
      );
      
      // Update FasTag tracking with success
      await FasTagRegistrationHelper.trackManualActivation(
        {
          ...formData,
          registrationData,
          documentDetails,
          apiSuccess: true
        },
        fastagResult.registrationId
      );
      
      // Navigate to FasTag registration with the data
      navigation.navigate('FasTagRegistration', {
        registrationData,
        documentDetails,
        // Also pass the form submission IDs for tracking
        formSubmissionId: trackingResult.id,
        fastagRegistrationId: fastagResult.registrationId,
        // Pass the FastTag database ID if we have one
        fastagDbId: formData.fastagDbId || null,
        // Also pass the raw data in case it's needed
        rawData: {
          requestId,
          sessionId,
          channel,
          agentId,
          mobileNo,
          vehicleNo,
          chassisNo,
          engineNo,
          customerId,
          walletId,
          name,
          vehicleManuf,
          model,
          vehicleColour,
          type,
          rtoStatus,
          tagVehicleClassID,
          npciVehicleClassID,
          vehicleType,
          rechargeAmount,
          securityDeposit,
          tagCost,
          vehicleDescriptor,
          isNationalPermit,
          permitExpiryDate,
          stateOfRegistration,
          commercial,
          npciStatus,
          serialNo,
          tid,
          udf1,
          udf2,
          udf3,
          udf4,
          udf5
        }
      });
    } catch (error) {
      console.error('Error in manual activation:', error);
      
      // Use our error handler for consistent error alerts
      await ErrorHandler.handleApiError(
        error,
        'Manual Activation',
        {
          serialNo,
          tid,
          vehicleNo,
          mobileNo
        },
        FORM_TYPES.FASTAG_REGISTRATION,
        'manual_activation'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Render the suggestions list
  const renderSuggestion = ({ item }) => (
    <TouchableOpacity 
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionText}>{item.serialNo}</Text>
        {item.allocatedAt && (
          <Text style={styles.suggestionDate}>
            Allocated: {item.allocatedAt.toDate ? item.allocatedAt.toDate().toLocaleDateString() : 'Recently'}
          </Text>
        )}
      </View>
      <View style={styles.suggestionSelect}>
        <Text style={styles.suggestionSelectText}>Select</Text>
      </View>
    </TouchableOpacity>
  );
  
  // Render empty suggestions message
  const renderEmptySuggestions = () => (
    <View style={styles.emptySuggestions}>
      {suggestions.length > 0 ? (
        <Text style={styles.emptySuggestionsText}>No matching FasTags found</Text>
      ) : (
        <>
          <Text style={styles.emptySuggestionsTitle}>No FasTags Allocated</Text>
          <Text style={styles.emptySuggestionsText}>
            You don't have any FasTags allocated to you yet. Please contact your administrator to get FasTags allocated.
          </Text>
          <TouchableOpacity style={styles.emptyRefreshButton} onPress={fetchAllocatedTags}>
            <Text style={styles.emptyRefreshText}>Refresh</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
  
  // View all allocated tags
  const viewAllAllocatedTags = () => {
    navigation.navigate('AllocatedFasTags');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FasTag Manual Activation</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View 
            style={[styles.content, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }]}
          >
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>FasTag Manual Activation</Text>
              <Text style={styles.infoText}>
                Please enter the FasTag Serial Number and TID details manually. These details are required to complete the registration process.
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              {/* Serial Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Serial Number<Text style={styles.required}>*</Text></Text>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={[
                      styles.input, 
                      errors.serialNo ? styles.inputError : null,
                      showSuggestions && styles.activeInput
                    ]}
                    placeholder="Enter FasTag Serial Number"
                    value={serialNo}
                    onChangeText={(text) => {
                      setSerialNo(text);
                      setShowSuggestions(text.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(serialNo.length > 0)}
                    autoCapitalize="characters"
                  />
                  {serialNo ? (
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => {
                        setSerialNo('');
                        setShowSuggestions(false);
                      }}
                    >
                      <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                
                {showSuggestions && (
                  <View style={styles.suggestionsContainer}>
                    {loadingSuggestions ? (
                      <ActivityIndicator size="small" color="#333333" style={styles.suggestionsLoading} />
                    ) : (
                      <>
                        <View style={styles.suggestionsHeader}>
                          <Text style={styles.suggestionsTitle}>
                            {suggestions.length > 0 ? 'Your Allocated FasTags' : 'No Allocated FasTags'}
                          </Text>
                          <TouchableOpacity 
                            style={styles.viewAllButtonInline}
                            onPress={viewAllAllocatedTags}
                          >
                            <Text style={styles.viewAllButtonInlineText}>View All</Text>
                          </TouchableOpacity>
                        </View>
                        
                        <ScrollView 
                          style={styles.suggestionsList}
                          keyboardShouldPersistTaps="handled"
                          nestedScrollEnabled
                        >
                          {getFilteredSuggestions().length > 0 ? (
                            getFilteredSuggestions().map(item => (
                              <TouchableOpacity 
                                key={item.id}
                                style={styles.suggestionItem}
                                onPress={() => handleSelectSuggestion(item)}
                              >
                                <View style={styles.suggestionContent}>
                                  <Text style={styles.suggestionText}>{item.serialNo}</Text>
                                  {item.allocatedAt && (
                                    <Text style={styles.suggestionDate}>
                                      Allocated: {item.allocatedAt.toDate ? item.allocatedAt.toDate().toLocaleDateString() : 'Recently'}
                                    </Text>
                                  )}
                                </View>
                                <View style={styles.suggestionSelect}>
                                  <Text style={styles.suggestionSelectText}>Select</Text>
                                </View>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <View style={styles.emptySuggestions}>
                              {suggestions.length > 0 ? (
                                <Text style={styles.emptySuggestionsText}>No matching FasTags found</Text>
                              ) : (
                                <>
                                  <Text style={styles.emptySuggestionsTitle}>No FasTags Allocated</Text>
                                  <Text style={styles.emptySuggestionsText}>
                                    You don't have any FasTags allocated to you yet. Please contact your administrator to get FasTags allocated.
                                  </Text>
                                  <TouchableOpacity style={styles.emptyRefreshButton} onPress={fetchAllocatedTags}>
                                    <Text style={styles.emptyRefreshText}>Refresh</Text>
                                  </TouchableOpacity>
                                </>
                              )}
                            </View>
                          )}
                        </ScrollView>
                      </>
                    )}
                  </View>
                )}
                
                {errors.serialNo ? (
                  <Text style={styles.errorText}>{errors.serialNo}</Text>
                ) : null}
              </View>
              
              {/* TID */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>TID<Text style={styles.required}></Text></Text>
                <TextInput
                  style={[styles.input, errors.tid ? styles.inputError : null]}
                  placeholder="Enter FasTag TID"
                  value={tid}
                  onChangeText={setTid}
                  autoCapitalize="characters"
                />
                {errors.tid ? (
                  <Text style={styles.errorText}>{errors.tid}</Text>
                ) : null}
              </View>
            </View>
            
            {/* Vehicle Details Summary */}
            {vehicleNo && (
              <View style={styles.summaryContainer}>
                <Text style={styles.sectionTitle}>Vehicle Details</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Vehicle Number:</Text>
                  <Text style={styles.summaryValue}>{vehicleNo || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Chassis Number:</Text>
                  <Text style={styles.summaryValue}>{chassisNo || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Engine Number:</Text>
                  <Text style={styles.summaryValue}>{engineNo || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Vehicle Model:</Text>
                  <Text style={styles.summaryValue}>{model || 'N/A'}</Text>
                </View>
              </View>
            )}
            
            {/* Customer Details Summary */}
            {name && (
              <View style={styles.summaryContainer}>
                <Text style={styles.sectionTitle}>Customer Details</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Name:</Text>
                  <Text style={styles.summaryValue}>{name || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Mobile Number:</Text>
                  <Text style={styles.summaryValue}>{mobileNo || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Wallet ID:</Text>
                  <Text style={styles.summaryValue}>{walletId || 'N/A'}</Text>
                </View>
              </View>
            )}
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Continue to Registration</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  formContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#FF0000',
    marginLeft: 4,
  },
  searchContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  activeInput: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999999',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#DDDDDD',
    maxHeight: 300,
    marginTop: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  suggestionDate: {
    fontSize: 12,
    color: '#999999',
  },
  suggestionSelect: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  suggestionSelectText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  emptySuggestions: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  emptySuggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySuggestionsText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyRefreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#333333',
    borderRadius: 8,
    marginTop: 8,
  },
  emptyRefreshText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  suggestionsLoading: {
    padding: 16,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#F9F9F9',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  viewAllButtonInline: {
    padding: 4,
  },
  viewAllButtonInlineText: {
    color: '#666666',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  summaryContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    flex: 2,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManualActivationScreen;