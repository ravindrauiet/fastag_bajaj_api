import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';

const ForgotPasswordScreen = ({ navigation }) => {
  // State for multi-step form
  const [step, setStep] = useState(1); // 1: Email, 2: OTP Verification, 3: New Password
  
  // Form state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Dummy data for testing
  const dummyUser = {
    email: 'test@example.com',
    otp: '123456'
  };
  
  // Validate email form
  const validateEmailForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate OTP form
  const validateOtpForm = () => {
    const newErrors = {};
    
    // OTP validation
    if (!otp) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};
    
    // Password validation
    if (!password) {
      newErrors.password = 'New password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle email submission
  const handleEmailSubmit = () => {
    if (!validateEmailForm()) return;
    
    setLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      if (email === dummyUser.email) {
        // If email exists, proceed to OTP verification
        setStep(2);
        addNotification({
          id: Date.now(),
          message: 'OTP sent to your email',
          time: 'Just now',
          read: false
        });
      } else {
        // If email doesn't exist, show error
        Alert.alert(
          'Account Not Found',
          'No account with this email address exists.',
          [{ text: 'OK' }]
        );
      }
      
      setLoading(false);
    }, 1500);
  };
  
  // Handle OTP verification
  const handleOtpVerify = () => {
    if (!validateOtpForm()) return;
    
    setLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      if (otp === dummyUser.otp) {
        // If OTP is correct, proceed to reset password
        setStep(3);
      } else {
        // If OTP is incorrect, show error
        Alert.alert(
          'Invalid OTP',
          'The OTP you entered is incorrect. Please try again.',
          [{ text: 'OK' }]
        );
      }
      
      setLoading(false);
    }, 1500);
  };
  
  // Handle password reset
  const handleResetPassword = () => {
    if (!validatePasswordForm()) return;
    
    setLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      // Password reset successful
      addNotification({
        id: Date.now(),
        message: 'Password reset successful',
        time: 'Just now',
        read: false
      });
      
      // Alert success and navigate to Login
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. Please log in with your new password.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      
      setLoading(false);
    }, 1500);
  };
  
  // Resend OTP
  const handleResendOtp = () => {
    setLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      addNotification({
        id: Date.now(),
        message: 'New OTP sent to your email',
        time: 'Just now',
        read: false
      });
      
      setLoading(false);
    }, 1500);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (step === 1) {
            navigation.goBack();
          } else {
            setStep(step - 1);
            setErrors({});
          }
        }} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 1 ? 'Forgot Password' : 
           step === 2 ? 'Verify OTP' : 
           'Reset Password'}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../assets/tm_square_logo.jpeg')}
              resizeMode="contain"
            />
          </View>
          
          {/* Step 1: Email Form */}
          {step === 1 && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Forgot Your Password?</Text>
              <Text style={styles.formSubtitle}>
                Enter your email address and we'll send you an OTP to reset your password.
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleEmailSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
              
              {/* Testing hint */}
              <View style={styles.testingNote}>
                <Text style={styles.testingTitle}>Testing Info:</Text>
                <Text style={styles.testingText}>Use test@example.com for testing</Text>
                <Text style={styles.testingText}>OTP will be 123456</Text>
              </View>
            </View>
          )}
          
          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Verify OTP</Text>
              <Text style={styles.formSubtitle}>
                We've sent a 6-digit OTP to {email}. Please enter it below.
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>OTP</Text>
                <TextInput
                  style={[styles.input, errors.otp ? styles.inputError : null]}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {errors.otp ? (
                  <Text style={styles.errorText}>{errors.otp}</Text>
                ) : null}
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleOtpVerify}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleResendOtp}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </TouchableOpacity>
              
              {/* Testing hint */}
              <View style={styles.testingNote}>
                <Text style={styles.testingTitle}>Testing Info:</Text>
                <Text style={styles.testingText}>Use 123456 as the OTP</Text>
              </View>
            </View>
          )}
          
          {/* Step 3: Reset Password */}
          {step === 3 && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Reset Password</Text>
              <Text style={styles.formSubtitle}>
                Create a new password for your account.
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={[styles.input, errors.password ? styles.inputError : null]}
                  placeholder="Enter new password (min. 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 50,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#00ACC1',
    fontSize: 16,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: 14,
    color: '#00ACC1',
    fontWeight: '500',
  },
  testingNote: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00ACC1',
  },
  testingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  testingText: {
    fontSize: 14,
    color: '#666666',
  },
});

export default ForgotPasswordScreen; 