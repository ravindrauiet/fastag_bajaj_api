import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import bajajApi from '../api/bajajApi';
import { NotificationContext } from '../contexts/NotificationContext';
import ErrorHandler from './ValidationErrorHandler';
import { FORM_TYPES } from '../utils/FormTracker';

// Helper function to generate a new requestId (only used as fallback)
const generateRequestId = () => {
  return `REQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const CreateWalletScreen = ({ navigation, route }) => {
  // Get parameters from route
  const { 
    requestId: routeRequestId,
    sessionId: routeSessionId,
    mobileNo: routeMobileNo,
    vehicleNo,
    chassisNo,
    engineNo,
    reqType,
    vrnAlreadyExists = false, // Special flag for VRN already registered
    errorCode = '',
    errorDesc = ''
  } = route.params || {};

  // Form state
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNo, setMobileNo] = useState(routeMobileNo || '');
  const [dob, setDob] = useState('');
  const [documentType, setDocumentType] = useState('PAN');
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Session state
  const [requestId, setRequestId] = useState(routeRequestId || '');
  const [sessionId, setSessionId] = useState(routeSessionId || '');
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Context for notifications
  const { addNotification } = useContext(NotificationContext);
  
  // Flag to track if we're currently submitting to prevent duplicate submissions
  const isSubmitting = useRef(false);
  
  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // Get a fresh session from the API if needed
  useEffect(() => {
    const initializeSession = async () => {
      // If we already have a session or are in the middle of submitting, skip
      if ((requestId && sessionId && !vrnAlreadyExists) || isSubmitting.current) {
        setSessionInitialized(true);
        return;
      }
      
      try {
        // For VRN already exists case, we start fresh with validate customer
        if (vrnAlreadyExists && mobileNo && (vehicleNo || engineNo)) {
          console.log('VRN already exists, initializing fresh session...');
          // Instead of waiting for form submission, get a session and redirect to OTP
          if (mobileNo.length === 10) {
            // Only try to get a session if we have a valid mobile number
            getFreshSession();
            return; // Stop execution here as we're redirecting
          }
          // Otherwise just wait for form submission
          setSessionInitialized(true);
          return;
        }
        
        // If no session provided but we have mobile number, we can try to get a new session
        if (!sessionId && mobileNo && mobileNo.length === 10) {
          console.log('No session provided, will get fresh session and redirect to OTP screen');
          getFreshSession();
          return; // Stop execution here as we're redirecting
        }
        
        // If we reach here, we'll use the provided session or just wait
        setSessionInitialized(true);
      } catch (error) {
        console.error('Session initialization error:', error);
        ErrorHandler.showErrorAlert(
          'Session Error',
          'Unable to initialize session. Please try again later.',
          null,
          true
        );
        setSessionInitialized(true);
      }
    };
    
    initializeSession();
  }, [requestId, sessionId, mobileNo, vehicleNo, engineNo, vrnAlreadyExists]);
  
  // Start animations when component mounts
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

  // Handle date input with auto-formatting
  const handleDateChange = (text, setter) => {
    // Allow only numbers and hyphens
    const formattedText = text.replace(/[^0-9\-]/g, '');
    
    // Auto-add hyphens after day and month for DOB format (DD-MM-YYYY)
    let formatted = formattedText;
    const previousValue = setter === setDob ? dob : expiryDate;
    
    if (formattedText.length === 2 && !formattedText.includes('-') && previousValue.length === 1) {
      formatted = formattedText + '-';
    } else if (formattedText.length === 5 && formattedText.charAt(2) === '-' && !formattedText.includes('-', 3) && previousValue.length === 4) {
      formatted = formattedText + '-';
    }
    
    setter(formatted);
  };
  
  // IMPORTANT: Only validate fields fully on submit, not during typing
  // Just do light validation during typing
  const validateField = (field, value, isSubmitting = false) => {
    let errorMessage = '';
    let showAlert = false;
    
    // Skip detailed validation unless submitting, just do basic required checks
    // This lets users complete the form before seeing errors
    if (!isSubmitting) {
      // Only set required errors if the field is completely empty and the user has submitted once
      if (formSubmitted && !value.trim()) {
        switch (field) {
          case 'name': errorMessage = 'First name is required'; break;
          case 'lastName': errorMessage = 'Last name is required'; break;
          case 'mobileNo': errorMessage = 'Mobile number is required'; break;
          case 'dob': errorMessage = 'Date of birth is required'; break;
          case 'documentNumber': errorMessage = 'Document number is required'; break;
          case 'expiryDate': 
            if ((documentType === 'DL' || documentType === 'PASS')) {
              errorMessage = 'Expiry date is required for this document type';
            }
            break;
        }
      }
      
      // For PAN card, only validate the format if all 10 characters are entered
      if (field === 'documentNumber' && documentType === 'PAN' && value.length === 10) {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
          errorMessage = 'Invalid PAN format (e.g., ABCDE1234F)';
        }
      }
    } else {
      // Full validation only on submit
      switch (field) {
        case 'name':
          if (!value) {
            errorMessage = 'First name is required';
          } else if (!/^[A-Za-z\s]+$/.test(value.trim())) {
            errorMessage = 'First Name should contain only letters';
            showAlert = true;
          }
          break;
          
        case 'lastName':
          if (!value) {
            errorMessage = 'Last name is required';
          } else if (!/^[A-Za-z\s]+$/.test(value.trim())) {
            errorMessage = 'Last Name should contain only letters';
            showAlert = true;
          }
          break;
          
        case 'mobileNo':
          if (!value) {
            errorMessage = 'Mobile number is required';
          } else if (!/^[0-9]{10}$/.test(value)) {
            errorMessage = 'Mobile number must be 10 digits';
            showAlert = true;
          }
          break;
          
        case 'dob':
          if (!value) {
            errorMessage = 'Date of birth is required';
          } else if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) {
            errorMessage = 'Date must be in DD-MM-YYYY format';
            showAlert = true;
          } else {
            // Additional date validation
            const [day, month, year] = value.split('-').map(num => parseInt(num, 10));
            
            // Check if date parts are valid numbers
            if (isNaN(day) || isNaN(month) || isNaN(year)) {
              errorMessage = 'Invalid date format';
              showAlert = true;
            } else if (day < 1 || day > 31) {
              errorMessage = 'Day must be between 1 and 31';
              showAlert = true;
            } else if (month < 1 || month > 12) {
              errorMessage = 'Month must be between 1 and 12';
              showAlert = true;
            } else if (year < 1900 || year > new Date().getFullYear()) {
              errorMessage = `Year must be between 1900 and ${new Date().getFullYear()}`;
              showAlert = true;
            } else {
              // Check for valid day-month combinations
              const daysInMonth = new Date(year, month, 0).getDate();
              if (day > daysInMonth) {
                errorMessage = `Invalid date: ${month} has only ${daysInMonth} days`;
                showAlert = true;
              }
              
              // Check if user is at least 18 years old
              const birthDate = new Date(year, month - 1, day);
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())))) {
                errorMessage = 'You must be at least 18 years old';
                showAlert = true;
              }
            }
          }
          break;
          
        case 'documentNumber':
          if (!value) {
            errorMessage = 'Document number is required';
          } else {
            // Validate based on document type
            switch (documentType) {
              case 'PAN':
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
                  errorMessage = 'Invalid PAN format (e.g., ABCDE1234F)';
                  showAlert = true;
                }
                break;
              case 'DL':
                if (value.length < 8) {
                  errorMessage = 'Invalid Driving License number';
                  showAlert = true;
                }
                break;
              case 'VID':
                if (!/^\d{10,16}$/.test(value)) {
                  errorMessage = 'Invalid Voter ID format';
                  showAlert = true;
                }
                break;
              case 'PASS':
                if (!/^[A-Z0-9]{8,12}$/.test(value.toUpperCase())) {
                  errorMessage = 'Invalid Passport number format';
                  showAlert = true;
                }
                break;
            }
          }
          break;
          
        case 'expiryDate':
          if ((documentType === 'DL' || documentType === 'PASS') && !value) {
            errorMessage = 'Expiry date is required for this document type';
            showAlert = true;
          } else if (value && !/^\d{2}-\d{2}-\d{4}$/.test(value)) {
            errorMessage = 'Date must be in DD-MM-YYYY format';
            showAlert = true;
          } else if (value) {
            // Additional expiry date validation
            const [day, month, year] = value.split('-').map(num => parseInt(num, 10));
            
            // Check if date parts are valid numbers
            if (isNaN(day) || isNaN(month) || isNaN(year)) {
              errorMessage = 'Invalid date format';
              showAlert = true;
            } else if (day < 1 || day > 31) {
              errorMessage = 'Day must be between 1 and 31';
              showAlert = true;
            } else if (month < 1 || month > 12) {
              errorMessage = 'Month must be between 1 and 12';
              showAlert = true;
            } else if (year < new Date().getFullYear()) {
              errorMessage = 'Expiry date cannot be in the past';
              showAlert = true;
            } else if (year === new Date().getFullYear() && 
                      (month < new Date().getMonth() + 1 || 
                      (month === new Date().getMonth() + 1 && day < new Date().getDate()))) {
              errorMessage = 'Expiry date cannot be in the past';
              showAlert = true;
            } else {
              // Check for valid day-month combinations
              const daysInMonth = new Date(year, month, 0).getDate();
              if (day > daysInMonth) {
                errorMessage = `Invalid date: ${month} has only ${daysInMonth} days`;
                showAlert = true;
              }
            }
          }
          break;
      }
    }
    
    // Update the errors state
    setErrors(prev => ({
      ...prev,
      [field]: errorMessage
    }));
    
    // Show alert for critical validation errors, but only when submitting
    if (isSubmitting && showAlert && errorMessage) {
      ErrorHandler.showErrorAlert(
        'Validation Error',
        errorMessage,
        null,
        false
      );
    }
    
    return !errorMessage;
  };

  // Helper function to get a fresh session if needed
  const getFreshSession = async () => {
    try {
      // Use the validateCustomer API to get fresh session IDs
      console.log('Getting fresh session for wallet creation...');
      const response = await bajajApi.validateCustomerAndSendOtp(
        mobileNo,
        vehicleNo || null,
        chassisNo || null,
        engineNo || null,
        reqType || 'REG'
      );
      
      if (response?.response?.status === 'success' && response?.validateCustResp) {
        const newRequestId = response.validateCustResp.requestId;
        const newSessionId = response.validateCustResp.sessionId;
        
        console.log('Got fresh session IDs:', newRequestId, newSessionId);
        setRequestId(newRequestId);
        setSessionId(newSessionId);
        
        // Redirect to OTP verification screen instead of continuing
        navigation.navigate('ValidateOtpScreen', {
          requestId: newRequestId,
          sessionId: newSessionId,
          mobileNo: mobileNo,
          vehicleNo: vehicleNo || null,
          chassisNo: chassisNo || null, 
          engineNo: engineNo || null,
          returnScreen: 'CreateWallet',  // Add this to know where to return after OTP validation
          walletData: {  // Pass the form data to restore after OTP validation
            firstName: name,
            lastName: lastName,
            dob: dob,
            documentType: documentType,
            documentNumber: documentNumber,
            expiryDate: expiryDate
          }
        });
        
        // Return null to indicate we've redirected instead of continuing
        return null;
      } else {
        console.error('Failed to get fresh session:', response?.response?.errorDesc);
        throw new Error(response?.response?.errorDesc || 'Failed to get fresh session');
      }
    } catch (error) {
      console.error('Error getting fresh session:', error);
      throw error;
    }
  };

  const handleCreateWallet = async () => {
    if (isSubmitting.current) return; // Prevent duplicate submissions
    isSubmitting.current = true;
    
    // Mark that the form has been submitted once
    setFormSubmitted(true);
    
    // Validate all required fields with full validation
    const validName = validateField('name', name, true);
    const validLastName = validateField('lastName', lastName, true);
    const validMobile = validateField('mobileNo', mobileNo, true);
    const validDob = validateField('dob', dob, true);
    const validDocumentNumber = validateField('documentNumber', documentNumber, true);
    const validExpiryDate = validateField('expiryDate', expiryDate, true);
    
    const hasErrors = !(validName && validLastName && validMobile && 
                      validDob && validDocumentNumber && validExpiryDate);
    
    if (hasErrors) {
      ErrorHandler.showErrorAlert(
        'Validation Error',
        'Please correct the errors in the form before continuing.',
        null,
        false
      );
      isSubmitting.current = false;
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if we need a fresh session
      let currentRequestId = requestId;
      let currentSessionId = sessionId;
      
      if (!currentRequestId || !currentSessionId || vrnAlreadyExists) {
        try {
          const sessionResult = await getFreshSession();
          
          // If getFreshSession returned null, it means it has navigated to the OTP screen
          // So we should stop here and not continue with the wallet creation
          if (sessionResult === null) {
            console.log('Redirected to OTP verification, stopping wallet creation flow');
            setLoading(false);
            isSubmitting.current = false;
            return;
          }
          
          currentRequestId = sessionResult.requestId;
          currentSessionId = sessionResult.sessionId;
        } catch (sessionError) {
          console.error('Failed to get fresh session:', sessionError);
          ErrorHandler.showErrorAlert(
            'Session Error',
            'Unable to create a new session. Please try again.',
            null,
            false
          );
          setLoading(false);
          isSubmitting.current = false;
          return;
        }
      }
      
      // Log session information
      console.log('Creating wallet with request ID:', currentRequestId);
      console.log('Creating wallet with session ID:', currentSessionId);
      
      // Prepare user data according to API requirements
      const userData = {
        firstName: name,
        lastName: lastName,
        mobileNo: mobileNo,
        dob: dob,  // Ensure format is DD-MM-YYYY
        documentType: documentType,
        documentNumber: documentNumber,
        expiryDate: (documentType === 'DL' || documentType === 'PASS') ? expiryDate : null,
        // Use our session values
        requestId: currentRequestId,
        sessionId: currentSessionId
      };
      
      console.log('Creating wallet with data:', JSON.stringify(userData, null, 2));
      
      // Call the API through bajajApi service
      const response = await bajajApi.registerUser(userData);
      
      console.log('Create Wallet Response:', JSON.stringify(response, null, 2));
      
      if (response && response.response && response.response.status === 'success') {
        // Add notification
        addNotification({
          id: Date.now(),
          message: 'Wallet created successfully!',
          time: 'Just now',
          read: false
        });
        
        // Get wallet ID and other details from the response
        const walletId = response.custDetails?.walletId || '';
        
        // According to the documentation, after successful wallet creation, 
        // we need to upload all required documents before FasTag registration
        if (vehicleNo && engineNo) {
          // Navigate to ValidateCustomer screen
          navigation.navigate('ValidateCustomer', {
            mobileNo: mobileNo,
            vehicleNo: vehicleNo,
            chassisNo: chassisNo,
            engineNo: engineNo
          });
        } else {
          // If no vehicle details, go to home screen
          navigation.navigate('HomeScreen', { walletId: walletId });
        }
      } else {
        const errorMsg = response?.response?.errorDesc || 'Failed to create wallet';
        const errorCode = response?.response?.errorCode || '';
        
        // Special handling for session errors
        if (errorCode === 'A028' || errorMsg.includes('Invalid session')) {
          // Instead of trying again with a new session directly, redirect to OTP verification
          ErrorHandler.showErrorAlert(
            'Session Expired',
            'Your session has expired. We need to verify your mobile number again.',
            () => {
              // Mark that we're not submitting anymore and reset loading
              setLoading(false);
              isSubmitting.current = false;
              
              // Get a fresh session which will redirect to OTP screen
              getFreshSession()
                .catch(sessionError => {
                  ErrorHandler.showErrorAlert(
                    'Session Error',
                    'Unable to create a new session. Please try again later.',
                    null,
                    false
                  );
                });
            },
            true
          );
          return;
        } else {
          // Regular error handling for non-session errors
          ErrorHandler.showErrorAlert(
            'Wallet Creation Failed',
            errorMsg,
            null,
            true
          );
        }
      }
    } catch (error) {
      console.error('Create Wallet Error:', error);
      
      // Use our error handler for consistent error alerts
      await ErrorHandler.handleApiError(
        error,
        'Create Wallet',
        {
          mobileNo,
          documentType,
          firstName: name,
          lastName: lastName
        },
        FORM_TYPES.CREATE_WALLET,
        'create_wallet'
      );
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  // Document types
  const documentTypes = [
    { label: 'PAN Card', value: 'PAN', code: '1' },
    { label: 'Driving License', value: 'DL', code: '2' },
    { label: 'Voter ID', value: 'VID', code: '3' },
    { label: 'Passport', value: 'PASS', code: '4' }
  ];
  
  // Determine if expiry date field should be shown based on document type
  const showExpiryDate = documentType === 'DL' || documentType === 'PASS';
  
  // Get current selected document type label
  const getDocumentTypeLabel = () => {
    return documentTypes.find(doc => doc.value === documentType)?.label || 'Select Document Type';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Wallet</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Create Your FasTag Wallet</Text>
            <Text style={styles.infoText}>
              Please provide the following details to create your Bajaj FasTag Wallet. All fields marked with * are required.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.textInput, errors.name ? styles.inputError : null]}
                placeholder="Enter your first name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  validateField('name', text);
                }}
                placeholderTextColor="#999999"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>
            
            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.textInput, errors.lastName ? styles.inputError : null]}
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  validateField('lastName', text);
                }}
                placeholderTextColor="#999999"
              />
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>
            
            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.textInput, errors.mobileNo ? styles.inputError : null]}
                placeholder="Enter 10 digit mobile number"
                value={mobileNo}
                onChangeText={(text) => {
                  setMobileNo(text);
                  validateField('mobileNo', text);
                }}
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#999999"
                editable={!routeMobileNo} // Make read-only if passed from route
              />
              {errors.mobileNo ? (
                <Text style={styles.errorText}>{errors.mobileNo}</Text>
              ) : null}
            </View>
            
            {/* Date of Birth - Text input instead of date picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth (DD-MM-YYYY)<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.textInput, errors.dob ? styles.inputError : null]}
                placeholder="DD-MM-YYYY"
                value={dob}
                onChangeText={(text) => handleDateChange(text, setDob)}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#999999"
              />
              {errors.dob ? (
                <Text style={styles.errorText}>{errors.dob}</Text>
              ) : null}
            </View>
            
            {/* Document Type - Custom Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ID Document Type<Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDocumentPicker(true)}
              >
                <Text style={styles.dropdownButtonText}>{getDocumentTypeLabel()}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {/* Document Type Picker Modal */}
              <Modal
                visible={showDocumentPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDocumentPicker(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowDocumentPicker(false)}
                >
                  <View style={styles.modalContent}>
                    <View style={styles.pickerHeader}>
                      <Text style={styles.pickerTitle}>Select Document Type</Text>
                      <TouchableOpacity onPress={() => setShowDocumentPicker(false)}>
                        <Text style={styles.pickerCloseButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.pickerOptions}>
                      {documentTypes.map((doc) => (
                        <TouchableOpacity
                          key={doc.value}
                          style={[
                            styles.pickerOption, 
                            documentType === doc.value && styles.pickerOptionSelected
                          ]}
                          onPress={() => {
                            setDocumentType(doc.value);
                            setShowDocumentPicker(false);
                            // Reset expiry date if changing away from DL or PASS
                            if (doc.value !== 'DL' && doc.value !== 'PASS') {
                              setExpiryDate('');
                            }
                          }}
                        >
                          <Text 
                            style={[
                              styles.pickerOptionText,
                              documentType === doc.value && styles.pickerOptionTextSelected
                            ]}
                          >
                            {doc.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
            
            {/* Document Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Document Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.textInput, errors.documentNumber ? styles.inputError : null]}
                placeholder={`Enter your ${getDocumentTypeLabel()} number`}
                value={documentNumber}
                onChangeText={(text) => {
                  setDocumentNumber(text);
                  validateField('documentNumber', text);
                }}
                placeholderTextColor="#999999"
                autoCapitalize={documentType === 'PAN' || documentType === 'PASS' ? 'characters' : 'none'}
              />
              {errors.documentNumber ? (
                <Text style={styles.errorText}>{errors.documentNumber}</Text>
              ) : null}
            </View>
            
            {/* Document Expiry Date - Only for DL and Passport */}
            {showExpiryDate && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Document Expiry Date (DD-MM-YYYY)<Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, errors.expiryDate ? styles.inputError : null]}
                  placeholder="DD-MM-YYYY"
                  value={expiryDate}
                  onChangeText={(text) => handleDateChange(text, setExpiryDate)}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor="#999999"
                />
                {errors.expiryDate ? (
                  <Text style={styles.errorText}>{errors.expiryDate}</Text>
                ) : null}
              </View>
            )}
          </View>
          
          {/* Create Wallet Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleCreateWallet}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Wallet</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Terms of Service and Privacy Policy</Text>
            <Text style={styles.noticeText}>
              By creating a wallet, you agree to our Terms of Service and Privacy Policy.
              Your information will be securely stored and used only for FasTag related services.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#6200EE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 32, // Add extra padding at bottom for better scrolling
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6200EE',
    lineHeight: 20,
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
    marginBottom: 8,
  },
  required: {
    color: '#FF0000',
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#6200EE',
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  pickerCloseButton: {
    fontSize: 18,
    color: '#666666',
    padding: 4,
  },
  pickerOptions: {
    paddingVertical: 8,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pickerOptionSelected: {
    backgroundColor: '#F0F7FF',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  pickerOptionTextSelected: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#999999',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noticeCard: {
    backgroundColor: '#EDE7F6',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#6200EE',
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletList: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: '#6200EE',
    lineHeight: 22,
  },
});

export default CreateWalletScreen;