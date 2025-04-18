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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';
import { AntDesign } from '@expo/vector-icons';
import bajajApi from '../api/bajajApi';
import { API_URL, API_ENDPOINTS } from '../config';

// Helper function to generate request ID
const generateRequestId = () => {
  return `REQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const ManualActivationScreen = ({ route, navigation }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [serialNo, setSerialNo] = useState('');
  const [tid, setTid] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // UI state
  const [loading, setLoading] = useState(false);
  
  // Extract all required data from route.params
  const { 
    // Base data
    requestId,
    sessionId,
    mobileNo,
    vehicleNo, 
    chassisNo,
    engineNo,
    customerId,
    walletId,
    name,
    lastName,
    
    // Vehicle details from OTP response
    vehicleManuf,
    model,
    vehicleColour,
    type,
    rtoStatus,
    tagVehicleClassID,
    npciVehicleClassID,
    vehicleType,
    rechargeAmount,
    securityDeposit,
    tagCost,
    vehicleDescriptor,
    isNationalPermit,
    permitExpiryDate,
    stateOfRegistration,
    commercial,
    npciStatus,
    documentDetails,
    channel,
    agentId,
    
    // Optional fields
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    debitAmt = "400.00"
  } = route.params || {};
  
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
  
  // Basic validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Validate Serial Number
    if (!serialNo.trim()) {
      newErrors.serialNo = 'Serial number is required';
      isValid = false;
    } else if (serialNo.length < 10) {
      newErrors.serialNo = 'Serial number must be at least 10 characters';
      isValid = false;
    }
    
    // Validate TID
    if (!tid.trim()) {
      newErrors.tid = 'TID is required';
      isValid = false;
    } else if (tid.length < 7) {
      newErrors.tid = 'TID must be at least 10 characters';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate inputs
    if (!serialNo.trim()) {
      setErrors(prev => ({ ...prev, serialNo: 'Serial Number is required' }));
      return;
    }
    // if (!tid.trim()) {
    //   setErrors(prev => ({ ...prev, tid: 'TID is required' }));
    //   return;
    // }
    
    // Clear any existing errors
    setErrors({});
    
    setLoading(true);
    
    try {
      console.log('Starting FasTag registration process...');
      console.log('Document details status:', JSON.stringify(documentDetails));
      console.log('Using session ID:', sessionId);
      
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
    
      // Create the registration data object to match exact API documentation order
      const registrationData = {
        regDetails: {
          requestId: requestId || generateRequestId(),
          sessionId: sessionId || requestId || generateRequestId(),
          channel: channel || 'CBPL',
          agentId: agentId || '70003',
          reqDateTime: new Date().toISOString().replace('T', ' ').substring(0, 23)
        },
        vrnDetails: {
          vrn: vehicleNo || "",
          chassis: chassisNo || "",
          engine: engineNo || "",
          vehicleManuf: vehicleManuf || "",
          model: model || "",
          vehicleColour: vehicleColour || "",
          type: type || "",
          status:  rtoStatus || "ACTIVE",
          npciStatus: "ACTIVE",
          isCommercial: commercial === true ? true : false,
          tagVehicleClassID: tagVehicleClassID || "4",
          npciVehicleClassID: npciVehicleClassID || "4",
          vehicleType: vehicleType || "",
          rechargeAmount: rechargeAmount || "0.00",
          securityDeposit: securityDeposit || "100.00",
          tagCost: tagCost || "100.00",
          debitAmt: debitAmt || "400.00",
          vehicleDescriptor: vehicleDescriptor || "DIESEL",
          isNationalPermit: isNationalPermit || "1",
          permitExpiryDate: permitExpiryDate || "31/12/2025",
          stateOfRegistration: stateOfRegistration || "MH"
        },
        custDetails: {
          name: name || "",
          mobileNo: mobileNo || "",
          walletId: walletId || ""
        },
        fasTagDetails: {
          serialNo: serialNo.trim(),
          tid: tid.trim(),
          udf1: udf1 || "",
          udf2: udf2 || "",
          udf3: udf3 || "",
          udf4: udf4 || "",
          udf5: udf5 || ""
        }
      };
      
      // Validate all required document uploads
      if (!documentDetails || 
          !documentDetails.RCFRONT || 
          !documentDetails.RCBACK || 
          !documentDetails.VEHICLEFRONT || 
          !documentDetails.VEHICLESIDE || 
          !documentDetails.TAGAFFIX) {
        console.error('Missing document uploads:', JSON.stringify(documentDetails));
        Alert.alert(
          'Missing Documents',
          'Some required documents are missing. Please go back and ensure all documents are uploaded.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      console.log('FasTag Registration Request:', JSON.stringify(registrationData, null, 2));
      
      // Navigate to FasTag registration with the data
      navigation.navigate('FasTagRegistration', {
        registrationData,
        documentDetails,
        // Also pass the raw data in case it's needed
        rawData: {
          requestId,
          sessionId,
          channel,
          agentId,
          mobileNo,
          vehicleNo,
          chassisNo,
          engineNo,
          customerId,
          walletId,
          name,
          vehicleManuf,
          model,
          vehicleColour,
          type,
          rtoStatus,
          tagVehicleClassID,
          npciVehicleClassID,
          vehicleType,
          rechargeAmount,
          securityDeposit,
          tagCost,
          vehicleDescriptor,
          isNationalPermit,
          permitExpiryDate,
          stateOfRegistration,
          commercial,
          npciStatus,
          serialNo,
          tid,
          udf1,
          udf2,
          udf3,
          udf4,
          udf5
        }
      });
    } catch (error) {
      console.error('Error checking Bajaj app status:', error);
      Alert.alert(
        'Error',
        'Failed to verify Bajaj app installation status. Please try again.',
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
        <Text style={styles.headerTitle}>FasTag Manual Activation</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View 
            style={[styles.content, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }]}
          >
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>FasTag Manual Activation</Text>
              <Text style={styles.infoText}>
                Please enter the FasTag Serial Number and TID details manually. These details are required to complete the registration process.
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              {/* Serial Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Serial Number<Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.serialNo ? styles.inputError : null]}
                  placeholder="Enter FasTag Serial Number"
                  value={serialNo}
                  onChangeText={setSerialNo}
                  autoCapitalize="characters"
                />
                {errors.serialNo ? (
                  <Text style={styles.errorText}>{errors.serialNo}</Text>
                ) : null}
              </View>
              
              {/* TID */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>TID<Text style={styles.required}></Text></Text>
                <TextInput
                  style={[styles.input, errors.tid ? styles.inputError : null]}
                  placeholder="Enter FasTag TID"
                  value={tid}
                  onChangeText={setTid}
                  autoCapitalize="characters"
                />
                {errors.tid ? (
                  <Text style={styles.errorText}>{errors.tid}</Text>
                ) : null}
              </View>
            </View>
            
            {/* Vehicle Details Summary */}
            {vehicleNo && (
              <View style={styles.summaryContainer}>
                <Text style={styles.sectionTitle}>Vehicle Details</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Vehicle Number:</Text>
                  <Text style={styles.summaryValue}>{vehicleNo || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Chassis Number:</Text>
                  <Text style={styles.summaryValue}>{chassisNo || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Engine Number:</Text>
                  <Text style={styles.summaryValue}>{engineNo || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Vehicle Model:</Text>
                  <Text style={styles.summaryValue}>{model || 'N/A'}</Text>
                </View>
              </View>
            )}
            
            {/* Customer Details Summary */}
            {name && (
              <View style={styles.summaryContainer}>
                <Text style={styles.sectionTitle}>Customer Details</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Name:</Text>
                  <Text style={styles.summaryValue}>{name || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Mobile Number:</Text>
                  <Text style={styles.summaryValue}>{mobileNo || 'N/A'}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Wallet ID:</Text>
                  <Text style={styles.summaryValue}>{walletId || 'N/A'}</Text>
                </View>
              </View>
            )}
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Continue to Registration</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
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
  summaryContainer: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    flex: 2,
    textAlign: 'right',
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

export default ManualActivationScreen;