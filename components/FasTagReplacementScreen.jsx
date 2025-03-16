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
  Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { NotificationContext } from '../contexts/NotificationContext';

const FasTagReplacementScreen = ({ navigation }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Form state
  const [mobileNo, setMobileNo] = useState('');
  const [walletId, setWalletId] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [engineNo, setEngineNo] = useState('');
  
  // National Permit
  const [isNationalPermit, setIsNationalPermit] = useState('1');
  const [openNationalPermit, setOpenNationalPermit] = useState(false);
  const [nationalPermitItems, setNationalPermitItems] = useState([
    {label: 'Yes', value: '1'},
    {label: 'No', value: '0'},
  ]);
  
  // Date input state
  const [permitExpiryDate, setPermitExpiryDate] = useState('31/12/2025');
  
  // Reason state
  const [openReason, setOpenReason] = useState(false);
  const [reasonId, setReasonId] = useState(null);
  const [reasonDesc, setReasonDesc] = useState('');
  const [reasonItems, setReasonItems] = useState([
    {label: 'Tag Damaged', value: '1'},
    {label: 'Lost Tag', value: '2'},
    {label: 'Tag Not Working', value: '3'},
    {label: 'Others', value: '99'},
  ]);
  
  // State registration
  const [openState, setOpenState] = useState(false);
  const [stateOfRegistration, setStateOfRegistration] = useState('MH');
  const [stateItems, setStateItems] = useState([
    {label: 'Maharashtra', value: 'MH'},
    {label: 'Delhi', value: 'DL'},
    {label: 'Karnataka', value: 'KA'},
    {label: 'Tamil Nadu', value: 'TN'},
    {label: 'Gujarat', value: 'GJ'},
    {label: 'Uttar Pradesh', value: 'UP'},
    {label: 'Rajasthan', value: 'RJ'}
  ]);
  
  // Vehicle descriptor dropdown
  const [openVehicleDescriptor, setOpenVehicleDescriptor] = useState(false);
  const [vehicleDescriptor, setVehicleDescriptor] = useState('Petrol');
  const [vehicleDescriptorItems, setVehicleDescriptorItems] = useState([
    {label: 'Petrol', value: 'Petrol'},
    {label: 'Diesel', value: 'Diesel'},
    {label: 'CNG', value: 'CNG'},
    {label: 'Electric', value: 'Electric'},
    {label: 'Hybrid', value: 'Hybrid'}
  ]);
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Optional fields
  const [udf1, setUdf1] = useState('');
  const [udf2, setUdf2] = useState('');
  const [udf3, setUdf3] = useState('');
  const [udf4, setUdf4] = useState('');
  const [udf5, setUdf5] = useState('');
  
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
  
  // Handle date input with auto-formatting
  const handleDateChange = (text) => {
    // Allow only numbers and slashes
    const formattedText = text.replace(/[^0-9\/]/g, '');
    
    // Auto-add slashes after day and month
    let formatted = formattedText;
    if (formattedText.length === 2 && !formattedText.includes('/') && permitExpiryDate.length === 1) {
      formatted = formattedText + '/';
    } else if (formattedText.length === 5 && formattedText.charAt(2) === '/' && !formattedText.includes('/', 3) && permitExpiryDate.length === 4) {
      formatted = formattedText + '/';
    }
    
    setPermitExpiryDate(formatted);
  };
  
  // Basic validation
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'mobileNo':
        if (!value) {
          error = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(value)) {
          error = 'Mobile number must be 10 digits';
        }
        break;
        
      case 'vehicleNo':
        if (!value) {
          error = 'Vehicle number is required';
        } else if (!/^[A-Z0-9]{5,10}$/.test(value)) {
          error = 'Enter a valid vehicle number';
        }
        break;
        
      case 'walletId':
        if (!value) {
          error = 'Wallet ID is required';
        }
        break;
        
      case 'serialNo':
        if (!value) {
          error = 'Serial number is required';
        }
        break;
        
      case 'reasonId':
        if (!value) {
          error = 'Please select a reason';
        }
        break;
        
      case 'reasonDesc':
        if (reasonId === '99' && !value) {
          error = 'Please provide a reason description';
        }
        break;
        
      case 'permitExpiryDate':
        if (!value) {
          error = 'Permit expiry date is required';
        } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          error = 'Date must be in DD/MM/YYYY format';
        }
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  };
  
  // Format current date and time as DD/MM/YYYY HH:mm:ss
  const getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate all required fields
    const validMobile = validateField('mobileNo', mobileNo);
    const validVehicle = validateField('vehicleNo', vehicleNo);
    const validWallet = validateField('walletId', walletId);
    const validSerial = validateField('serialNo', serialNo);
    const validReason = validateField('reasonId', reasonId);
    const validReasonDesc = validateField('reasonDesc', reasonDesc);
    const validDate = validateField('permitExpiryDate', permitExpiryDate);
    
    if (!(validMobile && validVehicle && validWallet && validSerial && validReason && validReasonDesc && validDate)) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    
    // If validation passes, add this code before the Alert:
    addNotification({
      id: Date.now(),
      message: 'FasTag replacement request submitted',
      time: 'Just now',
      read: false
    });
    
    // Prepare API request payload
    const payload = {
      tagReplaceReq: {
        mobileNo,
        walletId,
        vehicleNo,
        channel: "APP",
        agentId: "",
        reqDateTime: getCurrentDateTime(),
        debitAmt: "",
        requestId: Date.now().toString(),
        sessionId: Date.now().toString(),
        serialNo,
        reason: reasonId,
        reasonDesc: reasonId === '99' ? reasonDesc : "",
        chassisNo,
        engineNo,
        isNationalPermit,
        permitExpiryDate,
        stateOfRegistration,
        vehicleDescriptor,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5
      }
    };
    
    console.log('FasTag Replacement Request:', payload);
    
    // In a real app, we would call the API here
    // For the demo, we'll simulate a successful response
    Alert.alert(
      'Success',
      'FasTag replacement request submitted successfully!',
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
        <Text style={styles.headerTitle}>FasTag Replacement</Text>
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
            <Text style={styles.infoTitle}>FasTag Replacement</Text>
            <Text style={styles.infoText}>
              If your FasTag is damaged or not working, you can apply for a replacement.
              Please provide the required details to proceed.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
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
            
            {/* Wallet ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wallet ID<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.walletId ? styles.inputError : null]}
                placeholder="Enter wallet ID"
                value={walletId}
                onChangeText={(text) => {
                  setWalletId(text);
                  validateField('walletId', text);
                }}
              />
              {errors.walletId ? (
                <Text style={styles.errorText}>{errors.walletId}</Text>
              ) : null}
            </View>
            
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
            
            {/* Serial Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Serial Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.serialNo ? styles.inputError : null]}
                placeholder="Enter FasTag serial number"
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
            
            {/* Reason Dropdown */}
            <View style={[styles.inputGroup, { zIndex: 3000 }]}>
              <Text style={styles.label}>Reason for Replacement<Text style={styles.required}>*</Text></Text>
              <DropDownPicker
                open={openReason}
                value={reasonId}
                items={reasonItems}
                setOpen={setOpenReason}
                setValue={(value) => {
                  setReasonId(value);
                  validateField('reasonId', value);
                }}
                setItems={setReasonItems}
                placeholder="Select reason"
                style={[styles.dropdown, errors.reasonId ? styles.inputError : null]}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={3000}
              />
              {errors.reasonId ? (
                <Text style={styles.errorText}>{errors.reasonId}</Text>
              ) : null}
            </View>
            
            {/* Reason Description (only if "Others" is selected) */}
            {reasonId === '99' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Other Reason<Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.reasonDesc ? styles.inputError : null]}
                  placeholder="Please describe the reason"
                  value={reasonDesc}
                  onChangeText={(text) => {
                    setReasonDesc(text);
                    validateField('reasonDesc', text);
                  }}
                  multiline={true}
                  numberOfLines={3}
                />
                {errors.reasonDesc ? (
                  <Text style={styles.errorText}>{errors.reasonDesc}</Text>
                ) : null}
              </View>
            )}
            
            {/* Chassis Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chassis Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter chassis number"
                value={chassisNo}
                onChangeText={setChassisNo}
              />
            </View>
            
            {/* Engine Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Engine Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter engine number"
                value={engineNo}
                onChangeText={setEngineNo}
              />
            </View>
            
            {/* National Permit */}
            <View style={[styles.inputGroup, { zIndex: 2000 }]}>
              <Text style={styles.label}>National Permit</Text>
              <DropDownPicker
                open={openNationalPermit}
                value={isNationalPermit}
                items={nationalPermitItems}
                setOpen={setOpenNationalPermit}
                setValue={setIsNationalPermit}
                setItems={setNationalPermitItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={2000}
              />
            </View>
            
            {/* Permit Expiry Date - Plain text input instead of date picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Permit Expiry Date</Text>
              <TextInput
                style={[styles.input, errors.permitExpiryDate ? styles.inputError : null]}
                placeholder="DD/MM/YYYY"
                value={permitExpiryDate}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.permitExpiryDate ? (
                <Text style={styles.errorText}>{errors.permitExpiryDate}</Text>
              ) : null}
            </View>
            
            {/* State of Registration */}
            <View style={[styles.inputGroup, { zIndex: 1500 }]}>
              <Text style={styles.label}>State of Registration</Text>
              <DropDownPicker
                open={openState}
                value={stateOfRegistration}
                items={stateItems}
                setOpen={setOpenState}
                setValue={setStateOfRegistration}
                setItems={setStateItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={1500}
              />
            </View>
            
            {/* Vehicle Descriptor */}
            <View style={[styles.inputGroup, { zIndex: 1000 }]}>
              <Text style={styles.label}>Vehicle Descriptor</Text>
              <DropDownPicker
                open={openVehicleDescriptor}
                value={vehicleDescriptor}
                items={vehicleDescriptorItems}
                setOpen={setOpenVehicleDescriptor}
                setValue={setVehicleDescriptor}
                setItems={setVehicleDescriptorItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={1000}
              />
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Replacement Request</Text>
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
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
    borderRadius: 8,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
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

export default FasTagReplacementScreen; 