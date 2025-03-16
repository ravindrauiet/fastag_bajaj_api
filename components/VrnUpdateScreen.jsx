import React, { useState, useEffect } from 'react';
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
  Animated
} from 'react-native';

const VrnUpdateScreen = ({ navigation }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [requestId] = useState(Date.now().toString());
  const [channel] = useState("APP");
  const [agentId] = useState("");
  const [vehicleNo, setVehicleNo] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [tid, setTid] = useState('');
  const [udf1, setUdf1] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
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
  
  // Format current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000`;
  };
  
  // Basic validation
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'vehicleNo':
        if (!value) {
          error = 'Vehicle number is required';
        } else if (!/^[A-Z0-9]{5,10}$/.test(value)) {
          error = 'Enter a valid vehicle number';
        }
        break;
        
      case 'chassisNo':
        if (!value) {
          error = 'Chassis number is required';
        }
        break;
        
      case 'mobileNo':
        if (!value) {
          error = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(value)) {
          error = 'Mobile number must be 10 digits';
        }
        break;
        
      case 'serialNo':
        if (!value) {
          error = 'Serial number is required';
        }
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate all required fields
    const validVehicle = validateField('vehicleNo', vehicleNo);
    const validChassis = validateField('chassisNo', chassisNo);
    const validMobile = validateField('mobileNo', mobileNo);
    const validSerial = validateField('serialNo', serialNo);
    
    if (!(validVehicle && validChassis && validMobile && validSerial)) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    
    // Prepare API request payload
    const payload = {
      regDetails: {
        requestId,
        channel,
        agentId,
        reqDateTime: getCurrentDateTime()
      },
      vrnUpdateReq: {
        vehicleNo,
        chassisNo,
        engineNo,
        mobileNo,
        serialNo,
        tid,
        udf1
      }
    };
    
    console.log('VRN Update Request:', payload);
    
    // In a real app, we would call the API here
    // For the demo, we'll simulate a successful response
    Alert.alert(
      'Success',
      'Vehicle Registration Number updated successfully!',
      [
        { text: 'OK', onPress: () => navigation.navigate('HomeScreen') }
      ]
    );
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
                  validateField('vehicleNo', upperText);
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
                  validateField('chassisNo', upperText);
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
                placeholder="Enter engine number"
                value={engineNo}
                onChangeText={setEngineNo}
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
                onChangeText={(text) => {
                  setMobileNo(text);
                  validateField('mobileNo', text);
                }}
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
                placeholder="Enter serial number"
                value={serialNo}
                onChangeText={(text) => {
                  setSerialNo(text);
                  validateField('serialNo', text);
                }}
              />
              {errors.serialNo ? (
                <Text style={styles.errorText}>{errors.serialNo}</Text>
              ) : null}
            </View>
            
            {/* TID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter TID (optional)"
                value={tid}
                onChangeText={setTid}
              />
            </View>
            
            {/* UDF1 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Info</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter additional information (optional)"
                value={udf1}
                onChangeText={setUdf1}
              />
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Update VRN</Text>
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
  submitButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VrnUpdateScreen; 