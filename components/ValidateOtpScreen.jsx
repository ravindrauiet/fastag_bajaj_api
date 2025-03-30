import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';
import bajajApi from '../api/bajajApi';

const ValidateOtpScreen = ({ navigation, route }) => {
  // Get params from previous screen
  const {
    requestId,
    sessionId,
    mobileNo,
    vehicleNo,
    chassisNo,
    engineNo,
    reqType
  } = route.params;

  // OTP state management
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);

  // Timer for OTP resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle input focus when OTP is entered
  const handleOtpChange = (value, index) => {
    // Only allow digits
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // If digit entered, move to next input field
      if (value && index < 5) {
        otpInputs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace in OTP input
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // If current field is empty and backspace is pressed, move to previous field
      otpInputs.current[index - 1].focus();
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await bajajApi.validateCustomerAndSendOtp(
        mobileNo,
        vehicleNo,
        chassisNo,
        engineNo
      );
      
      console.log('Resend OTP Response:', JSON.stringify(response, null, 2));
      
      if (response && response.response && response.response.status === 'success') {
        // Extract the NEW requestId and sessionId from the response
        const newRequestId = response.validateCustResp?.requestId;
        const newSessionId = response.validateCustResp?.sessionId;
        
        console.log('New RequestId:', newRequestId);
        console.log('New SessionId:', newSessionId);
        
        // Verify we have the new values before updating
        if (!newRequestId || !newSessionId) {
          throw new Error('Missing requestId or sessionId in OTP response');
        }
        
        // Update the route params with the new values
        route.params.requestId = newRequestId;
        route.params.sessionId = newSessionId;
        
        addNotification({
          id: Date.now(),
          message: `OTP resent to ${mobileNo}`,
          time: 'Just now',
          read: false
        });
        
        // Reset timer and OTP fields
        setTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        
        // Focus the first OTP input
        if (otpInputs.current && otpInputs.current[0]) {
          otpInputs.current[0].focus();
        }
      } else {
        const errorMsg = response?.response?.errorDesc || 'Failed to resend OTP';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      Alert.alert(
        'Error',
        `Failed to resend OTP: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      // Enhanced logging for the parameters being sent to the API
      console.log('===== OTP VERIFICATION DETAILS =====');
      console.log('OTP string entered by user:', otpString);
      console.log('RequestId from sendOtp response:', route.params.requestId);
      console.log('SessionId from sendOtp response:', route.params.sessionId);
      
      // According to the API documentation:
      // validateOtpReq: {
      //   otp: "123456",        <- The 6-digit OTP entered by user
      //   requestId: "...",     <- From the sendOtp response
      //   sessionId: "...",     <- From the sendOtp response
      //   channel: "...",
      //   agentId: "...",
      //   reqDateTime: "..."
      // }
      const response = await bajajApi.verifyOtp(
        otpString,                 // The 6-digit OTP entered by the user
        route.params.requestId,    // The requestId from sendOtp response
        route.params.sessionId     // The sessionId from sendOtp response
      );
      
      console.log('Verify OTP Full Response:', JSON.stringify(response, null, 2));
      
      if (response && response.response && response.response.status === 'success') {
        addNotification({
          id: Date.now(),
          message: 'OTP verification successful',
          time: 'Just now',
          read: false
        });
        
        // Navigate to the appropriate screen based on response data
        if (reqType === 'REG') {
          // For registration, check if customer already exists
          if (response.response.isExisting === 'Y') {
            // Existing customer - go to FasTag registration
            navigation.navigate('FasTagRegistration', {
              requestId: route.params.requestId,
              sessionId: route.params.sessionId,
              mobileNo,
              vehicleNo,
              chassisNo,
              engineNo,
              customerId: response.response.customerId || '',
              walletId: response.response.walletId || ''
            });
          } else {
            // New customer - go to user details screen
            navigation.navigate('UserDetails', {
              requestId: route.params.requestId,
              sessionId: route.params.sessionId,
              mobileNo,
              vehicleNo,
              chassisNo,
              engineNo
            });
          }
        } else if (reqType === 'REP') {
          // For replacement, go to FasTag replacement screen
          navigation.navigate('FasTagReplacement', {
            requestId: route.params.requestId,
            sessionId: route.params.sessionId,
            mobileNo,
            vehicleNo,
            chassisNo,
            engineNo,
            customerId: response.response.customerId || '',
            walletId: response.response.walletId || ''
          });
        }
      } else {
        const errorMsg = response?.response?.errorDesc || 'Failed to verify OTP';
        throw new Error(errorMsg || response?.response?.msg || 'OTP verification failed');
      }
    } catch (error) {
      console.error('=== OTP VERIFICATION ERROR ===');
      console.error(error);
      Alert.alert(
        'Error',
        `Failed to verify OTP: ${error.message}`,
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
        <Text style={styles.headerTitle}>Verify OTP</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Enter OTP</Text>
          <Text style={styles.infoText}>
            We've sent a 6-digit OTP to {mobileNo}. Please enter it below to verify.
          </Text>
        </View>
        
        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(input) => (otpInputs.current[index] = input)}
              style={styles.otpInput}
              value={otp[index]}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </View>
        
        {/* Debug Info */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info (will be hidden in production)</Text>
          <Text style={styles.debugText}>RequestId: {route.params.requestId}</Text>
          <Text style={styles.debugText}>SessionId: {route.params.sessionId}</Text>
          <Text style={styles.debugText}>Mobile: {mobileNo}</Text>
          <Text style={styles.debugText}>Vehicle: {vehicleNo || 'N/A'}</Text>
          <Text style={styles.debugText}>Current OTP: {otp.join('')}</Text>
        </View>
        
        {/* Timer & Resend */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity 
              onPress={handleResendOtp}
              disabled={loading}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
          )}
        </View>
        
        {/* Verify Button */}
        <TouchableOpacity 
          style={[styles.verifyButton, loading && styles.disabledButton]}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
      </View>
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
    marginBottom: 32,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 46,
    height: 56,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#FFFFFF',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  timerText: {
    color: '#777777',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999999',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugSection: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  debugTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ValidateOtpScreen;