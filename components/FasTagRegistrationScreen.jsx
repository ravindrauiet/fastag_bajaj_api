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
import DropDownPicker from 'react-native-dropdown-picker';
import bajajApi from '../api/bajajApi';
import { NotificationContext } from '../contexts/NotificationContext';
import { FORM_TYPES, SUBMISSION_STATUS, trackFormSubmission } from '../utils/FormTracker';
import FormLogger from '../utils/FormLogger';
import FasTagRegistrationHelper from '../utils/FasTagRegistrationHelper';

// Helper function to generate request ID
const generateRequestId = () => {
  return `REQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const FasTagRegistrationScreen = ({ navigation, route }) => {
  // Get data from ManualActivationScreen
  const { 
    registrationData, 
    documentDetails, 
    rawData,
    formSubmissionId = null,
    fastagRegistrationId = null
  } = route.params || {};
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // UI state
  const [loading, setLoading] = useState(false);
  
  // Registration Details
  const [requestId] = useState(registrationData?.regDetails?.requestId || Date.now().toString());
  const [sessionId] = useState(registrationData?.regDetails?.sessionId || Date.now().toString());
  const [channel] = useState(registrationData?.regDetails?.channel || "APP");
  const [agentId] = useState(registrationData?.regDetails?.agentId || "");
  
  // Customer Details
  const [name, setName] = useState(registrationData?.custDetails?.name || rawData?.name || '');
  const [mobileNo, setMobileNo] = useState(registrationData?.custDetails?.mobileNo || rawData?.mobileNo || '');
  const [walletId, setWalletId] = useState(registrationData?.custDetails?.walletId || rawData?.walletId || '');
  
  // Vehicle Details
  const [vrn, setVrn] = useState(registrationData?.vrnDetails?.vrn || rawData?.vehicleNo || '');
  const [chassis, setChassis] = useState(registrationData?.vrnDetails?.chassis || rawData?.chassisNo || '');
  const [engine, setEngine] = useState(registrationData?.vrnDetails?.engine || rawData?.engineNo || '');
  const [rechargeAmount] = useState(registrationData?.vrnDetails?.rechargeAmount || rawData?.rechargeAmount || "0.00");
  const [securityDeposit] = useState(registrationData?.vrnDetails?.securityDeposit || rawData?.securityDeposit || "100.00");
  const [tagCost] = useState(registrationData?.vrnDetails?.tagCost || rawData?.tagCost || "100.00");
  const [debitAmt] = useState(registrationData?.vrnDetails?.debitAmt || "300.00");
  
  // Additional Vehicle Details
  const [vehicleManuf] = useState(registrationData?.vrnDetails?.vehicleManuf || rawData?.vehicleManuf || '');
  const [model] = useState(registrationData?.vrnDetails?.model || rawData?.model || '');
  const [vehicleColour] = useState(registrationData?.vrnDetails?.vehicleColour || rawData?.vehicleColour || '');
  const [type] = useState(registrationData?.vrnDetails?.type || rawData?.type || '');
  const [rtoStatus] = useState(registrationData?.vrnDetails?.rtoStatus || rawData?.rtoStatus || 'ACTIVE');
  const [npciVehicleClassID] = useState(registrationData?.vrnDetails?.npciVehicleClassID || rawData?.npciVehicleClassID || '4');
  const [vehicleType] = useState(registrationData?.vrnDetails?.vehicleType || rawData?.vehicleType || '');
  const [commercial] = useState(registrationData?.vrnDetails?.isCommercial || rawData?.commercial || false);
  const [npciStatus] = useState(registrationData?.vrnDetails?.npciStatus || rawData?.npciStatus || 'ACTIVE');
  
  // FasTag Details
  const [serialNo, setSerialNo] = useState(registrationData?.fasTagDetails?.serialNo || '');
  const [tid, setTid] = useState(registrationData?.fasTagDetails?.tid || '');
  
  // Additional Details
  const [isNationalPermit, setIsNationalPermit] = useState(registrationData?.vrnDetails?.isNationalPermit || '1');
  const [openNationalPermit, setOpenNationalPermit] = useState(false);
  const [nationalPermitItems, setNationalPermitItems] = useState([
    {label: 'Yes', value: '1'},
    {label: 'No', value: '0'},
  ]);
  
  // Vehicle Descriptor
  const [openVehicleDescriptor, setOpenVehicleDescriptor] = useState(false);
  const [vehicleDescriptor, setVehicleDescriptor] = useState(registrationData?.vrnDetails?.vehicleDescriptor || 'DIESEL');
  const [vehicleDescriptorItems, setVehicleDescriptorItems] = useState([
    {label: 'Petrol', value: 'PETROL'},
    {label: 'Diesel', value: 'DIESEL'},
    {label: 'CNG', value: 'CNG'},
    {label: 'Electric', value: 'ELECTRIC'},
    {label: 'Hybrid', value: 'HYBRID'}
  ]);
  
  // State registration
  const [openState, setOpenState] = useState(false);
  const [stateOfRegistration, setStateOfRegistration] = useState(registrationData?.vrnDetails?.stateOfRegistration || 'MH');
  const [stateItems, setStateItems] = useState([
    {label: 'Maharashtra', value: 'MH'},
    {label: 'Delhi', value: 'DL'},
    {label: 'Karnataka', value: 'KA'},
    {label: 'Tamil Nadu', value: 'TN'},
    {label: 'Gujarat', value: 'GJ'},
    {label: 'Uttar Pradesh', value: 'UP'},
    {label: 'Rajasthan', value: 'RJ'}
  ]);
  
  // Vehicle Class
  const [tagVehicleClassID, setTagVehicleClassID] = useState(registrationData?.vrnDetails?.tagVehicleClassID || '4');
  const [openVehicleClass, setOpenVehicleClass] = useState(false);
  const [vehicleClassItems, setVehicleClassItems] = useState([
    {label: 'Car/Jeep/Van', value: '4'},
    {label: 'LCV', value: '5'},
    {label: 'Bus/Truck', value: '6'},
    {label: 'Heavy Vehicle', value: '7'},
  ]);
  
  // Permit Expiry Date
  const [permitExpiryDate, setPermitExpiryDate] = useState(registrationData?.vrnDetails?.permitExpiryDate || '31/12/2025');
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Optional fields
  const [udf1, setUdf1] = useState(registrationData?.fasTagDetails?.udf1 || '');
  const [udf2, setUdf2] = useState(registrationData?.fasTagDetails?.udf2 || '');
  const [udf3, setUdf3] = useState(registrationData?.fasTagDetails?.udf3 || '');
  const [udf4, setUdf4] = useState(registrationData?.fasTagDetails?.udf4 || '');
  const [udf5, setUdf5] = useState(registrationData?.fasTagDetails?.udf5 || '');
  
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
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Validate Vehicle Registration Number
    if (!vrn) {
      newErrors.vrn = 'Vehicle number is required';
      isValid = false;
    }
    
    // Validate Mobile Number
    if (!mobileNo) {
      newErrors.mobileNo = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(mobileNo)) {
      newErrors.mobileNo = 'Mobile number must be 10 digits';
      isValid = false;
    }
    
    // Validate Customer Name
    if (!name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    // // Validate Wallet ID
    // if (!walletId) {
    //   newErrors.walletId = 'Wallet ID is required';
    //   isValid = false;
    // }
    
    // Validate Serial Number
    if (!serialNo) {
      newErrors.serialNo = 'Serial number is required';
      isValid = false;
    }
    
    // Validate Permit Expiry Date
    if (permitExpiryDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(permitExpiryDate)) {
      newErrors.permitExpiryDate = 'Date must be in DD/MM/YYYY format';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Format current date and time as YYYY-MM-DD HH:mm:ss.SSS
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    
    setLoading(true);
    
    // Declare variables in broader scope for error handling
    let trackingResult = null;
    let fastagResult = null;
    let formData = null;
    let finalRegistrationData = null;
    
    try {
      // Create form data for tracking
      formData = {
        requestId,
        sessionId,
        mobileNo,
        vehicleNo: vrn,
        chassisNo: chassis,
        engineNo: engine,
        walletId,
        name,
        serialNo: serialNo.trim(),
        tid: tid.trim(),
        tagVehicleClassID,
        vehicleDescriptor,
        permitExpiryDate,
        stateOfRegistration,
        isNationalPermit,
        timestamp: new Date().toISOString()
      };
      
      // Track with FormTracker - start the final registration process
      trackingResult = await trackFormSubmission(
        FORM_TYPES.FASTAG_REGISTRATION,
        formData,
        formSubmissionId, // Use ID from previous screen if available
        SUBMISSION_STATUS.STARTED
      );
      
      // Track with FormLogger
      await FormLogger.logFormAction(
        FORM_TYPES.FASTAG_REGISTRATION,
        formData,
        'register',
        'started'
      );
      
      // Track with FasTag registration system
      fastagResult = await FasTagRegistrationHelper.trackFasTagRegistration(
        formData,
        fastagRegistrationId // Use ID from previous screen if available
      );
      console.log('FasTag tracking for registration started:', fastagResult);
      
      // First check if user has downloaded Bajaj app and visited FasTag section
      const appStatusResponse = await bajajApi.checkBajajAppStatus(mobileNo);
      
      if (appStatusResponse && appStatusResponse.response && appStatusResponse.response.status === 'success') {
        if (!appStatusResponse.appInstalled) {
          Alert.alert(
            'Bajaj App Required',
            'Please install the Bajaj Finserv App and visit the FasTag section before continuing with registration.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }
      } else {
        console.log('App status check failed, continuing with registration...');
      }
      
      // Ensure amounts are properly formatted with 2 decimal places
      const formatAmount = (amount) => {
        // Convert to number, format with 2 decimal places, and convert back to string
        return parseFloat(amount).toFixed(2);
      };
      
      // Create the registration data object to match exact API documentation order
      finalRegistrationData = {
        regDetails: {
          requestId: requestId || generateRequestId(),
          sessionId: sessionId || requestId || generateRequestId(),
          channel: channel || "CBPL",
          agentId: agentId || "70003",
          reqDateTime: new Date().toISOString().replace('T', ' ').substring(0, 23)
        },
        vrnDetails: {
          vrn: vrn || "",
          chassis: chassis || "",
          engine: engine || "",
          vehicleManuf: vehicleManuf || "",
          model: model || "",
          vehicleColour: vehicleColour || "",
          type: type || "",
          status: rtoStatus || "ACTIVE",
          npciStatus: "ACTIVE",
          isCommercial: commercial === true ? true : false,
          tagVehicleClassID: tagVehicleClassID || "4",
          npciVehicleClassID: npciVehicleClassID || "4",
          vehicleType: vehicleType || "",
          rechargeAmount: formatAmount(rechargeAmount || "0.00"),
          securityDeposit: formatAmount(securityDeposit || "100.00"),
          tagCost: formatAmount(tagCost || "100.00"),
          debitAmt: formatAmount("400.00"), // Fixed amount
          vehicleDescriptor: vehicleDescriptor || "DIESEL",
          isNationalPermit: isNationalPermit || "1",
          permitExpiryDate: permitExpiryDate || "31/12/2025",
          stateOfRegistration: stateOfRegistration || "MH"
        },
        custDetails: {
          name: name || "",
          mobileNo: mobileNo || "",
          walletId: walletId || null
        },
        fasTagDetails: {
          serialNo: serialNo.trim() || "",
          tid: tid.trim() || "",
          udf1: udf1 || "",
          udf2: udf2 || "",
          udf3: udf3 || "",
          udf4: udf4 || "",
          udf5: udf5 || ""
        }
      };
      
      // Log the registration data for debugging
      console.log('FasTag Registration Request:', JSON.stringify(finalRegistrationData, null, 2));
      
      // Additional validation for session ID to ensure it matches document uploads
      console.log(`Using session ID for registration: ${finalRegistrationData.regDetails.sessionId}`);
      
      // Call the API to register the FasTag
      const response = await bajajApi.registerFasTag(finalRegistrationData);
      
      console.log('FasTag Registration Response:', JSON.stringify(response, null, 2));
      
      if (response && response.response && response.response.status === 'success') {
        // Update FormTracker with success
        await trackFormSubmission(
          FORM_TYPES.FASTAG_REGISTRATION,
          {
            ...formData,
            finalRegistrationData,
            registrationResponse: response,
            apiSuccess: true
          },
          trackingResult.id,
          SUBMISSION_STATUS.COMPLETED
        );
        
        // Log success with FormLogger
        await FormLogger.logFormAction(
          FORM_TYPES.FASTAG_REGISTRATION,
          {
            ...formData,
            finalRegistrationData,
            registrationResponse: response,
            apiSuccess: true
          },
          'register',
          'success'
        );
        
        // Update FasTag tracking with success
        await FasTagRegistrationHelper.trackFasTagRegistration(
          {
            ...formData,
            finalRegistrationData,
            registrationResponse: response,
            apiSuccess: true
          },
          fastagResult.registrationId
        );
        
        // Add notification
        addNotification({
          id: Date.now(),
          message: 'FasTag registered successfully!',
          time: 'Just now',
          read: false
        });
        
        // Navigate to success screen
        navigation.navigate('HomeScreen', {
          success: true,
          message: 'FasTag registered successfully!'
        });
      } else {
        const errorMsg = response?.response?.errorDesc || 'Failed to register FasTag';
        
        // Update FormTracker with error
        await trackFormSubmission(
          FORM_TYPES.FASTAG_REGISTRATION,
          {
            ...formData,
            finalRegistrationData,
            registrationResponse: response,
            error: errorMsg,
            apiSuccess: false
          },
          trackingResult.id,
          SUBMISSION_STATUS.REJECTED
        );
        
        // Log error with FormLogger
        await FormLogger.logFormAction(
          FORM_TYPES.FASTAG_REGISTRATION,
          {
            ...formData,
            finalRegistrationData,
            registrationResponse: response,
            error: errorMsg,
            apiSuccess: false
          },
          'register',
          'error',
          new Error(errorMsg)
        );
        
        // Update FasTag tracking with error
        await FasTagRegistrationHelper.trackFasTagRegistration(
          {
            ...formData,
            finalRegistrationData,
            registrationResponse: response,
            error: errorMsg,
            apiSuccess: false
          },
          fastagResult.registrationId
        );
        
        // Special handling for RC image errors
        if (errorMsg.includes('RCIMAGE')) {
          Alert.alert(
            'Registration Error - RC Images',
            'There was an issue with your RC images. Please go back to the Document Upload screen and re-upload clearer images of your Registration Certificate.',
            [{ text: 'OK' }]
          );
        } else {
          throw new Error(errorMsg);
        }
      }
    } catch (error) {
      console.error('FasTag Registration Error:', error);
      
      // Log exception with tracking systems
      try {
        if (trackingResult && trackingResult.id) {
          await trackFormSubmission(
            FORM_TYPES.FASTAG_REGISTRATION,
            {
              ...formData,
              finalRegistrationData,
              error: error.message,
              apiSuccess: false
            },
            trackingResult.id,
            SUBMISSION_STATUS.FAILED
          );
        }
        
        await FormLogger.logFormAction(
          FORM_TYPES.FASTAG_REGISTRATION,
          {
            ...formData,
            finalRegistrationData,
            error: error.message,
            apiSuccess: false
          },
          'register',
          'error',
          error
        );
        
        if (fastagResult && fastagResult.registrationId) {
          await FasTagRegistrationHelper.trackFasTagRegistration(
            {
              ...formData,
              finalRegistrationData,
              error: error.message,
              apiSuccess: false
            },
            fastagResult.registrationId
          );
        }
      } catch (loggingError) {
        // Don't let logging errors affect the UI flow
        console.error('Error during error tracking:', loggingError);
      }
      
      Alert.alert(
        'Registration Error',
        error.message || 'Failed to register FasTag. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>FasTag Registration</Text>
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
            <Text style={styles.infoTitle}>Bajaj FasTag Registration</Text>
            <Text style={styles.infoText}>
              Complete the registration process for your new FasTag.
              Please provide accurate vehicle and owner details.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {/* Vehicle Registration Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.vrn ? styles.inputError : null]}
                placeholder="Enter vehicle number"
                value={vrn}
                onChangeText={(text) => {
                  const upperText = text.toUpperCase();
                  setVrn(upperText);
                }}
                autoCapitalize="characters"
              />
              {errors.vrn ? (
                <Text style={styles.errorText}>{errors.vrn}</Text>
              ) : null}
            </View>
            
            {/* Chassis Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chassis Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter chassis number"
                value={chassis}
                onChangeText={setChassis}
                autoCapitalize="characters"
              />
            </View>
            
            {/* Engine Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Engine Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter engine number"
                value={engine}
                onChangeText={setEngine}
                autoCapitalize="characters"
              />
            </View>
            
            {/* Vehicle Class */}
            <View style={[styles.inputGroup, { zIndex: 3000 }]}>
              <Text style={styles.label}>Vehicle Class<Text style={styles.required}>*</Text></Text>
              <DropDownPicker
                open={openVehicleClass}
                value={tagVehicleClassID}
                items={vehicleClassItems}
                setOpen={setOpenVehicleClass}
                setValue={setTagVehicleClassID}
                setItems={setVehicleClassItems}
                placeholder="Select vehicle class"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={3000}
              />
            </View>
            
            {/* National Permit */}
            <View style={[styles.inputGroup, { zIndex: 2500 }]}>
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
                zIndex={2500}
              />
            </View>
            
            {/* Permit Expiry Date */}
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
            <View style={[styles.inputGroup, { zIndex: 2000 }]}>
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
                zIndex={2000}
              />
            </View>
            
            {/* Vehicle Descriptor */}
            <View style={[styles.inputGroup, { zIndex: 1500 }]}>
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
                zIndex={1500}
              />
            </View>
            
            {/* Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Name<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="Enter customer name"
                value={name}
                onChangeText={setName}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
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
            
            {/* Wallet ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wallet ID<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.walletId ? styles.inputError : null]}
                placeholder="Enter wallet ID"
                value={walletId}
                onChangeText={setWalletId}
              />
              {errors.walletId ? (
                <Text style={styles.errorText}>{errors.walletId}</Text>
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
              <Text style={styles.label}>TID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter TID"
                value={tid}
                onChangeText={setTid}
              />
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Register FasTag</Text>
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
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FasTagRegistrationScreen;