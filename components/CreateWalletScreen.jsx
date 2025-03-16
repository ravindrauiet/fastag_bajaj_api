import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { createWallet } from '../api.js';

const CreateWalletScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [dob, setDob] = useState('');
  const [errors, setErrors] = useState({});
  
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
  const handleDateChange = (text) => {
    // Allow only numbers and hyphens
    const formattedText = text.replace(/[^0-9\-]/g, '');
    
    // Auto-add hyphens after day and month
    let formatted = formattedText;
    if (formattedText.length === 2 && !formattedText.includes('-') && dob.length === 1) {
      formatted = formattedText + '-';
    } else if (formattedText.length === 5 && formattedText.charAt(2) === '-' && !formattedText.includes('-', 3) && dob.length === 4) {
      formatted = formattedText + '-';
    }
    
    setDob(formatted);
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
    
    if (!(validName && validLastName && validMobile && validDob)) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    
    try {
      // In a real app, this would call the API
      // const response = await createWallet({ name, lastName, mobileNo, dob });
      
      // For demo purposes, just show success alert
      Alert.alert(
        'Success',
        'Wallet Created Successfully!',
        [
          { text: 'OK', onPress: () => navigation.navigate('HomeScreen') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet. Please try again.');
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
              Set up your digital wallet to easily recharge and manage your FasTag.
              Your wallet details will be securely stored for future transactions.
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
              />
              {errors.mobileNo ? (
                <Text style={styles.errorText}>{errors.mobileNo}</Text>
              ) : null}
            </View>
            
            {/* Date of Birth - Text input instead of date picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.dob ? styles.inputError : null]}
                placeholder="DD-MM-YYYY"
                value={dob}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#999999"
              />
              {errors.dob ? (
                <Text style={styles.errorText}>{errors.dob}</Text>
              ) : null}
            </View>
          </View>
          
          {/* Create Wallet Button */}
          <TouchableOpacity 
            style={styles.button}
            onPress={handleCreateWallet}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Create Wallet</Text>
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
  button: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
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