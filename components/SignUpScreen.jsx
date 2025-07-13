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
import { useAuth } from '../contexts/AuthContext';

const SignUpScreen = ({ navigation }) => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadharCard, setAadharCard] = useState('');
  const [panCard, setPanCard] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Access auth context
  const { register, error: authError } = useAuth();
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[A-Za-z\s]+$/.test(firstName.trim())) {
      newErrors.firstName = 'First name should contain only alphabetic characters';
    }
    
    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[A-Za-z\s]+$/.test(lastName.trim())) {
      newErrors.lastName = 'Last name should contain only alphabetic characters';
    }
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone validation
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
      // Aadhar card validation
  if (!aadharCard) {
    newErrors.aadharCard = 'Aadhar Card is required';
  } else if (!/^\d{12}$/.test(aadharCard)) {
    newErrors.aadharCard = 'Aadhar Card must be 12 digits';
  }
    
      // PAN card validation
  if (!panCard) {
    newErrors.panCard = 'PAN Card is required';
  } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard)) {
    newErrors.panCard = 'Invalid PAN Card format (e.g., ABCDE1234F)';
  }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle sign up
  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
        try {
      // Prepare user data for registration
      const userData = {
        email,
        password,
        displayName: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        phone,
        aadharCard,
        panCard
      };
      
      // Use AuthContext register function with Firebase
      const success = await register(userData);
      
      if (success) {
        // Successful registration
        addNotification({
          id: Date.now(),
          message: 'Registration successful! Welcome to FasTag.',
          time: 'Just now',
          read: false
        });
        
        // Alert success and navigate to Login
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        // Registration failed with Firebase error
        Alert.alert(
          'Registration Failed',
          authError || 'There was a problem creating your account. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Registration Error',
        error.message || 'There was a problem creating your account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={{ width: 40 }} />
          </View>
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../assets/icons/tm_square_png-removebg-preview.png')}
              resizeMode="contain"
            />
          </View>
          
          {/* Sign Up Form */}
          <View style={styles.formContainer}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.firstName ? styles.inputError : null]}
                placeholder="Enter your first name"
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
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
              />
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>
            
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email<Text style={styles.required}>*</Text></Text>
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
            
            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                placeholder="Enter your 10-digit phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.phone ? (
                <Text style={styles.errorText}>{errors.phone}</Text>
              ) : null}
            </View>
            
            {/* Aadhar Card */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Aadhar Card<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.aadharCard ? styles.inputError : null]}
                placeholder="Enter your 12-digit Aadhar number"
                value={aadharCard}
                onChangeText={setAadharCard}
                keyboardType="number-pad"
                maxLength={12}
              />
              {errors.aadharCard ? (
                <Text style={styles.errorText}>{errors.aadharCard}</Text>
              ) : null}
            </View>
            
            {/* PAN Card */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PAN Card<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.panCard ? styles.inputError : null]}
                placeholder="Enter your PAN Card number"
                value={panCard}
                onChangeText={setPanCard}
                autoCapitalize="characters"
                maxLength={10}
              />
              {errors.panCard ? (
                <Text style={styles.errorText}>{errors.panCard}</Text>
              ) : null}
            </View>
            
            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password<Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={togglePasswordVisibility}
                  activeOpacity={0.7}
                >
                  <View style={styles.eyeIconContainer}>
                    {showPassword ? (
                      <Text style={styles.eyeIcon}>👁️</Text>
                    ) : (
                      <Text style={styles.eyeIcon}>🔒</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>
            
            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password<Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.confirmPassword ? styles.inputError : null]}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={toggleConfirmPasswordVisibility}
                  activeOpacity={0.7}
                >
                  <View style={styles.eyeIconContainer}>
                    {showConfirmPassword ? (
                      <Text style={styles.eyeIcon}>👁️</Text>
                    ) : (
                      <Text style={styles.eyeIcon}>🔒</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>
            
            {/* Terms and Conditions */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <View style={[
                styles.checkbox,
                acceptTerms ? styles.checkboxChecked : null,
                errors.terms ? styles.checkboxError : null
              ]}>
                {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I accept the <Text style={styles.termsLink}>Terms and Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </TouchableOpacity>
            {errors.terms ? (
              <Text style={[styles.errorText, { marginTop: 4, marginBottom: 12 }]}>{errors.terms}</Text>
            ) : (
              <View style={{ marginBottom: 16 }} />
            )}
            
            {/* Sign Up Button */}
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#6200EE',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#FF3B30',
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
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
    height: '100%',
    color: '#6200EE',
  },
  eyeButton: {
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  checkboxError: {
    borderColor: '#FF3B30',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#6200EE',
    lineHeight: 20,
  },
  termsLink: {
    color: '#6200EE',
    fontWeight: '500',
  },
  signupButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6200EE',
  },
  loginLink: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
});

export default SignUpScreen; 