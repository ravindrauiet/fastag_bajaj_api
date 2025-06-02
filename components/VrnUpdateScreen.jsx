import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Alert,
  Animated,
  ActivityIndicator
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';
import bajajApi from '../api/bajajApi';

const VrnUpdateScreen = ({ navigation }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [vehicleNo, setVehicleNo] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [tid, setTid] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Animation effect on component mount
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
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Validate vehicle number
    if (!vehicleNo.trim()) {
      newErrors.vehicleNo = 'Vehicle number is required';
      isValid = false;
    } else if (!/^[A-Z0-9]{5,10}$/.test(vehicleNo)) {
      newErrors.vehicleNo = 'Enter a valid vehicle number';
      isValid = false;
    }
    
    // Validate chassis number
    if (!chassisNo.trim()) {
      newErrors.chassisNo = 'Chassis number is required';
      isValid = false;
    }
    
    // Validate mobile number
    if (!mobileNo.trim()) {
      newErrors.mobileNo = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(mobileNo)) {
      newErrors.mobileNo = 'Mobile number must be 10 digits';
      isValid = false;
    }
    
    // Validate serial number
    if (!serialNo.trim()) {
      newErrors.serialNo = 'Serial number is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call Bajaj API to update VRN
      const response = await bajajApi.updateVrn(
        vehicleNo,
        chassisNo,
        engineNo || '', // Optional
        mobileNo,
        serialNo,
        tid || '' // Optional
      );
      
      console.log('VRN Update Response:', response);
      
      if (response && response.response && response.response.status === 'success') {
        // Add notification
        addNotification({
          id: Date.now(),
          message: `Vehicle Registration Number ${vehicleNo} updated successfully`,
          time: 'Just now',
          read: false
        });
        
        Alert.alert(
          'Success',
          'Vehicle Registration Number updated successfully!',
          [
            { 
              text: 'Upload Documents', 
              onPress: () => navigateToDocUpload() 
            },
            { 
              text: 'Done', 
              onPress: () => navigation.goBack(),
              style: 'cancel'
            }
          ]
        );
      } else {
        const errorMsg = response?.response?.errorDesc || 'Failed to update VRN';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('VRN Update Error:', error);
      Alert.alert(
        'Update Failed',
        `Failed to update Vehicle Registration Number: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Inside the VrnUpdateScreen component, add a navigateToDocUpload function
  const navigateToDocUpload = () => {
    navigation.navigate('VrnUpdateDoc', {
      vehicleNo,
      chassisNo,
      engineNo,
      mobileNo,
      serialNo
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VRN Update</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[styles.content, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Update Vehicle Registration Number</Text>
            <Text style={styles.infoText}>
              This feature allows you to update the Vehicle Registration Number (VRN) for vehicles 
              whose FasTag issuance was done through Chassis-based onboarding.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {/* Vehicle Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.vehicleNo ? styles.inputError : null]}
                placeholder="Enter vehicle number"
                value={vehicleNo}
                onChangeText={(text) => {
                  const upperText = text.toUpperCase();
                  setVehicleNo(upperText);
                }}
                autoCapitalize="characters"
              />
              {errors.vehicleNo ? (
                <Text style={styles.errorText}>{errors.vehicleNo}</Text>
              ) : null}
            </View>
            
            {/* Chassis Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chassis Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.chassisNo ? styles.inputError : null]}
                placeholder="Enter chassis number"
                value={chassisNo}
                onChangeText={(text) => {
                  const upperText = text.toUpperCase();
                  setChassisNo(upperText);
                }}
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
            
            {/* Serial Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Serial Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.serialNo ? styles.inputError : null]}
                placeholder="Enter FasTag serial number"
                value={serialNo}
                onChangeText={setSerialNo}
              />
              {errors.serialNo ? (
                <Text style={styles.errorText}>{errors.serialNo}</Text>
              ) : null}
            </View>
            
            {/* TID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TID (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter TID if available"
                value={tid}
                onChangeText={setTid}
              />
            </View>
          </View>
          
          {/* Document Upload Button */}
          <TouchableOpacity 
            style={styles.docUploadButton}
            onPress={navigateToDocUpload}
          >
            <Text style={styles.docUploadButtonText}>Upload RC Documents</Text>
          </TouchableOpacity>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Update VRN</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: '#6200EE',
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
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#6200EE',
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
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  required: {
    color: '#FF0000',
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
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#6200EE',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  docUploadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6200EE',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  docUploadButtonText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VrnUpdateScreen; 