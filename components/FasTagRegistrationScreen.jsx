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
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import bajajApi from '../api/bajajApi';
import { NotificationContext } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { FORM_TYPES, SUBMISSION_STATUS, trackFormSubmission } from '../utils/FormTracker';
import FormLogger from '../utils/FormLogger';
import FasTagRegistrationHelper from '../utils/FasTagRegistrationHelper';
import FastagManager from '../utils/FastagManager';
import { deductFromUserWalletForFasTag } from '../services/transactionManager';
import { updateAllocatedFastag } from '../utils/FastagManager';

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
    fastagRegistrationId = null,
    fastagDbId = null
  } = route.params || {};
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Access auth context to get user data
  const { userInfo, userProfile } = useAuth();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Registration Details
  const [requestId] = useState(registrationData?.regDetails?.requestId || Date.now().toString());
  const [sessionId] = useState(registrationData?.regDetails?.sessionId || Date.now().toString());
  const [reqDateTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 23));
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
  const [openVehicleMake, setOpenVehicleMake] = useState(false);
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleMakeItems, setVehicleMakeItems] = useState([]);
  const [loadingVehicleMakes, setLoadingVehicleMakes] = useState(false);
  const [vehicleMakeSearchText, setVehicleMakeSearchText] = useState('');
  
  const [openVehicleModel, setOpenVehicleModel] = useState(false);
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleModelItems, setVehicleModelItems] = useState([]);
  const [loadingVehicleModels, setLoadingVehicleModels] = useState(false);
  const [vehicleModelSearchText, setVehicleModelSearchText] = useState('');
  
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
  // const [vehicleClassItems, setVehicleClassItems] = useState([
  //   {label: 'Car/Jeep/Van', value: '4'},
  //   {label: 'LCV', value: '5'},
  //   {label: 'Bus/Truck', value: '6'},
  //   {label: 'Heavy Vehicle', value: '7'},
  // ]);
  
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
  
  // Filter vehicle makes based on search text
  const filteredVehicleMakes = React.useMemo(() => {
    if (!vehicleMakeSearchText) return vehicleMakeItems;
    return vehicleMakeItems.filter(item => 
      item.label.toLowerCase().includes(vehicleMakeSearchText.toLowerCase())
    );
  }, [vehicleMakeItems, vehicleMakeSearchText]);

  // Filter vehicle models based on search text
  const filteredVehicleModels = React.useMemo(() => {
    if (!vehicleModelSearchText) return vehicleModelItems;
    return vehicleModelItems.filter(item => 
      item.label.toLowerCase().includes(vehicleModelSearchText.toLowerCase())
    );
  }, [vehicleModelItems, vehicleModelSearchText]);
  
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
    
    // Fetch vehicle makes when component mounts
    fetchVehicleMakes();
  }, []);
  
  // Fetch vehicle makes from API
  const fetchVehicleMakes = async () => {
    try {
      setLoadingVehicleMakes(true);
      console.log(`Using consistent requestId: ${requestId} and sessionId: ${sessionId} for vehicle makes`);
      const response = await bajajApi.getVehicleMake(requestId, sessionId, reqDateTime);
      
      // Check both possible response structures
      if ((response && response.getVehicleMake && response.getVehicleMake.status === 'success') || 
          (response && response.response && response.response.status === 'success')) {
        
        // Get the vehicle maker list from either structure
        const makes = (response.getVehicleMake?.vehicleMakerList || response.vehicleMakerList || []);
        
        // Format the makes for dropdown with unique keys
        const formattedMakes = makes.map(make => ({
          label: make,
          value: make,
          key: make
        }));
        
        setVehicleMakeItems(formattedMakes);
        
        // If we already have a vehicle make (from existing data), load its models
        if (vehicleMake) {
          fetchVehicleModels(vehicleMake);
        }
      } else {
        console.error('Failed to get vehicle makes:', response);
        
        // Fallback with some common vehicle makes if API fails
        const fallbackMakes = [
          {label: 'MARUTI', value: 'MARUTI', key: 'MARUTI'},
          {label: 'HYUNDAI', value: 'HYUNDAI', key: 'HYUNDAI'},
          {label: 'TATA', value: 'TATA', key: 'TATA'},
          {label: 'MAHINDRA', value: 'MAHINDRA', key: 'MAHINDRA'},
          {label: 'HONDA', value: 'HONDA', key: 'HONDA'},
          {label: 'TOYOTA', value: 'TOYOTA', key: 'TOYOTA'},
          {label: 'FORD', value: 'FORD', key: 'FORD'},
          {label: 'VOLKSWAGEN', value: 'VOLKSWAGEN', key: 'VOLKSWAGEN'},
          {label: 'RENAULT', value: 'RENAULT', key: 'RENAULT'},
          {label: 'KIA', value: 'KIA', key: 'KIA'}
        ];
        setVehicleMakeItems(fallbackMakes);
      }
    } catch (error) {
      console.error('Error fetching vehicle makes:', error);
      
      // Fallback with some common vehicle makes if API fails
      const fallbackMakes = [
        {label: 'MARUTI', value: 'MARUTI', key: 'MARUTI'},
        {label: 'HYUNDAI', value: 'HYUNDAI', key: 'HYUNDAI'},
        {label: 'TATA', value: 'TATA', key: 'TATA'},
        {label: 'MAHINDRA', value: 'MAHINDRA', key: 'MAHINDRA'},
        {label: 'HONDA', value: 'HONDA', key: 'HONDA'},
        {label: 'TOYOTA', value: 'TOYOTA', key: 'TOYOTA'},
        {label: 'FORD', value: 'FORD', key: 'FORD'},
        {label: 'VOLKSWAGEN', value: 'VOLKSWAGEN', key: 'VOLKSWAGEN'},
        {label: 'RENAULT', value: 'RENAULT', key: 'RENAULT'},
        {label: 'KIA', value: 'KIA', key: 'KIA'}
      ];
      setVehicleMakeItems(fallbackMakes);
    } finally {
      setLoadingVehicleMakes(false);
    }
  };
  
  // Fetch vehicle models when make is selected
  const fetchVehicleModels = async (selectedMake) => {
    if (!selectedMake) {
      setVehicleModelItems([]);
      setVehicleModel('');
      return;
    }
    
    try {
      setLoadingVehicleModels(true);
      setVehicleModel(''); // Clear current model when fetching new ones
      console.log(`Using consistent requestId: ${requestId} and sessionId: ${sessionId} for vehicle models`);
      const response = await bajajApi.getVehicleModel(requestId, sessionId, reqDateTime, selectedMake);
      
      // Check both possible response structures
      if ((response && response.getVehicleModel && response.getVehicleModel.status === 'success') || 
          (response && response.response && response.response.status === 'success')) {
        
        // Get the vehicle model list from either structure
        const models = (response.getVehicleModel?.vehicleModelList || response.vehicleModelList || []);
        
        // Format the models for dropdown with unique keys
        const formattedModels = models.map(model => ({
          label: model,
          value: model,
          key: `${selectedMake}-${model}`
        }));
        
        setVehicleModelItems(formattedModels);
      } else {
        console.error('Failed to get vehicle models:', response);
        // Add a generic model if API fails
        setVehicleModelItems([{
          label: 'Standard',
          value: 'Standard',
          key: `${selectedMake}-Standard`
        }]);
      }
    } catch (error) {
      console.error('Error fetching vehicle models:', error);
      // Add a generic model if API fails
      setVehicleModelItems([{
        label: 'Standard',
        value: 'Standard',
        key: `${selectedMake}-Standard`
      }]);
    } finally {
      setLoadingVehicleModels(false);
    }
  };
  
  // Handle vehicle make selection change
  const handleVehicleMakeChange = (value) => {
    setVehicleMake(value);
    setVehicleModel(''); // Reset model when make changes
    setVehicleModelItems([]); // Clear model items
    
    if (value) {
      fetchVehicleModels(value);
    }
  };
  
  // Handle vehicle model selection change
  const handleVehicleModelChange = (value) => {
    setVehicleModel(value);
  };
  
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
    
    // Validate Vehicle Make and Model
    if (!vehicleMake) {
      newErrors.vehicleMake = 'Vehicle make is required';
      isValid = false;
    }
    
    if (!vehicleModel) {
      newErrors.vehicleModel = 'Vehicle model is required';
      isValid = false;
    }
    
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
        reqDateTime,
        mobileNo,
        vehicleNo: vrn,
        chassisNo: chassis,
        engineNo: engine,
        walletId: userProfile?.walletId || userInfo?.walletId || walletId,
        name,
        serialNo: serialNo.trim(),
        tid: tid.trim(),
        tagVehicleClassID,
        vehicleMake, // Include vehicle make
        vehicleModel, // Include vehicle model
        vehicleDescriptor,
        permitExpiryDate,
        stateOfRegistration,
        isNationalPermit,
        timestamp: new Date().toISOString(),
        // Add expected payment information
        expectedPayment: {
          amount: userProfile && userProfile.minFasTagBalance 
            ? parseFloat(userProfile.minFasTagBalance) 
            : 400,
          method: 'wallet',
          status: 'pending'
        }
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
          channel: channel || "TMSQ",
          agentId: agentId || "70043",
          reqDateTime: new Date().toISOString().replace('T', ' ').substring(0, 23)
        },
        vrnDetails: {
          vrn: vrn || "",
          chassis: chassis || "",
          engine: engine || "",
          vehicleManuf: vehicleManuf || "",
          model: vehicleModel || "",
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
      console.log(`Using consistent requestId: ${finalRegistrationData.regDetails.requestId}`);
      console.log(`Using consistent sessionId: ${finalRegistrationData.regDetails.sessionId}`);
      console.log(`Using vehicle make: ${finalRegistrationData.vrnDetails.vehicleManuf}`);
      console.log(`Using vehicle model: ${finalRegistrationData.vrnDetails.model}`);
      
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
        
        // Deduct from user wallet
        if (userInfo && userInfo.uid) {
          try {
            // Get minimum balance required - use custom value if set, otherwise default to 400
            const amount = userProfile && userProfile.minFasTagBalance 
              ? parseFloat(userProfile.minFasTagBalance) 
              : 400;
              
            console.log(`Deducting ₹${amount} from user wallet for FasTag registration`);
            
            let deductResult = { success: false, transactionId: `TR${Date.now()}` }; // Initialize with default values
            
            try {
              deductResult = await deductFromUserWalletForFasTag(
                userInfo.uid,
                amount,
                {
                  registrationId: response.response?.registrationId || null,
                  vrn: finalRegistrationData.vrnDetails.vrn,
                  serialNo: finalRegistrationData.fasTagDetails.serialNo,
                  name: finalRegistrationData.custDetails.name
                }
              );
            } catch (deductError) {
              console.error('Wallet deduction error:', deductError);
              // Continue with registration despite wallet error
            }
            
            if (!deductResult.success) {
              console.error('Wallet deduction warning:', deductResult.error);
              // Continue with registration despite wallet error
            } else {
              console.log('Wallet successfully debited:', deductResult);
              
              // Update FasTag tracking with payment details
              await FasTagRegistrationHelper.trackFasTagRegistration(
                {
                  ...formData,
                  finalRegistrationData,
                  registrationResponse: response,
                  paymentDetails: {
                    amount: amount,
                    transactionId: deductResult.transactionId,
                    previousBalance: deductResult.previousBalance,
                    newBalance: deductResult.newBalance,
                    paymentMethod: 'wallet',
                    paymentStatus: 'completed',
                    timestamp: new Date().toISOString()
                  },
                  apiSuccess: true
                },
                fastagResult.registrationId
              );
              
              // Update FormTracker with payment information
              await trackFormSubmission(
                FORM_TYPES.FASTAG_REGISTRATION,
                {
                  ...formData,
                  finalRegistrationData,
                  registrationResponse: response,
                  paymentDetails: {
                    amount: amount,
                    transactionId: deductResult.transactionId,
                    previousBalance: deductResult.previousBalance,
                    newBalance: deductResult.newBalance,
                    paymentMethod: 'wallet',
                    paymentStatus: 'completed',
                    timestamp: new Date().toISOString()
                  },
                  apiSuccess: true
                },
                trackingResult.id,
                SUBMISSION_STATUS.PAYMENT_COMPLETED
              );
              
              // Log payment success with FormLogger
              await FormLogger.logFormAction(
                FORM_TYPES.FASTAG_REGISTRATION,
                {
                  ...formData,
                  finalRegistrationData,
                  paymentDetails: {
                    amount: amount,
                    transactionId: deductResult.transactionId,
                    paymentMethod: 'wallet',
                    paymentStatus: 'completed'
                  }
                },
                'payment',
                'success'
              );
              
              // Add notification about payment
              addNotification({
                id: Date.now() + 1,
                message: `₹${amount} debited from your wallet for FasTag registration`,
                time: 'Just now',
                read: false
              });
            }
            
            // Make deductResult available for the inventory update code
            // Update FasTag in the inventory database if we have an ID
            if (fastagDbId) {
              try {
                // Get the payment amount for the record
                const paymentAmount = userProfile && userProfile.minFasTagBalance 
                  ? parseFloat(userProfile.minFasTagBalance) 
                  : 400;
                  
                // First get the existing fastag record to access current payment data
                const existingTagResult = await FastagManager.getFastag(fastagDbId);
                let paymentHistory = [];
                let totalAmountPaid = 0;
                
                if (existingTagResult.success && existingTagResult.fastag) {
                  // Preserve existing payment history if available
                  paymentHistory = existingTagResult.fastag.paymentHistory || [];
                  totalAmountPaid = existingTagResult.fastag.totalAmountPaid || 0;
                }
                
                // Create new payment record
                const newPayment = {
                  amount: paymentAmount,
                  method: 'wallet',
                  status: 'completed',
                  purpose: 'FasTag Registration',
                  transactionId: deductResult?.transactionId || `TR${Date.now()}`,
                  timestamp: new Date().toISOString()
                };
                
                // Add to payment history and update total amount
                paymentHistory.push(newPayment);
                totalAmountPaid += paymentAmount;
                  
                await FastagManager.updateFastag(fastagDbId, {
                  status: 'active',
                  mobileNo: finalRegistrationData.custDetails.mobileNo,
                  vehicleNo: finalRegistrationData.vrnDetails.vrn,
                  name: finalRegistrationData.custDetails.name,
                  walletId: finalRegistrationData.custDetails.walletId,
                  chassisNo: finalRegistrationData.vrnDetails.chassis,
                  engineNo: finalRegistrationData.vrnDetails.engine,
                  // Track the latest payment
                  latestPayment: newPayment,
                  // Maintain payment history
                  paymentHistory: paymentHistory,
                  // Track total amount paid
                  totalAmountPaid: totalAmountPaid,
                  activationDetails: {
                    registrationId: response.response?.registrationId || null,
                    apiResponse: response.response || null,
                    timestamp: new Date().toISOString()
                  }
                });
                console.log('FasTag inventory updated successfully');
              } catch (dbError) {
                console.error('Error updating FasTag in inventory:', dbError);
                // Do not stop the flow if this fails
              }
            } else if (finalRegistrationData.fasTagDetails?.serialNo) {
              // If we don't have fastagDbId but we have the serial number, try to find and update by serial number
              try {
                // Get the payment amount for the record
                const paymentAmount = userProfile && userProfile.minFasTagBalance 
                  ? parseFloat(userProfile.minFasTagBalance) 
                  : 400;
                  
                const serialNo = finalRegistrationData.fasTagDetails.serialNo;
                const existingTag = await FastagManager.getTagBySerialNo(serialNo);
                
                if (existingTag.success && existingTag.fastag) {
                  // Retrieve existing payment data
                  let paymentHistory = existingTag.fastag.paymentHistory || [];
                  let totalAmountPaid = existingTag.fastag.totalAmountPaid || 0;
                  
                  // Create new payment record
                  const newPayment = {
                    amount: paymentAmount,
                    method: 'wallet',
                    status: 'completed',
                    purpose: 'FasTag Registration',
                    transactionId: deductResult?.transactionId || `TR${Date.now()}`,
                    timestamp: new Date().toISOString()
                  };
                  
                  // Add to payment history and update total amount
                  paymentHistory.push(newPayment);
                  totalAmountPaid += paymentAmount;
                  
                  await FastagManager.updateFastag(existingTag.fastag.id, {
                    status: 'active',
                    mobileNo: finalRegistrationData.custDetails.mobileNo,
                    vehicleNo: finalRegistrationData.vrnDetails.vrn,
                    name: finalRegistrationData.custDetails.name,
                    walletId: finalRegistrationData.custDetails.walletId,
                    chassisNo: finalRegistrationData.vrnDetails.chassis,
                    engineNo: finalRegistrationData.vrnDetails.engine,
                    // Track the latest payment
                    latestPayment: newPayment,
                    // Maintain payment history
                    paymentHistory: paymentHistory,
                    // Track total amount paid
                    totalAmountPaid: totalAmountPaid,
                    activationDetails: {
                      registrationId: response.response?.registrationId || null,
                      apiResponse: response.response || null,
                      timestamp: new Date().toISOString()
                    }
                  });
                  console.log('FasTag inventory updated by serial number');
                } else {
                  // If the tag doesn't exist yet, add it now
                  // For new tags, initialize the payment history with the first payment
                  const newPayment = {
                    amount: paymentAmount,
                    method: 'wallet',
                    status: 'completed',
                    purpose: 'FasTag Registration',
                    transactionId: deductResult?.transactionId || `TR${Date.now()}`,
                    timestamp: new Date().toISOString()
                  };
                  
                  await FastagManager.addFastag({
                    serialNo,
                    tid: finalRegistrationData.fasTagDetails.tid || null,
                    status: 'active',
                    mobileNo: finalRegistrationData.custDetails.mobileNo,
                    vehicleNo: finalRegistrationData.vrnDetails.vrn,
                    name: finalRegistrationData.custDetails.name,
                    walletId: finalRegistrationData.custDetails.walletId,
                    chassisNo: finalRegistrationData.vrnDetails.chassis,
                    engineNo: finalRegistrationData.vrnDetails.engine,
                    // Track the latest payment
                    latestPayment: newPayment,
                    // Initialize payment history
                    paymentHistory: [newPayment],
                    // Initialize total amount paid
                    totalAmountPaid: paymentAmount,
                    activationDetails: {
                      registrationId: response.response?.registrationId || null,
                      apiResponse: response.response || null,
                      timestamp: new Date().toISOString()
                    }
                  });
                  console.log('FasTag added to inventory during registration');
                }
              } catch (dbError) {
                console.error('Error updating/adding FasTag by serial number:', dbError);
                // Do not stop the flow if this fails
              }
            }
          } catch (walletError) {
            console.error('Failed to deduct from wallet:', walletError);
            // Continue with registration despite wallet error
          }
        } else {
          // Handle case where user info is not available
          console.log('User info not available for wallet deduction');
          
          // Still update the FasTag inventory without wallet transaction details
          if (fastagDbId || finalRegistrationData.fasTagDetails?.serialNo) {
            try {
              const paymentAmount = userProfile && userProfile.minFasTagBalance 
                ? parseFloat(userProfile.minFasTagBalance) 
                : 400;
              
              const defaultTransactionId = `TR${Date.now()}`;
              
              // Create a default payment record without wallet transaction
              const newPayment = {
                amount: paymentAmount,
                method: 'pending',
                status: 'pending',
                purpose: 'FasTag Registration',
                transactionId: defaultTransactionId,
                timestamp: new Date().toISOString()
              };
              
              if (fastagDbId) {
                await FastagManager.updateFastag(fastagDbId, {
                  status: 'active',
                  mobileNo: finalRegistrationData.custDetails.mobileNo,
                  vehicleNo: finalRegistrationData.vrnDetails.vrn,
                  name: finalRegistrationData.custDetails.name,
                  chassisNo: finalRegistrationData.vrnDetails.chassis,
                  engineNo: finalRegistrationData.vrnDetails.engine,
                  latestPayment: newPayment,
                  activationDetails: {
                    registrationId: response.response?.registrationId || null,
                    apiResponse: response.response || null,
                    timestamp: new Date().toISOString()
                  }
                });
              } else if (finalRegistrationData.fasTagDetails?.serialNo) {
                // Try to find by serial number
                const serialNo = finalRegistrationData.fasTagDetails.serialNo;
                const existingTag = await FastagManager.getTagBySerialNo(serialNo);
                
                if (existingTag.success && existingTag.fastag) {
                  await FastagManager.updateFastag(existingTag.fastag.id, {
                    status: 'active',
                    mobileNo: finalRegistrationData.custDetails.mobileNo,
                    vehicleNo: finalRegistrationData.vrnDetails.vrn,
                    name: finalRegistrationData.custDetails.name,
                    chassisNo: finalRegistrationData.vrnDetails.chassis,
                    engineNo: finalRegistrationData.vrnDetails.engine,
                    latestPayment: newPayment,
                    activationDetails: {
                      registrationId: response.response?.registrationId || null,
                      apiResponse: response.response || null,
                      timestamp: new Date().toISOString()
                    }
                  });
                } else {
                  // Add new tag
                  await FastagManager.addFastag({
                    serialNo,
                    tid: finalRegistrationData.fasTagDetails.tid || null,
                    status: 'active',
                    mobileNo: finalRegistrationData.custDetails.mobileNo,
                    vehicleNo: finalRegistrationData.vrnDetails.vrn,
                    name: finalRegistrationData.custDetails.name,
                    chassisNo: finalRegistrationData.vrnDetails.chassis,
                    engineNo: finalRegistrationData.vrnDetails.engine,
                    latestPayment: newPayment,
                    paymentHistory: [newPayment],
                    totalAmountPaid: paymentAmount,
                    activationDetails: {
                      registrationId: response.response?.registrationId || null,
                      apiResponse: response.response || null,
                      timestamp: new Date().toISOString()
                    }
                  });
                }
              }
              console.log('FasTag inventory updated without wallet transaction');
            } catch (dbError) {
              console.error('Error updating FasTag inventory without wallet transaction:', dbError);
            }
          }
        }
        
        // Show success message
        const successMsg = `FasTag registered successfully! ₹${userProfile && userProfile.minFasTagBalance ? parseFloat(userProfile.minFasTagBalance) : 400} has been deducted from your wallet.`;
        setSuccessMessage(successMsg);
        setShowSuccessModal(true);
        
        // Add notification
        addNotification({
          id: Date.now(),
          message: 'FasTag registered successfully!',
          time: 'Just now',
          read: false
        });

        // Update allocatedFasTags collection - now doing this for all error cases including code 11
        try {
          console.log('=== Updating FasTag Status ===');
          console.log('Serial Number:', serialNo);
          console.log('Vehicle Number:', vrn);
          
          // First get the allocated FasTag ID using serial number
          const allocatedTag = await FastagManager.getAllocatedFastagBySerialNumber(serialNo);
          console.log('Allocated Tag:', allocatedTag);
          
          if (!allocatedTag) {
            console.error('❌ No allocated FasTag found with serial number:', serialNo);
            return;
          }
          
          const allocatedFastagData = {
            status: 'allocated',
            vehicleNo: vrn,
            updatedAt: new Date().toISOString()
          };
          
          console.log('Update Data:', JSON.stringify(allocatedFastagData, null, 2));
          console.log('Using ID from allocated FasTag:', allocatedTag.id);
          
          // Update the allocatedFasTags document using the ID from allocatedTag
          await FastagManager.updateAllocatedFastag(allocatedTag.id, allocatedFastagData);
          console.log('✅ Successfully updated allocatedFasTags status to allocated');
        } catch (error) {
          console.error('❌ Error updating allocatedFasTags:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          // Continue with the flow even if update fails
        }

        // Check if wallet exists
        const walletStatus = response.validateOtpResp?.custDetails?.walletStatus;
        console.log('Wallet status:', walletStatus);
      } else {
        const errorMsg = response?.response?.errorDesc || 'Failed to register FasTag';
        const errorCode = response?.response?.code || 'unknown';
        
        console.log('=== FasTag Registration Error Details ===');
        console.log('Error Code:', errorCode);
        console.log('Error Message:', errorMsg);
        console.log('Response:', JSON.stringify(response, null, 2));
        
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
        
        // Update allocatedFasTags collection - now doing this for all error cases including code 11
        try {
          console.log('=== Updating FasTag Status ===');
          console.log('Serial Number:', serialNo);
          console.log('Vehicle Number:', vrn);
          
          // First get the allocated FasTag ID using serial number
          const allocatedTag = await FastagManager.getAllocatedFastagBySerialNumber(serialNo);
          console.log('Allocated Tag:', allocatedTag);
          
          if (!allocatedTag) {
            console.error('❌ No allocated FasTag found with serial number:', serialNo);
            return;
          }
          
          const allocatedFastagData = {
            // status: 'failed',
            vehicleNo: vrn,
            updatedAt: new Date().toISOString()
          };
          
          console.log('Update Data:', JSON.stringify(allocatedFastagData, null, 2));
          console.log('Using ID from allocated FasTag:', allocatedTag.id);
          
          // Update the allocatedFasTags document using the ID from allocatedTag
          await FastagManager.updateAllocatedFastag(allocatedTag.id, allocatedFastagData);
          console.log('✅ Successfully updated allocatedFasTags status to allocated');
        } catch (error) {
          console.error('❌ Error updating allocatedFasTags:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          // Continue with the flow even if update fails
        }
        
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
          console.log('RC Image error detected, showing special alert');
          Alert.alert(
            'Registration Error - RC Images',
            'There was an issue with your RC images. Please go back to the Document Upload screen and re-upload clearer images of your Registration Certificate.',
            [{ text: 'OK' }]
          );
        } else {
          // Show error message but don't throw error to allow status update
          console.log('Showing general error alert');
          Alert.alert(
            'Registration Error',
            errorMsg,
            [{ text: 'OK' }]
          );
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
  
  // Add a new function to handle navigation to home screen
  const handleContinueToHome = () => {
    setShowSuccessModal(false);
    navigation.navigate('HomeScreen', {
      success: true,
      message: successMessage
    });
  };

  // Create a single item for FlatList
  const renderContent = () => (
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
        
        {/* Vehicle Make */}
        <View style={[styles.inputGroup, { zIndex: 5000 }]}>
          <Text style={styles.label}>Vehicle Make<Text style={styles.required}>*</Text></Text>
          <DropDownPicker
            open={openVehicleMake}
            value={vehicleMake}
            items={filteredVehicleMakes}
            setOpen={setOpenVehicleMake}
            setValue={setVehicleMake}
            setItems={setVehicleMakeItems}
            onChangeValue={handleVehicleMakeChange}
            placeholder="Select vehicle make"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={5000}
            loading={loadingVehicleMakes}
            searchable={true}
            searchPlaceholder="Search vehicle make..."
            searchTextInputProps={{
              value: vehicleMakeSearchText,
              onChangeText: setVehicleMakeSearchText,
              style: styles.searchInput
            }}
            ActivityIndicatorComponent={({ color }) => (
              <ActivityIndicator color={color} size="small" />
            )}
          />
          {errors.vehicleMake ? (
            <Text style={styles.errorText}>{errors.vehicleMake}</Text>
          ) : null}
        </View>
        
        {/* Vehicle Model */}
        <View style={[styles.inputGroup, { zIndex: 4000 }]}>
          <Text style={styles.label}>Vehicle Model<Text style={styles.required}>*</Text></Text>
          <DropDownPicker
            open={openVehicleModel}
            value={vehicleModel}
            items={filteredVehicleModels}
            setOpen={setOpenVehicleModel}
            setValue={setVehicleModel}
            setItems={setVehicleModelItems}
            placeholder={vehicleMake ? "Select vehicle model" : "First select vehicle make"}
            style={[styles.dropdown, !vehicleMake && styles.disabledDropdown]}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={4000}
            disabled={!vehicleMake}
            loading={loadingVehicleModels}
            searchable={true}
            searchPlaceholder="Search vehicle model..."
            searchTextInputProps={{
              value: vehicleModelSearchText,
              onChangeText: setVehicleModelSearchText,
              style: styles.searchInput
            }}
            ActivityIndicatorComponent={({ color }) => (
              <ActivityIndicator color={color} size="small" />
            )}
          />
          {errors.vehicleModel ? (
            <Text style={styles.errorText}>{errors.vehicleModel}</Text>
          ) : null}
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
        
        {/* Wallet Balance */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Wallet Balance</Text>
          <View style={styles.balanceContainer}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceAmount}>₹ {userInfo?.wallet || userProfile?.wallet || 0}</Text>
              <Text style={styles.balanceLabel}>Available Balance</Text>
            </View>
            <View style={styles.requiredCard}>
              <Text style={styles.requiredAmount}>
                ₹ {userProfile && userProfile.minFasTagBalance ? userProfile.minFasTagBalance : 400}
              </Text>
              <Text style={styles.requiredLabel}>Required Amount</Text>
            </View>
          </View>
          {(userInfo?.wallet || userProfile?.wallet || 0) < (userProfile?.minFasTagBalance || 400) && (
            <Text style={styles.insufficientBalanceText}>
              Insufficient balance. Registration will still proceed, but you may need to recharge your wallet.
            </Text>
          )}
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
        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>TID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter TID"
            value={tid}
            onChangeText={setTid}
          />
        </View> */}
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
  );

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
      
      <FlatList
        data={[1]} // Single item since we're using it as a container
        renderItem={renderContent}
        keyExtractor={() => 'registration-form'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
      
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.successModalContainer}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Registration Successful</Text>
            <Text style={styles.successText}>{successMessage}</Text>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinueToHome}
            >
              <Text style={styles.continueButtonText}>Continue to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    flex: 1,
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
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
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
    borderColor: '#EDE7F6',
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
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#555555',
  },
  requiredCard: {
    flex: 1,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  requiredAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 4,
  },
  requiredLabel: {
    fontSize: 12,
    color: '#555555',
  },
  insufficientBalanceText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    width: '80%',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledDropdown: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDDDDD',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  flatListContent: {
    flexGrow: 1,
  },
});

export default FasTagRegistrationScreen;