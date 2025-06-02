import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';

// List of Indian banks for dropdown
const BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'Union Bank of India'
];

const BankAccountLinkScreen = ({ navigation }) => {
  // States for form fields
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  
  // States for validation and UI
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const successAnim = useState(new Animated.Value(0))[0];
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  useEffect(() => {
    // Animate form entry when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Validate form fields
  const validateForm = () => {
    let formErrors = {};
    
    if (!accountNumber) {
      formErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(accountNumber)) {
      formErrors.accountNumber = 'Account number must be 9-18 digits';
    }
    
    if (accountNumber !== confirmAccountNumber) {
      formErrors.confirmAccountNumber = 'Account numbers do not match';
    }
    
    if (!ifscCode) {
      formErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      formErrors.ifscCode = 'Invalid IFSC code format';
    }
    
    if (!accountHolderName) {
      formErrors.accountHolderName = 'Account holder name is required';
    }
    
    if (!selectedBank) {
      formErrors.selectedBank = 'Please select a bank';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  
  // Verify IFSC code (simulated API call)
  const verifyIfscCode = async () => {
    if (!ifscCode) {
      setErrors({ ...errors, ifscCode: 'IFSC code is required' });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful verification for codes starting with SBIN
      if (ifscCode.startsWith('SBIN')) {
        setErrors({ ...errors, ifscCode: null });
        return true;
      } else {
        setErrors({ ...errors, ifscCode: 'Unable to verify IFSC code' });
        return false;
      }
    } catch (error) {
      setErrors({ ...errors, ifscCode: 'Error verifying IFSC code' });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle form submission
  const handleLinkAccount = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call to link bank account
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success animation and notification
      setLinkSuccess(true);
      
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      addNotification({
        id: Date.now(),
        message: `Bank account with ${selectedBank} has been successfully linked`,
        time: 'Just now',
        read: false,
      });
      
      // Navigate back after success animation
      setTimeout(() => {
        navigation.navigate('WalletMain', { refresh: true });
      }, 2000);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to link bank account. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle bank selection
  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setShowBankDropdown(false);
    setErrors({ ...errors, selectedBank: null });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Link Bank Account</Text>
        <Text style={styles.headerSubtitle}>
          Connect your bank account to enable wallet recharges
        </Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!linkSuccess ? (
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Bank Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Bank</Text>
              <TouchableOpacity
                style={[
                  styles.bankSelector,
                  errors.selectedBank && styles.inputError
                ]}
                onPress={() => setShowBankDropdown(!showBankDropdown)}
              >
                <Text style={selectedBank ? styles.inputText : styles.placeholderText}>
                  {selectedBank || 'Select your bank'}
                </Text>
              </TouchableOpacity>
              {errors.selectedBank && <Text style={styles.errorText}>{errors.selectedBank}</Text>}
              
              {showBankDropdown && (
                <View style={styles.bankDropdown}>
                  <ScrollView style={styles.bankDropdownScroll}>
                    {BANKS.map((bank, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.bankOption}
                        onPress={() => handleSelectBank(bank)}
                      >
                        <Text style={styles.bankOptionText}>{bank}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            {/* Account Holder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Holder Name</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.accountHolderName && styles.inputError
                ]}
                placeholder="Enter full name as per bank records"
                placeholderTextColor="#AAAAAA"
                value={accountHolderName}
                onChangeText={(text) => {
                  setAccountHolderName(text);
                  if (errors.accountHolderName) {
                    setErrors({ ...errors, accountHolderName: null });
                  }
                }}
              />
              {errors.accountHolderName && <Text style={styles.errorText}>{errors.accountHolderName}</Text>}
            </View>
            
            {/* Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.accountNumber && styles.inputError
                ]}
                placeholder="Enter your account number"
                placeholderTextColor="#AAAAAA"
                keyboardType="number-pad"
                value={accountNumber}
                onChangeText={(text) => {
                  setAccountNumber(text.replace(/[^0-9]/g, ''));
                  if (errors.accountNumber) {
                    setErrors({ ...errors, accountNumber: null });
                  }
                }}
                secureTextEntry={true}
              />
              {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
            </View>
            
            {/* Confirm Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Account Number</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmAccountNumber && styles.inputError
                ]}
                placeholder="Confirm your account number"
                placeholderTextColor="#AAAAAA"
                keyboardType="number-pad"
                value={confirmAccountNumber}
                onChangeText={(text) => {
                  setConfirmAccountNumber(text.replace(/[^0-9]/g, ''));
                  if (errors.confirmAccountNumber) {
                    setErrors({ ...errors, confirmAccountNumber: null });
                  }
                }}
                secureTextEntry={true}
              />
              {errors.confirmAccountNumber && <Text style={styles.errorText}>{errors.confirmAccountNumber}</Text>}
            </View>
            
            {/* IFSC Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>IFSC Code</Text>
              <View style={styles.ifscContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.ifscInput,
                    errors.ifscCode && styles.inputError
                  ]}
                  placeholder="e.g., SBIN0001234"
                  placeholderTextColor="#AAAAAA"
                  value={ifscCode}
                  onChangeText={(text) => {
                    setIfscCode(text.toUpperCase());
                    if (errors.ifscCode) {
                      setErrors({ ...errors, ifscCode: null });
                    }
                  }}
                  autoCapitalize="characters"
                  maxLength={11}
                />
                <TouchableOpacity 
                  style={styles.verifyButton}
                  onPress={verifyIfscCode}
                  disabled={isVerifying || !ifscCode}
                >
                  {isVerifying ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  )}
                </TouchableOpacity>
              </View>
              {errors.ifscCode && <Text style={styles.errorText}>{errors.ifscCode}</Text>}
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleLinkAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Link Account</Text>
              )}
            </TouchableOpacity>
            
            {/* Info Notice */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Your bank details are encrypted and secure. We use them only for verification and transactions.
              </Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View 
            style={[
              styles.successContainer,
              { opacity: successAnim }
            ]}
          >
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Account Linked Successfully!</Text>
            <Text style={styles.successMessage}>
              Your bank account has been successfully linked to your wallet.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    padding: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6200EE',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  formContainer: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6200EE',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#6200EE',
  },
  inputError: {
    borderColor: '#E53935',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  ifscContainer: {
    flexDirection: 'row',
  },
  ifscInput: {
    flex: 1,
    marginRight: 10,
  },
  verifyButton: {
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  bankSelector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  placeholderText: {
    color: '#6200EE',
    fontSize: 16,
  },
  inputText: {
    color: '#6200EE',
    fontSize: 16,
  },
  bankDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bankDropdownScroll: {
    padding: 5,
  },
  bankOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  bankOptionText: {
    fontSize: 14,
    color: '#6200EE',
  },
  submitButton: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  infoText: {
    fontSize: 14,
    color: '#6200EE',
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6200EE',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  }
});

export default BankAccountLinkScreen;