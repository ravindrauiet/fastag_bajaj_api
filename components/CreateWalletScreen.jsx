import React, { useState, useEffect, useContext } from 'react';
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
  Modal
} from 'react-native';
import bajajApi from '../api/bajajApi';
import { NotificationContext } from '../contexts/NotificationContext';

const CreateWalletScreen = ({ navigation, route }) => {
  // Get parameters from route
  const { 
    requestId,
    sessionId,
    mobileNo: routeMobileNo,
    vehicleNo,
    chassisNo,
    engineNo,
    reqType
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
  
  // Document types
  const documentTypes = [
    { label: 'PAN Card', value: 'PAN', code: '1' },
    { label: 'Driving License', value: 'DL', code: '2' },
    { label: 'Voter ID', value: 'VID', code: '3' },
    { label: 'Passport', value: 'PASS', code: '4' }
  ];
  
  // Context
  const { addNotification } = useContext(NotificationContext);
  
  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
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
  
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'name':
        if (!value) {
          error = 'First name is required';
        }
        break;
        
      case 'lastName':
        if (!value) {
          error = 'Last name is required';
        }
        break;
        
      case 'mobileNo':
        if (!value) {
          error = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(value)) {
          error = 'Mobile number must be 10 digits';
        }
        break;
        
      case 'dob':
        if (!value) {
          error = 'Date of birth is required';
        } else if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) {
          error = 'Date must be in DD-MM-YYYY format';
        } else {
          // Additional date validation
          const [day, month, year] = value.split('-').map(num => parseInt(num, 10));
          
          // Check if date parts are valid numbers
          if (isNaN(day) || isNaN(month) || isNaN(year)) {
            error = 'Invalid date format';
          } else if (day < 1 || day > 31) {
            error = 'Day must be between 1 and 31';
          } else if (month < 1 || month > 12) {
            error = 'Month must be between 1 and 12';
          } else if (year < 1900 || year > new Date().getFullYear()) {
            error = `Year must be between 1900 and ${new Date().getFullYear()}`;
          } else {
            // Check for valid day-month combinations
            const daysInMonth = new Date(year, month, 0).getDate();
            if (day > daysInMonth) {
              error = `Invalid date: ${month} has only ${daysInMonth} days`;
            }
            
            // Check if user is at least 18 years old
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())))) {
              error = 'You must be at least 18 years old';
            }
          }
        }
        break;
        
      case 'documentNumber':
        if (!value) {
          error = 'Document number is required';
        } else {
          // Validate based on document type
          switch (documentType) {
            case 'PAN':
              if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
                error = 'Invalid PAN format (e.g., ABCDE1234F)';
              }
              break;
            case 'DL':
              if (value.length < 8) {
                error = 'Invalid Driving License number';
              }
              break;
            case 'VID':
              if (!/^\d{10,16}$/.test(value)) {
                error = 'Invalid Voter ID format';
              }
              break;
            case 'PASS':
              if (!/^[A-Z0-9]{8,12}$/.test(value.toUpperCase())) {
                error = 'Invalid Passport number format';
              }
              break;
          }
        }
        break;
        
      case 'expiryDate':
        if ((documentType === 'DL' || documentType === 'PASS') && !value) {
          error = 'Expiry date is required for this document type';
        } else if (value && !/^\d{2}-\d{2}-\d{4}$/.test(value)) {
          error = 'Date must be in DD-MM-YYYY format';
        } else if (value) {
          // Additional expiry date validation
          const [day, month, year] = value.split('-').map(num => parseInt(num, 10));
          
          // Check if date parts are valid numbers
          if (isNaN(day) || isNaN(month) || isNaN(year)) {
            error = 'Invalid date format';
          } else if (day < 1 || day > 31) {
            error = 'Day must be between 1 and 31';
          } else if (month < 1 || month > 12) {
            error = 'Month must be between 1 and 12';
          } else if (year < new Date().getFullYear()) {
            error = 'Expiry date cannot be in the past';
          } else if (year === new Date().getFullYear() && 
                    (month < new Date().getMonth() + 1 || 
                    (month === new Date().getMonth() + 1 && day < new Date().getDate()))) {
            error = 'Expiry date cannot be in the past';
          } else {
            // Check for valid day-month combinations
            const daysInMonth = new Date(year, month, 0).getDate();
            if (day > daysInMonth) {
              error = `Invalid date: ${month} has only ${daysInMonth} days`;
            }
          }
        }
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  };

  const handleCreateWallet = async () => {
    // Validate all required fields
    const validName = validateField('name', name);
    const validLastName = validateField('lastName', lastName);
    const validMobile = validateField('mobileNo', mobileNo);
    const validDob = validateField('dob', dob);
    const validDocumentNumber = validateField('documentNumber', documentNumber);
    const validExpiryDate = validateField('expiryDate', expiryDate);
    
    if (!(validName && validLastName && validMobile && validDob && validDocumentNumber && validExpiryDate)) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare user data according to API requirements
      const userData = {
        firstName: name,
        lastName: lastName,
        mobileNo: mobileNo,
        dob: dob,  // Ensure format is DD-MM-YYYY
        documentType: documentType,
        documentNumber: documentNumber,
        expiryDate: (documentType === 'DL' || documentType === 'PASS') ? expiryDate : null,
        // Pass the original requestId and sessionId from OTP verification
        requestId: requestId,
        sessionId: sessionId
      };
      
      console.log('Creating wallet with data:', JSON.stringify(userData, null, 2));
      console.log('Using original requestId:', requestId);
      console.log('Using original sessionId:', sessionId);
      
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
          // Navigate to ValidateCustomer screen instead of Document Upload
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
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Create Wallet Error:', error);
      Alert.alert(
        'Error',
        `Failed to create wallet: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

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
              <Text style={styles.label}>First Name<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
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
              <Text style={styles.label}>Last Name<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.lastName ? styles.inputError : null]}
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
              <Text style={styles.label}>Mobile Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.mobileNo ? styles.inputError : null]}
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
              <Text style={styles.label}>Date of Birth (DD-MM-YYYY)<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.dob ? styles.inputError : null]}
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
              <Text style={styles.label}>ID Document Type<Text style={styles.required}>*</Text></Text>
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
              <Text style={styles.label}>Document Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.documentNumber ? styles.inputError : null]}
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
                <Text style={styles.label}>Document Expiry Date (DD-MM-YYYY)<Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.expiryDate ? styles.inputError : null]}
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
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleCreateWallet}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Wallet</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.noticeContainer}>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
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
    padding: 20,
    marginBottom: 24,
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
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
  button: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#999999',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noticeContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
  },
  noticeText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default CreateWalletScreen;