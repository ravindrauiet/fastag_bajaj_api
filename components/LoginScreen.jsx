import React, { useState, useContext, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationContext } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Access auth context
  const { login, error: authError } = useAuth();

  // Check for saved credentials on component mount
  useEffect(() => {
    const checkSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const savedPassword = await AsyncStorage.getItem('userPassword');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');

        if (savedRememberMe === 'true' && savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
          // Auto login if remember me was enabled
          handleLogin(savedEmail, savedPassword);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };

    checkSavedCredentials();
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle remember me toggle
  const handleRememberMeToggle = async () => {
    const newRememberMe = !rememberMe;
    setRememberMe(newRememberMe);
    
    if (!newRememberMe) {
      // If remember me is turned off, clear saved credentials
      try {
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userPassword');
        await AsyncStorage.removeItem('rememberMe');
      } catch (error) {
        console.error('Error clearing saved credentials:', error);
      }
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle login
  const handleLogin = async (savedEmail = null, savedPassword = null) => {
    const emailToUse = savedEmail || email;
    const passwordToUse = savedPassword || password;

    if (!savedEmail && !validateForm()) return;
    
    setLoading(true);
    
    try {
      // Use AuthContext login function with Firebase
      const success = await login({ email: emailToUse, password: passwordToUse });
      
      if (success) {
        // Save credentials if remember me is enabled
        if (rememberMe) {
          try {
            await AsyncStorage.setItem('userEmail', emailToUse);
            await AsyncStorage.setItem('userPassword', passwordToUse);
            await AsyncStorage.setItem('rememberMe', 'true');
          } catch (error) {
            console.error('Error saving credentials:', error);
          }
        }

        // Show success notification
        addNotification({
          id: Date.now(),
          message: 'Login successful. Welcome back!',
          time: 'Just now',
          read: false
        });
        
        console.log('Login successful');
        
        // Admin redirection is handled in the navigation component
      } else {
        // Show error message from Firebase
        Alert.alert(
          'Login Failed',
          authError || 'Invalid email or password. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Login Error',
        error.message || 'There was a problem with the login process.',
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
          {/* Logo and Header */}
          <View style={styles.headerContainer}>
            <Image
              style={styles.logo}
              source={require('../assets/icons/tm_square_png-removebg-preview.png')}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Log in to your account</Text>
          </View>
          
          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
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
            
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                  placeholder="Enter your password"
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
            
            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={handleRememberMeToggle}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe ? styles.checkboxChecked : null
                ]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            
            {/* Login Button */}
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => handleLogin()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
            
            {/* Sign Up Section */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Testing credentials */}
          <View style={styles.testingNote}>
            <Text style={styles.testingNoteTitle}>Firebase Authentication:</Text>
            <Text style={styles.testingNoteText}>Please create an account using a valid email and password combination.</Text>
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
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6200EE',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#6200EE',
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  checkboxChecked: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  rememberMeText: {
    fontSize: 14,
    color: '#6200EE',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#6200EE',
  },
  signupLink: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
  testingNote: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  testingNoteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  testingNoteText: {
    fontSize: 14,
    color: '#6200EE',
  },
});

export default LoginScreen; 