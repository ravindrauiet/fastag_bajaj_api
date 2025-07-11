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
import bajajApi from '../api/bajajApi';

const FasTagReplacementScreen = ({ navigation, route }) => {
  // Extract params from route
  const { 
    requestId,
    sessionId,
    mobileNo: initialMobile,
    vehicleNo: initialVehicle,
    chassisNo: initialChassis,
    engineNo: initialEngine,
    walletId: initialWallet,
    isNationalPermit: initialNationalPermit,
    permitExpiryDate: initialPermitDate,
    stateOfRegistration: initialState,
    vehicleDescriptor: initialDescriptor,
    repTagCost: initialRepTagCost,
    channel,
    agentId,
    udf1: initialUdf1,
    udf2: initialUdf2,
    udf3: initialUdf3,
    udf4: initialUdf4,
    udf5: initialUdf5
  } = route.params;

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Initialize form state with received params
  const [mobileNo, setMobileNo] = useState(initialMobile);
  const [walletId, setWalletId] = useState(initialWallet);
  const [vehicleNo, setVehicleNo] = useState(initialVehicle);
  const [serialNo, setSerialNo] = useState('');
  const [debitAmt, setDebitAmt] = useState(initialRepTagCost);
  const [chassisNo, setChassisNo] = useState(initialChassis);
  const [engineNo, setEngineNo] = useState(initialEngine);
  const [udf1, setUdf1] = useState(initialUdf1);
  const [udf2, setUdf2] = useState(initialUdf2);
  const [udf3, setUdf3] = useState(initialUdf3);
  const [udf4, setUdf4] = useState(initialUdf4);
  const [udf5, setUdf5] = useState(initialUdf5);

  // Dropdown states
  const [isNationalPermit, setIsNationalPermit] = useState(initialNationalPermit);
  const [stateOfRegistration, setStateOfRegistration] = useState(initialState);
  const [vehicleDescriptor, setVehicleDescriptor] = useState(initialDescriptor);
  const [reasonId, setReasonId] = useState(null);
  const [reasonDesc, setReasonDesc] = useState('');

  // Dropdown items
  const [reasonItems, setReasonItems] = useState([
    {label: 'Tag Damaged', value: '1'},
    {label: 'Lost Tag', value: '2'},
    {label: 'Tag Not Working', value: '3'},
    {label: 'Others', value: '99'},
  ]);
  
  // National Permit
  const [openNationalPermit, setOpenNationalPermit] = useState(false);
  const [nationalPermitItems, setNationalPermitItems] = useState([
    {label: 'Yes', value: '1'},
    {label: 'No', value: '0'},
  ]);
  
  // Date input state
  const [permitExpiryDate, setPermitExpiryDate] = useState(initialPermitDate);
  
  // Reason state
  const [openReason, setOpenReason] = useState(false);
  
  // State registration
  const [openState, setOpenState] = useState(false);
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
  const [vehicleDescriptorItems, setVehicleDescriptorItems] = useState([
    {label: 'Petrol', value: 'PETROL'},
    {label: 'Diesel', value: 'DIESEL'},
    {label: 'CNG', value: 'CNG'},
    {label: 'Electric', value: 'ELECTRIC'},
    {label: 'Hybrid', value: 'HYBRID'}
  ]);
  
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
        
      // case 'walletId':
      //   if (!value) {
      //     error = 'Wallet ID is required';
      //   }
      //   break;
        
      case 'serialNo':
        if (!value) {
          error = 'Serial number is required';
        }
        break;
        
      case 'debitAmt':
        if (!value) {
          error = 'Amount is required';
        } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          error = 'Enter a valid amount';
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
  const handleSubmit = async () => {
    // Validate required fields
    const isValid = 
      validateField('mobileNo', mobileNo) &
      // validateField('walletId', walletId) &
      validateField('vehicleNo', vehicleNo) &
      validateField('serialNo', serialNo) &
      validateField('debitAmt', debitAmt) &
      validateField('reasonId', reasonId);
    
    if (reasonId === '99') {
      validateField('reasonDesc', reasonDesc);
    }
    
    if (!isValid) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }
    
    // Generate request and session IDs if not provided
    const generatedRequestId = requestId || `REQ${Date.now()}`;
    const generatedSessionId = sessionId || `SES${Date.now()}`;
    
    // Correctly structure the payload as per Bajaj API documentation
    const payload = {
      tagReplaceReq: {
        mobileNo: mobileNo,
        walletId: walletId || "",
        vehicleNo: vehicleNo,
        channel: channel || "TMSQ",
        agentId: agentId || "70043",
        // Don't set reqDateTime here, it will be set in the API function
        debitAmt: debitAmt,
        requestId: generatedRequestId,
        sessionId: generatedSessionId,
        serialNo: serialNo,
        reason: reasonId,
        reasonDesc: reasonId === '99' ? reasonDesc : "",
        chassisNo: chassisNo || "",
        engineNo: engineNo || "",
        isNationalPermit: isNationalPermit || "0",
        permitExpiryDate: permitExpiryDate || "",
        stateOfRegistration: stateOfRegistration || "",
        vehicleDescriptor: vehicleDescriptor || "",
        udf1: udf1 || "",
        udf2: udf2 || "",
        udf3: udf3 || "",
        udf4: udf4 || "",
        udf5: udf5 || ""
      }
    };

    try {
      console.log('Sending FasTag replacement request:', JSON.stringify(payload, null, 2));
      const response = await bajajApi.replaceFastag(payload);
      
      if (response?.response?.status === 'success') {
        // Show success message
        addNotification({
          type: 'success',
          message: 'FasTag replacement request submitted successfully',
          autoClose: true
        });
        
        // Show success alert before navigating
        Alert.alert(
          'Success',
          'Your FasTag replacement request has been submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to HomeScreen instead of Confirmation
                navigation.navigate('Home');
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        // Show error message
        const errorMsg = response?.response?.msg || 'Failed to process replacement request';
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('Error submitting replacement request:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
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
        <Text style={styles.headerTitle}>FasTag Replacement</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
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
            {/* <View style={styles.inputGroup}>
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
            </View> */}
            
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
            
            {/* Debit Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Debit Amount<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.debitAmt ? styles.inputError : null]}
                placeholder="Enter amount"
                value={debitAmt}
                editable={false}
                keyboardType="numeric"
              />
              {errors.debitAmt ? (
                <Text style={styles.errorText}>{errors.debitAmt}</Text>
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
                listMode="SCROLLVIEW"
                maxHeight={150}
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
                listMode="SCROLLVIEW"
                maxHeight={150}
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
                listMode="SCROLLVIEW"
                maxHeight={150}
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
                listMode="SCROLLVIEW"
                maxHeight={150}
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
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EDE7F6',
    borderRadius: 8,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EDE7F6',
  },
  submitButton: {
    backgroundColor: '#6200EE',
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