import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  Animated,
  Modal,
  Platform,
  FlatList
} from 'react-native';

const UserDetailsScreen = ({ route, navigation }) => {
  const { vehicleDetails } = route.params || {};
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Date picker modal
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const [dateInput, setDateInput] = useState('');
  
  // User details state
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    pan: '',
    aadhaar: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
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
  
  // Field validation
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          error = 'Invalid email format';
        }
        break;
      case 'pan':
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          error = 'Invalid PAN format (e.g., ABCDE1234F)';
        }
        break;
      case 'aadhaar':
        if (value && !/^\d{12}$/.test(value)) {
          error = 'Aadhaar should be 12 digits';
        }
        break;
      case 'pincode':
        if (value && !/^\d{6}$/.test(value)) {
          error = 'Pincode should be 6 digits';
        }
        break;
      case 'dob':
        // Simple date validation (improve in a real app)
        if (value && !/^\d{2}-\d{2}-\d{4}$/.test(value)) {
          error = 'Use DD-MM-YYYY format';
        }
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  };
  
  // Update form fields
  const handleInputChange = (field, value) => {
    setUserDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    validateField(field, value);
  };
  
  // Date picking functionality
  const showDatePicker = () => {
    setDatePickerVisible(true);
    setShowDateInput(false);
  };
  
  const toggleDateInput = () => {
    setDatePickerVisible(true);
    setShowDateInput(true);
    setDateInput(userDetails.dob || '');
  };
  
  const handleDateSelect = (date) => {
    // Format: DD-MM-YYYY
    const formattedDate = date; // In a real app, format the selected date
    
    setUserDetails(prev => ({
      ...prev,
      dob: formattedDate
    }));
    
    setDatePickerVisible(false);
    validateField('dob', formattedDate);
  };
  
  const handleDateInputChange = (text) => {
    setDateInput(text);
  };
  
  const submitDateInput = () => {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dateInput)) {
      alert('Please use DD-MM-YYYY format');
      return;
    }
    
    setUserDetails(prev => ({
      ...prev,
      dob: dateInput
    }));
    
    setDatePickerVisible(false);
    validateField('dob', dateInput);
  };
  
  // Generate calendar dates (simplified for demo)
  const generateDates = () => {
    // Just showing some sample dates for the demo
    return [
      '21-11-1990',
      '21-11-1991',
      '21-11-1992',
      '21-11-1993',
      '21-11-1994',
      '21-11-1995',
      '21-11-1996',
      '21-11-1997',
      '21-11-1998',
      '21-11-1999',
      '21-11-2000'
    ];
  };
  
  // Submit function
  const handleProceed = () => {
    // Validate all required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'dob', 'pan', 'aadhaar'];
    let isValid = true;
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!userDetails[field]) {
        newErrors[field] = 'This field is required';
        isValid = false;
      } else {
        isValid = validateField(field, userDetails[field]) && isValid;
      }
    });
    
    setErrors(newErrors);
    
    if (isValid) {
      // Navigate to OTP verification
      navigation.navigate('OtpVerification', {
        vehicleDetails,
        userDetails
      });
    } else {
      // Scroll to the first error (in a real app)
      alert('Please fill in all required fields correctly');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>Personal Information</Text>
          <Text style={styles.subtitle}>Please provide your personal details</Text>
          
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.firstName ? styles.inputError : null]}
              placeholder="Enter your first name"
              value={userDetails.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
            />
            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
          </View>
          
          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.lastName ? styles.inputError : null]}
              placeholder="Enter your last name"
              value={userDetails.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
            />
            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
          </View>
          
          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth<Text style={styles.required}>*</Text></Text>
            <View style={styles.dateInputContainer}>
              <TouchableOpacity 
                style={[styles.dateDisplay, errors.dob ? styles.inputError : null]}
                onPress={showDatePicker}
              >
                <Text style={userDetails.dob ? styles.dateText : styles.placeholderText}>
                  {userDetails.dob || 'DD-MM-YYYY'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.calendarButton}
                onPress={toggleDateInput}
              >
                <Text style={styles.calendarButtonText}>✏️</Text>
              </TouchableOpacity>
            </View>
            {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
          </View>
          
          {/* PAN Card */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAN Card Number<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.pan ? styles.inputError : null]}
              placeholder="Enter your PAN (e.g., ABCDE1234F)"
              value={userDetails.pan}
              onChangeText={(text) => handleInputChange('pan', text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
            />
            {errors.pan ? <Text style={styles.errorText}>{errors.pan}</Text> : null}
          </View>
          
          {/* Aadhaar */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Aadhaar Number<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.aadhaar ? styles.inputError : null]}
              placeholder="Enter your 12-digit Aadhaar"
              value={userDetails.aadhaar}
              onChangeText={(text) => handleInputChange('aadhaar', text)}
              keyboardType="number-pad"
              maxLength={12}
            />
            {errors.aadhaar ? <Text style={styles.errorText}>{errors.aadhaar}</Text> : null}
          </View>
          
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Enter your email address"
              value={userDetails.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>
          
          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your address"
              value={userDetails.address}
              onChangeText={(text) => handleInputChange('address', text)}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* City, State, Pincode in a row */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={userDetails.city}
                onChangeText={(text) => handleInputChange('city', text)}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                value={userDetails.state}
                onChangeText={(text) => handleInputChange('state', text)}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={[styles.input, errors.pincode ? styles.inputError : null]}
                placeholder="Pincode"
                value={userDetails.pincode}
                onChangeText={(text) => handleInputChange('pincode', text)}
                keyboardType="number-pad"
                maxLength={6}
              />
              {errors.pincode ? <Text style={styles.errorText}>{errors.pincode}</Text> : null}
            </View>
          </View>
          
          {/* Vehicle Information Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Vehicle Information</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle No:</Text>
              <Text style={styles.summaryValue}>{vehicleDetails?.vehicleNo}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Make:</Text>
              <Text style={styles.summaryValue}>{vehicleDetails?.makeModel.split(' ')[0]}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle Class:</Text>
              <Text style={styles.summaryValue}>{vehicleDetails?.vehicleClass}</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Verify OTP Button */}
        <TouchableOpacity 
          style={styles.proceedButton} 
          onPress={handleProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.proceedButtonText}>Verify OTP</Text>
        </TouchableOpacity>
        
        <View style={{ height: 20 }} />
      </ScrollView>
      
      {/* Enhanced Date Picker Modal */}
      <Modal
        transparent={true}
        visible={datePickerVisible}
        animationType="slide"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{showDateInput ? 'Enter Date' : 'Select Date'}</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            
            {showDateInput ? (
              <View style={styles.dateInputModalContainer}>
                <Text style={styles.dateInputLabel}>Enter date in DD-MM-YYYY format</Text>
                <TextInput
                  style={styles.dateInputField}
                  value={dateInput}
                  onChangeText={handleDateInputChange}
                  placeholder="DD-MM-YYYY"
                  maxLength={10}
                  keyboardType="number-pad"
                />
                <View style={styles.dateInputButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.calendarOption}
                    onPress={() => setShowDateInput(false)}
                  >
                    <Text style={styles.calendarOptionText}>Use Calendar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.submitDateButton}
                    onPress={submitDateInput}
                  >
                    <Text style={styles.submitDateText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.calendarContainer}>
                  {/* This would be a proper calendar in a real app */}
                  <Text style={styles.calendarTitle}>Calendar (Sample Dates)</Text>
                  
                  <FlatList
                    data={generateDates()}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.dateOption}
                        onPress={() => handleDateSelect(item)}
                      >
                        <Text style={styles.dateOptionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item}
                    style={styles.datesList}
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.manualEntryButton}
                  onPress={() => setShowDateInput(true)}
                >
                  <Text style={styles.manualEntryText}>Enter Date Manually</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  required: {
    color: '#FF0000',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
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
  dateInputContainer: {
    flexDirection: 'row',
  },
  dateDisplay: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    flex: 1,
    justifyContent: 'center',
  },
  calendarButton: {
    backgroundColor: '#EEEEEE',
    padding: 12,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  calendarButtonText: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryContainer: {
    marginTop: 24,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    width: 100,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
  },
  proceedButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666666',
    padding: 4,
  },
  // Calendar styles
  calendarContainer: {
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  datesList: {
    maxHeight: 300,
  },
  dateOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  manualEntryButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  manualEntryText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  // Date input styles
  dateInputModalContainer: {
    padding: 8,
  },
  dateInputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  dateInputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  dateInputButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarOption: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  calendarOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  submitDateButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitDateText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default UserDetailsScreen; 