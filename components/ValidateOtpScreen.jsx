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
  Alert,
  Switch
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';
import bajajApi from '../api/bajajApi';

// Development mode flag - set to true to bypass API calls
const DEV_MODE = true;

const ValidateOtpScreen = ({ navigation, route }) => {
  // Get params from previous screen with default values to prevent undefined errors
  const {
    requestId = '',
    sessionId = '',
    mobileNo = '',
    vehicleNo = '',
    chassisNo = '',
    engineNo = '',
    reqType = 'REG'
  } = route?.params || {};

  // OTP state management
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [devMode, setDevMode] = useState(DEV_MODE);
  
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
        // We can't directly modify route.params, so we'll use navigation with new params
        navigation.setParams({
          requestId: newRequestId,
          sessionId: newSessionId
        });
        
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
      console.log('RequestId from sendOtp response:', requestId);
      console.log('SessionId from sendOtp response:', sessionId);
      
      let response;
      
      if (devMode) {
        // Development mode - simulate API response
        console.log('DEV MODE: Simulating OTP verification response');
        
        // Create a simulated response based on the provided data
        response = {
          response: {
            msg: "Request is successful",
            status: "success",
            code: "00",
            errorCode: "",
            errorDesc: ""
          },
          validateOtpResp: {
            vrnDetails: {
              vehicleNo: vehicleNo || "HR51BU0439",
              engineNo: engineNo || "600432ENCS28188",
              chassisNo: chassisNo || "CHS81B97A65D4A1249344",
              vehicleManuf: "FORDINDIAPVTLTD",
              model: "FORDECOSPORT",
              vehicleColour: "WHITE",
              type: "VC4",
              rtoStatus: "ACTIVE",
              tagVehicleClassID: "4",
              npciVehicleClassID: "4",
              vehicleType: "PETROL",
              rechargeAmount: "100.0",
              securityDeposit: "200.0",
              tagCost: "100.0",
              repTagCost: "0.00",
              vehicleDescriptor: "PETROL",
              isNationalPermit: "1",
              permitExpiryDate: "08/04/2027",
              stateOfRegistration: "TN",
              commercial: false
            },
            npciStatus: "ACTIVE",
            custDetails: {
              name: null,
              walletStatus: "Active", // NE = New Entity (wallet doesn't exist)
              kycStatus: "",
              walletId: null,
              mobileNo: 7840001360,
            },
            respDateTime: new Date().toISOString(),
            requestId: requestId,
            req_type: reqType || "REG",
            udf1: "",
            udf2: "",
            udf3: "",
            udf4: "",
            udf5: ""
          }
        };
        
        console.log('DEV MODE: Simulated response:', JSON.stringify(response, null, 2));
        
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Production mode - actual API call
        // According to the API documentation:
        // validateOtpReq: {
        //   otp: "123456",        <- The 6-digit OTP entered by user
        //   requestId: "...",     <- From the sendOtp response
        //   sessionId: "...",     <- From the sendOtp response
        //   channel: "...",
        //   agentId: "...",
        //   reqDateTime: "..."
        // }
        
        // Set timeout for the API call - 15 seconds
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout - please try again')), 15000);
        });
        
        // Actual API call
        const apiCallPromise = bajajApi.verifyOtp(
          otpString,                 // The 6-digit OTP entered by the user
          requestId,    // The requestId from sendOtp response
          sessionId     // The sessionId from sendOtp response
        );
        
        // Race between timeout and API call
        response = await Promise.race([apiCallPromise, timeoutPromise]);
      }
      
      console.log('Verify OTP Full Response:', JSON.stringify(response, null, 2));
      
      // Check the response code
      if (response && response.response) {
        // Add notification regardless of success/failure
        addNotification({
          id: Date.now(),
          message: response.response.status === 'success' ? 'OTP verification successful' : response.response.msg,
          time: 'Just now',
          read: false
        });
        
        // Handle based on response code
        if (response.response.status === 'success' && response.response.code === '00') {
          // Success - OTP validated and wallet exists
          console.log('OTP validation successful with code 00');
          
          // Check if wallet exists
          const walletStatus = response.validateOtpResp?.custDetails?.walletStatus;
          console.log('Wallet status:', walletStatus);
          
          if (walletStatus === 'NE') {
            // Wallet doesn't exist - navigate to CreateWallet
            console.log('Wallet does not exist (NE) - navigating to CreateWallet');
            
            // Navigate to CreateWalletScreen to create a new wallet
            navigation.navigate('CreateWallet', {
              requestId: requestId,
              sessionId: sessionId,
              mobileNo,
              vehicleNo,
              chassisNo,
              engineNo,
              reqType,
              // Pass the complete OTP verification response
              otpResponse: response,
              // Pass vehicle details from OTP response
              vehicleManuf: response.validateOtpResp?.vrnDetails?.vehicleManuf,
              model: response.validateOtpResp?.vrnDetails?.model,
              vehicleColour: response.validateOtpResp?.vrnDetails?.vehicleColour,
              type: response.validateOtpResp?.vrnDetails?.type,
              rtoStatus: response.validateOtpResp?.vrnDetails?.rtoStatus,
              tagVehicleClassID: response.validateOtpResp?.vrnDetails?.tagVehicleClassID,
              npciVehicleClassID: response.validateOtpResp?.vrnDetails?.npciVehicleClassID,
              vehicleType: response.validateOtpResp?.vrnDetails?.vehicleType,
              rechargeAmount: response.validateOtpResp?.vrnDetails?.rechargeAmount,
              securityDeposit: response.validateOtpResp?.vrnDetails?.securityDeposit,
              tagCost: response.validateOtpResp?.vrnDetails?.tagCost,
              vehicleDescriptor: response.validateOtpResp?.vrnDetails?.vehicleDescriptor,
              isNationalPermit: response.validateOtpResp?.vrnDetails?.isNationalPermit,
              permitExpiryDate: response.validateOtpResp?.vrnDetails?.permitExpiryDate,
              stateOfRegistration: response.validateOtpResp?.vrnDetails?.stateOfRegistration,
              commercial: response.validateOtpResp?.vrnDetails?.commercial,
              npciStatus: response.validateOtpResp?.npciStatus
            });
            
            // Add notification about what happened
            addNotification({
              id: Date.now(),
              message: 'Creating new wallet for you',
              time: 'Just now',
              read: false
            });
          } else {
            // Wallet exists - navigate based on request type
            if (reqType === 'REG') {
              // For registration - navigate to DocumentUploadScreen
              navigation.navigate('DocumentUpload', {
                requestId: requestId,
                sessionId: sessionId,
                // Pass basic details from OTP response
                mobileNo: response.validateOtpResp?.custDetails?.mobileNo || mobileNo,
                // These fields use different names in the API response vs. registration request:
                // OTP response: vehicleNo, chassisNo, engineNo
                // Registration: vrn, chassis, engine
                vehicleNo: response.validateOtpResp?.vrnDetails?.vehicleNo || vehicleNo,
                chassisNo: response.validateOtpResp?.vrnDetails?.chassisNo || chassisNo,
                engineNo: response.validateOtpResp?.vrnDetails?.engineNo || engineNo,
                customerId: response.validateOtpResp?.custDetails?.customerId || '',
                walletId: response.validateOtpResp?.custDetails?.walletId || '',
                name: response.validateOtpResp?.custDetails?.name || '',
                // Pass the complete OTP verification response for FasTag registration
                otpResponse: response,
                // Pass vehicle details from OTP response
                vehicleManuf: response.validateOtpResp?.vrnDetails?.vehicleManuf || '',
                model: response.validateOtpResp?.vrnDetails?.model || '',
                vehicleColour: response.validateOtpResp?.vrnDetails?.vehicleColour || '',
                type: response.validateOtpResp?.vrnDetails?.type || '',
                rtoStatus: response.validateOtpResp?.vrnDetails?.rtoStatus || 'ACTIVE',
                tagVehicleClassID: response.validateOtpResp?.vrnDetails?.tagVehicleClassID || '4',
                npciVehicleClassID: response.validateOtpResp?.vrnDetails?.npciVehicleClassID || '4',
                vehicleType: response.validateOtpResp?.vrnDetails?.vehicleType || '',
                rechargeAmount: response.validateOtpResp?.vrnDetails?.rechargeAmount || '0.00',
                securityDeposit: response.validateOtpResp?.vrnDetails?.securityDeposit || '100.00',
                tagCost: response.validateOtpResp?.vrnDetails?.tagCost || '100.00',
                vehicleDescriptor: response.validateOtpResp?.vrnDetails?.vehicleDescriptor || 'DIESEL',
                isNationalPermit: response.validateOtpResp?.vrnDetails?.isNationalPermit || '1',
                permitExpiryDate: response.validateOtpResp?.vrnDetails?.permitExpiryDate || '31/12/2025',
                stateOfRegistration: response.validateOtpResp?.vrnDetails?.stateOfRegistration || 'MH',
                commercial: response.validateOtpResp?.vrnDetails?.commercial === false ? false : true,
                npciStatus: response.validateOtpResp?.npciStatus || 'ACTIVE',
                
                // Pass channel and agentId from OTP response
                channel: response.validateOtpResp?.channel || 'CBPL',
                agentId: response.validateOtpResp?.agentId || '70003',
                
                // Also pass all UDF fields
                udf1: response.validateOtpResp?.udf1 || '',
                udf2: response.validateOtpResp?.udf2 || '',
                udf3: response.validateOtpResp?.udf3 || '',
                udf4: response.validateOtpResp?.udf4 || '',
                udf5: response.validateOtpResp?.udf5 || ''
              });
            } else if (reqType === 'REP') {
              // For replacement, go to FasTag replacement screen
              navigation.navigate('FasTagReplacement', {
                requestId: requestId,
                sessionId: sessionId,
                mobileNo,
                vehicleNo,
                chassisNo,
                engineNo,
                customerId: response.validateOtpResp?.custDetails?.customerId || '',
                walletId: response.validateOtpResp?.custDetails?.walletId || ''
              });
            }
          }
        } else if (response.response.status === 'failed' && response.response.code === '11') {
          // Failed with code 11 - Need to create wallet
          console.log(`OTP verification failed with code 11: ${response.response.errorDesc || 'Unknown error'}`);
          console.log('Error code:', response.response.errorCode);
          
          // Common wallet creation issues that should redirect to CreateWallet:
          // - A034: Unable to fetch customer wallet details
          // - A028: Invalid session, please try again
          
          // Record error details for debugging
          const errorCode = response.response.errorCode || '';
          const errorDesc = response.response.errorDesc || 'Unknown error';
          
          console.log(`Navigating to CreateWallet due to error: ${errorCode} - ${errorDesc}`);
          
          // Navigate to CreateWalletScreen to create a new wallet
          // Important: Keep passing the original requestId and sessionId from the OTP verification
          navigation.navigate('CreateWallet', {
            requestId: requestId,
            sessionId: sessionId,
            mobileNo,
            vehicleNo,
            chassisNo,
            engineNo,
            reqType,
            // Pass the complete OTP verification response
            otpResponse: response,
            // Pass vehicle details from OTP response
            vehicleManuf: response.validateOtpResp?.vrnDetails?.vehicleManuf,
            model: response.validateOtpResp?.vrnDetails?.model,
            vehicleColour: response.validateOtpResp?.vrnDetails?.vehicleColour,
            type: response.validateOtpResp?.vrnDetails?.type,
            rtoStatus: response.validateOtpResp?.vrnDetails?.rtoStatus,
            tagVehicleClassID: response.validateOtpResp?.vrnDetails?.tagVehicleClassID,
            npciVehicleClassID: response.validateOtpResp?.vrnDetails?.npciVehicleClassID,
            vehicleType: response.validateOtpResp?.vrnDetails?.vehicleType,
            rechargeAmount: response.validateOtpResp?.vrnDetails?.rechargeAmount,
            securityDeposit: response.validateOtpResp?.vrnDetails?.securityDeposit,
            tagCost: response.validateOtpResp?.vrnDetails?.tagCost,
            vehicleDescriptor: response.validateOtpResp?.vrnDetails?.vehicleDescriptor,
            isNationalPermit: response.validateOtpResp?.vrnDetails?.isNationalPermit,
            permitExpiryDate: response.validateOtpResp?.vrnDetails?.permitExpiryDate,
            stateOfRegistration: response.validateOtpResp?.vrnDetails?.stateOfRegistration,
            commercial: response.validateOtpResp?.vrnDetails?.commercial,
            npciStatus: response.validateOtpResp?.npciStatus
          });
          
          // Add notification about what happened
          addNotification({
            id: Date.now(),
            message: `Creating new wallet: ${errorDesc}`,
            time: 'Just now',
            read: false
          });
        } else {
          // Other errors
          const errorMsg = response.response.errorDesc || response.response.msg || 'OTP verification failed';
          throw new Error(errorMsg);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('=== OTP VERIFICATION ERROR ===');
      console.error(error);
      
      // Check if it's a network error or timeout
      const isNetworkError = error.message.includes('Network Error') || 
                             error.message.includes('timeout') ||
                             error.message.includes('ECONNABORTED');
      
      if (isNetworkError) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Retry', 
              onPress: () => {
                // Wait a moment before retrying
                setTimeout(() => {
                  handleVerifyOtp();
                }, 1000);
              } 
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          `Failed to verify OTP: ${error.message}`,
          [{ text: 'OK' }]
        );
      }
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
        
        {/* Dev Mode Toggle */}
        <View style={styles.devModeContainer}>
          <Text style={styles.devModeText}>Dev Mode</Text>
          <Switch
            value={devMode}
            onValueChange={setDevMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={devMode ? '#2196F3' : '#f4f3f4'}
          />
        </View>
        
        {/* Debug Info */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info (will be hidden in production)</Text>
          <Text style={styles.debugText}>RequestId: {requestId}</Text>
          <Text style={styles.debugText}>SessionId: {sessionId}</Text>
          <Text style={styles.debugText}>Mobile: {mobileNo}</Text>
          <Text style={styles.debugText}>Vehicle: {vehicleNo || 'N/A'}</Text>
          <Text style={styles.debugText}>Current OTP: {otp.join('')}</Text>
          <Text style={styles.debugText}>Dev Mode: {devMode ? 'ON' : 'OFF'}</Text>
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
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          )}
        </View>
        
        {/* Verify Button */}
        <TouchableOpacity 
          style={styles.verifyButton}
          onPress={handleVerifyOtp}
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  devModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  devModeText: {
    fontSize: 14,
    color: '#333333',
  },
  debugSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  resendContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  resendText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#999999',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ValidateOtpScreen;