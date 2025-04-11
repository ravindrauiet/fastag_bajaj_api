import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator 
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';
import bajajApi from '../api/bajajApi';

const ValidateCustomerScreen = ({ navigation, route }) => {
  // Get params from route if available
  const {
    mobileNo: initialMobileNo = '',
    vehicleNo: initialVehicleNo = '',
    chassisNo: initialChassisNo = '',
    engineNo: initialEngineNo = '',
    reqType: initialReqType = 'REG'
  } = route?.params || {};

  // Form state
  const [mobileNo, setMobileNo] = useState(initialMobileNo);
  const [vehicleNo, setVehicleNo] = useState(initialVehicleNo);
  const [chassisNo, setChassisNo] = useState(initialChassisNo);
  const [engineNo, setEngineNo] = useState(initialEngineNo);
  const [reqType, setReqType] = useState(initialReqType); // Default to Registration
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);

  // Validate form fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Mobile number validation
    if (!mobileNo.trim()) {
      newErrors.mobileNo = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(mobileNo)) {
      newErrors.mobileNo = 'Mobile number must be 10 digits';
      isValid = false;
    }
    
    // Either vehicleNo or chassisNo is required
    if (!vehicleNo.trim() && !chassisNo.trim()) {
      newErrors.vehicleNo = 'Either Vehicle Number or Chassis Number is required';
      newErrors.chassisNo = 'Either Vehicle Number or Chassis Number is required';
      isValid = false;
    }
    
    // If vehicle number is provided, validate format
    if (vehicleNo.trim() && !/^[A-Z0-9]{5,10}$/.test(vehicleNo)) {
      newErrors.vehicleNo = 'Enter a valid vehicle number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle Send OTP button press
  const handleSendOtp = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Sending OTP with parameters:');
      console.log('Mobile:', mobileNo);
      console.log('Vehicle:', vehicleNo);
      console.log('Chassis:', chassisNo);
      console.log('Engine:', engineNo);
      console.log('Req Type:', reqType);
      
      const response = await bajajApi.validateCustomerAndSendOtp(
        mobileNo,
        vehicleNo.trim() ? vehicleNo : null,
        chassisNo.trim() ? chassisNo : null,
        engineNo.trim() ? engineNo : null,
        reqType
      );
      
      console.log('Send OTP Response:', JSON.stringify(response, null, 2));
      
      if (response && response.response && response.response.status === 'success') {
        // Extract and log key parameters from response
        const requestId = response.validateCustResp?.requestId;
        const sessionId = response.validateCustResp?.sessionId;
        
        console.log('Successfully extracted parameters for OTP verification:');
        console.log('RequestId:', requestId);
        console.log('SessionId:', sessionId);
        
        // Add notification
        addNotification({
          id: Date.now(),
          message: `OTP sent to ${mobileNo}`,
          time: 'Just now',
          read: false
        });
        
        // Navigate to OTP verification screen with necessary params
        navigation.navigate('ValidateOtp', {
          requestId: response.validateCustResp.requestId,
          sessionId: response.validateCustResp.sessionId,
          mobileNo: mobileNo,
          vehicleNo: vehicleNo,
          chassisNo: chassisNo,
          engineNo: engineNo,
          reqType: reqType
        });
      } else {
        const errorMsg = response?.response?.errorDesc || 'Failed to send OTP';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      Alert.alert(
        'Error',
        `Failed to send OTP: ${error.message}`,
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
        <Text style={styles.headerTitle}>Validate Customer</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Validate Customer Details</Text>
          <Text style={styles.infoText}>
            Please enter customer mobile number and either the vehicle number or chassis number 
            to validate and send an OTP for verification.
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.mobileNo ? styles.inputError : null]}
              placeholder="Enter 10 digit mobile number"
              value={mobileNo}
              onChangeText={setMobileNo}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.mobileNo ? (
              <Text style={styles.errorText}>{errors.mobileNo}</Text>
            ) : null}
          </View>
          
          {/* Request Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Request Type<Text style={styles.required}>*</Text></Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, reqType === 'REG' ? styles.selectedOption : null]}
                onPress={() => setReqType('REG')}
              >
                <Text style={[styles.optionText, reqType === 'REG' ? styles.selectedOptionText : null]}>
                  Registration
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, reqType === 'REP' ? styles.selectedOption : null]}
                onPress={() => setReqType('REP')}
              >
                <Text style={[styles.optionText, reqType === 'REP' ? styles.selectedOptionText : null]}>
                  Replacement
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Vehicle Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Number<Text style={styles.required}>**</Text></Text>
            <TextInput
              style={[styles.input, errors.vehicleNo ? styles.inputError : null]}
              placeholder="Enter vehicle number"
              value={vehicleNo}
              onChangeText={(text) => setVehicleNo(text.toUpperCase())}
              autoCapitalize="characters"
            />
            {errors.vehicleNo ? (
              <Text style={styles.errorText}>{errors.vehicleNo}</Text>
            ) : null}
          </View>
          
          <Text style={styles.orText}>OR</Text>
          
          {/* Chassis Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chassis Number<Text style={styles.required}>**</Text></Text>
            <TextInput
              style={[styles.input, errors.chassisNo ? styles.inputError : null]}
              placeholder="Enter chassis number"
              value={chassisNo}
              onChangeText={(text) => setChassisNo(text.toUpperCase())}
              autoCapitalize="characters"
            />
            {errors.chassisNo ? (
              <Text style={styles.errorText}>{errors.chassisNo}</Text>
            ) : null}
          </View>
          
          {/* Engine Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Engine Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter engine number (optional)"
              value={engineNo}
              onChangeText={(text) => setEngineNo(text.toUpperCase())}
              autoCapitalize="characters"
            />
          </View>
          
          <Text style={styles.noteText}>
            * Required fields
          </Text>
          <Text style={styles.noteText}>
            ** Either Vehicle Number or Chassis Number is required
          </Text>
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Send OTP</Text>
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: '#333333',
  },
  optionText: {
    color: '#333333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  orText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#777777',
  },
  noteText: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#999999',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ValidateCustomerScreen;
