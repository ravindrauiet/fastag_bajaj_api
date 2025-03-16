import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const OtpVerificationScreen = ({ route, navigation }) => {
  const { vehicleDetails, userDetails } = route.params || {};
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [resendActive, setResendActive] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Refs for TextInputs
  const inputRefs = useRef([]);
  
  // Monitor keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Initial animation
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
      }),
    ]).start();
  }, []);
  
  // Timer for OTP resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setResendActive(true);
    }
  }, [timer]);
  
  // Handle OTP input
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  // Handle backspace key press
  const handleKeyPress = (index, e) => {
    // Check if backspace and current field is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input
      inputRefs.current[index - 1].focus();
    }
  };
  
  // Handle OTP resend
  const handleResendOtp = () => {
    if (resendActive) {
      // Animate the resend button press
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Reset OTP
      setOtp(['', '', '', '', '', '']);
      
      // Reset timer
      setTimer(30);
      setResendActive(false);
      
      // Focus on first input
      inputRefs.current[0].focus();
      
      // In a real app, would call API to resend OTP
      alert('OTP resent successfully');
    }
  };
  
  // Handle verification
  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('');
    
    // Simple validation
    if (enteredOtp.length !== 6) {
      alert('Please enter a complete 6-digit OTP');
      return;
    }
    
    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    
    // In a real app, verify OTP with API
    navigation.navigate('AddOns', {
      vehicleDetails,
      userDetails
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OTP Verification</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <Animated.ScrollView 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Verify Your Mobile</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit OTP to{' '}
              <Text style={styles.mobileText}>
                {userDetails?.mobile || vehicleDetails?.vrnMobileNo}
              </Text>
            </Text>
            
            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={(e) => handleKeyPress(index, e)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectionColor="#A52A2A"
                />
              ))}
            </View>
            
            {/* OTP Info */}
            <Text style={styles.otpInfo}>
              Enter the 6-digit code sent to your mobile number
            </Text>
            
            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the OTP? 
              </Text>
              <TouchableOpacity 
                onPress={handleResendOtp}
                disabled={!resendActive}
              >
                <Text style={[
                  styles.resendButton, 
                  !resendActive && styles.resendButtonDisabled
                ]}>
                  {resendActive ? 'Resend OTP' : `Resend in ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setTermsAccepted(!termsAccepted)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkboxInner, 
                  termsAccepted && styles.checkboxChecked
                ]} />
              </TouchableOpacity>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
            
            {/* Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>User Information</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name:</Text>
                <Text style={styles.summaryValue}>
                  {userDetails?.firstName} {userDetails?.lastName}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Vehicle:</Text>
                <Text style={styles.summaryValue}>{vehicleDetails?.vehicleNo}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mobile:</Text>
                <Text style={styles.summaryValue}>
                  {userDetails?.mobile || vehicleDetails?.vrnMobileNo}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Verify Button */}
          <TouchableOpacity 
            style={[styles.verifyButton, !keyboardVisible && styles.verifyButtonFixed]} 
            onPress={handleVerifyOtp}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyButtonText}>Verify OTP</Text>
          </TouchableOpacity>
          
          {!keyboardVisible && (
            <Text style={styles.secureText}>
              Your information is secure and encrypted
            </Text>
          )}
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#A52A2A',
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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  mobileText: {
    fontWeight: 'bold',
    color: '#333333',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  otpInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    width: 45,
    height: 55,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  otpInputFilled: {
    borderColor: '#A52A2A',
    backgroundColor: '#FFF8F8',
  },
  otpInfo: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A52A2A',
  },
  resendButtonDisabled: {
    color: '#999999',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#A52A2A',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: '#A52A2A',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  termsLink: {
    color: '#A52A2A',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  summaryContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
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
    width: 70,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
  },
  verifyButton: {
    backgroundColor: '#A52A2A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  verifyButtonFixed: {
    marginBottom: 12,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secureText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
  },
});

export default OtpVerificationScreen; 