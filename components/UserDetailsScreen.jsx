import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';
import bajajApi from '../api/bajajApi';

const UserDetailsScreen = ({ navigation, route }) => {
  // Get params from previous screen
  const {
    requestId,
    sessionId,
    mobileNo,
    vehicleNo,
    chassisNo,
    engineNo
  } = route.params;

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [documentType, setDocumentType] = useState('PAN'); // PAN, DL, VID, PASS
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);

  // Format date input (dd-mm-yyyy)
  const formatDateInput = (text, setter) => {
    // Remove any non-digit or non-hyphen characters
    text = text.replace(/[^\d-]/g, '');
    
    // Auto-add hyphens
    if (text.length === 2 && !text.includes('-')) {
      text = text + '-';
    } else if (text.length === 5 && text.charAt(4) !== '-') {
      text = text.slice(0, 5) + '-' + text.slice(5);
    }
    
    // Ensure we don't exceed the max length (10 chars for dd-mm-yyyy)
    if (text.length <= 10) {
      setter(text);
    }
  };

  // Validate form fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    
    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }
    
    // Date of birth validation
    if (!dob.trim()) {
      newErrors.dob = 'Date of birth is required';
      isValid = false;
    } else if (!/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
      newErrors.dob = 'Date of birth must be in DD-MM-YYYY format';
      isValid = false;
    }
    
    // Document number validation
    if (!documentNumber.trim()) {
      newErrors.documentNumber = 'Document number is required';
      isValid = false;
    } else {
      // Validate based on document type
      switch (documentType) {
        case 'PAN':
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(documentNumber)) {
            newErrors.documentNumber = 'Enter a valid PAN number';
            isValid = false;
          }
          break;
        case 'DL':
          if (documentNumber.length < 9) {
            newErrors.documentNumber = 'Enter a valid Driving License number';
            isValid = false;
          }
          
          // Expiry date validation for DL
          if (!expiryDate.trim()) {
            newErrors.expiryDate = 'Expiry date is required for Driving License';
            isValid = false;
          } else if (!/^\d{2}-\d{2}-\d{4}$/.test(expiryDate)) {
            newErrors.expiryDate = 'Expiry date must be in DD-MM-YYYY format';
            isValid = false;
          }
          break;
        case 'VID':
          if (documentNumber.length < 10) {
            newErrors.documentNumber = 'Enter a valid Voter ID';
            isValid = false;
          }
          break;
        case 'PASS':
          if (documentNumber.length < 8) {
            newErrors.documentNumber = 'Enter a valid Passport number';
            isValid = false;
          }
          
          // Expiry date validation for Passport
          if (!expiryDate.trim()) {
            newErrors.expiryDate = 'Expiry date is required for Passport';
            isValid = false;
          } else if (!/^\d{2}-\d{2}-\d{4}$/.test(expiryDate)) {
            newErrors.expiryDate = 'Expiry date must be in DD-MM-YYYY format';
            isValid = false;
          }
          break;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle document type selection
  const handleDocTypeSelect = (type) => {
    setDocumentType(type);
    // Clear expiry date when switching from/to document types that don't need it
    if (type !== 'DL' && type !== 'PASS') {
      setExpiryDate('');
    }
  };

  // Handle registration submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare user data
      const userData = {
        firstName: firstName,
        lastName: lastName,
        mobileNo: mobileNo,
        dob: dob,
        documentType: documentType,
        documentNumber: documentNumber,
        expiryDate: (documentType === 'DL' || documentType === 'PASS') ? expiryDate : null,
        requestId: requestId,
        sessionId: sessionId
      };
      
      // Call API to register user
      const response = await bajajApi.registerUser(userData);
      
      console.log('Register User Response:', response);
      
      if (response && response.response && response.response.status === 'success') {
        // Add notification
        addNotification({
          id: Date.now(),
          message: 'User registered successfully',
          time: 'Just now',
          read: false
        });
        
        // Navigate to FasTag registration
        navigation.navigate('FasTagRegistration', {
          requestId: requestId,
          sessionId: sessionId,
          mobileNo: mobileNo,
          vehicleNo: vehicleNo,
          chassisNo: chassisNo,
          engineNo: engineNo,
          customerId: response.response.customerId || '',
          walletId: response.response.walletId || ''
        });
      } else {
        const errorMsg = response?.response?.errorDesc || 'Failed to register user';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('User Registration Error:', error);
      Alert.alert(
        'Registration Error',
        `Failed to register user: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Enter User Details</Text>
          <Text style={styles.infoText}>
            Please provide the following details to create a new wallet for FasTag.
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.firstName ? styles.inputError : null]}
              placeholder="Enter first name"
              value={firstName}
              onChangeText={setFirstName}
            />
            {errors.firstName ? (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            ) : null}
          </View>
          
          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.lastName ? styles.inputError : null]}
              placeholder="Enter last name"
              value={lastName}
              onChangeText={setLastName}
            />
            {errors.lastName ? (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            ) : null}
          </View>
          
          {/* Mobile Number (display only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#F5F5F5' }]}
              value={mobileNo}
              editable={false}
            />
          </View>
          
          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.dob ? styles.inputError : null]}
              placeholder="DD-MM-YYYY"
              value={dob}
              onChangeText={(text) => formatDateInput(text, setDob)}
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.dob ? (
              <Text style={styles.errorText}>{errors.dob}</Text>
            ) : null}
          </View>
          
          {/* Document Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Document Type<Text style={styles.required}>*</Text></Text>
            <View style={styles.docTypeContainer}>
              <TouchableOpacity
                style={[styles.docTypeButton, documentType === 'PAN' ? styles.selectedDocType : null]}
                onPress={() => handleDocTypeSelect('PAN')}
              >
                <Text style={[styles.docTypeText, documentType === 'PAN' ? styles.selectedDocTypeText : null]}>
                  PAN Card
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.docTypeButton, documentType === 'DL' ? styles.selectedDocType : null]}
                onPress={() => handleDocTypeSelect('DL')}
              >
                <Text style={[styles.docTypeText, documentType === 'DL' ? styles.selectedDocTypeText : null]}>
                  Driving License
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.docTypeButton, documentType === 'VID' ? styles.selectedDocType : null]}
                onPress={() => handleDocTypeSelect('VID')}
              >
                <Text style={[styles.docTypeText, documentType === 'VID' ? styles.selectedDocTypeText : null]}>
                  Voter ID
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.docTypeButton, documentType === 'PASS' ? styles.selectedDocType : null]}
                onPress={() => handleDocTypeSelect('PASS')}
              >
                <Text style={[styles.docTypeText, documentType === 'PASS' ? styles.selectedDocTypeText : null]}>
                  Passport
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Document Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Document Number<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.documentNumber ? styles.inputError : null]}
              placeholder={`Enter ${documentType === 'PAN' ? 'PAN' : 
                documentType === 'DL' ? 'Driving License' : 
                documentType === 'VID' ? 'Voter ID' : 'Passport'} number`}
              value={documentNumber}
              onChangeText={(text) => setDocumentNumber(documentType === 'PAN' ? text.toUpperCase() : text)}
              autoCapitalize={documentType === 'PAN' ? 'characters' : 'none'}
            />
            {errors.documentNumber ? (
              <Text style={styles.errorText}>{errors.documentNumber}</Text>
            ) : null}
          </View>
          
          {/* Expiry Date (only for DL and Passport) */}
          {(documentType === 'DL' || documentType === 'PASS') && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document Expiry Date<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.expiryDate ? styles.inputError : null]}
                placeholder="DD-MM-YYYY"
                value={expiryDate}
                onChangeText={(text) => formatDateInput(text, setExpiryDate)}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.expiryDate ? (
                <Text style={styles.errorText}>{errors.expiryDate}</Text>
              ) : null}
            </View>
          )}
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Register</Text>
          )}
        </TouchableOpacity>
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
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#6200EE',
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
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  required: {
    color: '#FF0000',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#6200EE',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 4,
  },
  docTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  docTypeButton: {
    width: '48%',
    backgroundColor: '#EDE7F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedDocType: {
    backgroundColor: '#6200EE',
  },
  docTypeText: {
    color: '#6200EE',
    fontWeight: '500',
  },
  selectedDocTypeText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#6200EE',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserDetailsScreen; 