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
  Image,
  ActivityIndicator,
  Platform,
  Switch
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NotificationContext } from '../contexts/NotificationContext';
import bajajApi from '../api/bajajApi';

// Add the missing generateRequestId function
const generateRequestId = () => {
  return `REQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const DocumentUploadScreen = ({ navigation, route }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Get route parameters from wallet creation
  const { 
    requestId, 
    sessionId, 
    mobileNo, 
    vehicleNo, 
    chassisNo, 
    engineNo, 
    customerId, 
    walletId, 
    name,
    lastName
  } = route.params || {};
  
  // Images with base64 data - all 5 are mandatory per documentation
  const [images, setImages] = useState({
    RCFRONT: null,          // Front side of Registration Certificate
    RCBACK: null,           // Back side of Registration Certificate
    VEHICLEFRONT: null,     // Front view of the vehicle
    VEHICLESIDE: null,      // Side view of the vehicle
    TAGAFFIX: null          // Image of FasTag affixed on the vehicle
  });
  
  // Track which documents have been successfully uploaded
  const [uploadedDocs, setUploadedDocs] = useState({
    RCFRONT: false,
    RCBACK: false,
    VEHICLEFRONT: false,
    VEHICLESIDE: false,
    TAGAFFIX: false
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState(null);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Document type descriptions for better UX
  const documentDescriptions = {
    RCFRONT: "Registration Certificate (Front)",
    RCBACK: "Registration Certificate (Back)",
    VEHICLEFRONT: "Vehicle Front View",
    VEHICLESIDE: "Vehicle Side View",
    TAGAFFIX: "FasTag Affixed on Windshield"
  };
  
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
    
    // Request camera and media library permissions
    (async () => {
      if (Platform.OS !== 'web') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
          Alert.alert('Permission Required', 'Camera and media library permissions are required to upload documents.');
        }
      }
    })();
  }, []);
  
  // Pick image from media library
  const pickImage = async (imageType) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled) {
        updateImage(imageType, result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };
  
  // Take photo with camera
  const takePhoto = async (imageType) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled) {
        updateImage(imageType, result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };
  
  // Update image in state
  const updateImage = (imageType, imageAsset) => {
    setImages(prev => ({
      ...prev,
      [imageType]: imageAsset
    }));
  };
  
  // Remove image from state
  const removeImage = (imageType) => {
    setImages(prev => ({
      ...prev,
      [imageType]: null
    }));
    
    // If the image was successfully uploaded, mark it as not uploaded
    if (uploadedDocs[imageType]) {
      setUploadedDocs(prev => ({
        ...prev,
        [imageType]: false
      }));
    }
  };
  
  // Upload a single document to the API
  const uploadDocument = async (imageType) => {
    if (!images[imageType]) {
      Alert.alert('Error', `Please select a ${documentDescriptions[imageType]} image first.`);
      return false;
    }
    
    setCurrentUploadType(imageType);
    setLoading(true);
    
    try {
      // Base64 data from the image (remove 'data:image/jpeg;base64,' if present)
      const base64Data = images[imageType].base64;
      
      console.log(`Uploading ${imageType} document...`);
      
      // Call the API to upload the document
      const response = await bajajApi.uploadDocument(
        requestId || generateRequestId(),
        sessionId || requestId || generateRequestId(),
        imageType, 
        base64Data,
        isDevelopmentMode
      );
      
      console.log(`${imageType} upload response:`, JSON.stringify(response, null, 2));
      
      if (response && response.response && response.response.status === 'success') {
        // Mark this document as successfully uploaded
        setUploadedDocs(prev => ({
          ...prev,
          [imageType]: true
        }));
        
        // Add notification
        addNotification({
          id: Date.now(),
          message: `${documentDescriptions[imageType]} uploaded successfully!`,
          time: 'Just now',
          read: false
        });
        
        return true;
      } else {
        const errorMsg = response?.response?.errorDesc || `Failed to upload ${documentDescriptions[imageType]}`;
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error(`Document Upload Error (${imageType}):`, error);
      Alert.alert(
        'Upload Error',
        `Failed to upload ${documentDescriptions[imageType]}: ${error.message}`,
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setLoading(false);
      setCurrentUploadType(null);
    }
  };
  
  // Check if all mandatory documents have been uploaded
  const allDocumentsUploaded = () => {
    return Object.values(uploadedDocs).every(status => status === true);
  };
  
  // Upload all documents in sequence
  const uploadAllDocuments = async () => {
    setLoading(true);
    
    // Check if any images are missing
    const missingTypes = Object.keys(images).filter(type => !images[type]);
    if (missingTypes.length > 0) {
      Alert.alert(
        'Missing Documents',
        `Please select images for: ${missingTypes.map(type => documentDescriptions[type]).join(', ')}`,
        [{ text: 'OK' }]
      );
      setLoading(false);
      return;
    }
    
    // Upload each document in sequence
    let allSuccess = true;
    for (const imageType of Object.keys(images)) {
      if (!uploadedDocs[imageType]) {
        const success = await uploadDocument(imageType);
        if (!success) {
          allSuccess = false;
          break;
        }
      }
    }
    
    if (allSuccess && allDocumentsUploaded()) {
      // All documents uploaded successfully
      Alert.alert(
        'Success',
        'All required documents uploaded successfully!',
        [
          { 
            text: 'Continue', 
            onPress: () => proceedToRegistration()
          }
        ]
      );
    }
    
    setLoading(false);
  };
  
  // Proceed to FasTag registration only if all documents are uploaded
  const proceedToRegistration = () => {
    if (allDocumentsUploaded()) {
      // Prepare data for next screen
      const documentDetails = {
        RCFRONT: uploadedDocs.RCFRONT,
        RCBACK: uploadedDocs.RCBACK,
        VEHICLEFRONT: uploadedDocs.VEHICLEFRONT,
        VEHICLESIDE: uploadedDocs.VEHICLESIDE,
        TAGAFFIX: uploadedDocs.TAGAFFIX
      };
      
      // Get the OTP response
      const otpResponse = route.params.otpResponse || {};
      
      // Extract VRN details
      const vrnDetails = otpResponse.validateOtpResp?.vrnDetails || {};
      
      navigation.navigate('ManualActivation', {
        // Basic details
        requestId,
        sessionId,
        mobileNo,
        // Use the exact field names from the OTP response
        vehicleNo: vrnDetails.vehicleNo || vehicleNo, 
        chassisNo: vrnDetails.chassisNo || chassisNo,
        engineNo: vrnDetails.engineNo || engineNo,
        customerId,
        walletId: otpResponse.validateOtpResp?.custDetails?.walletId || walletId || '',
        name: otpResponse.validateOtpResp?.custDetails?.name || '',
        lastName: '',
        
        // Vehicle details from OTP response with proper fallbacks
        vehicleManuf: vrnDetails.vehicleManuf || '',
        model: vrnDetails.model || '',
        vehicleColour: vrnDetails.vehicleColour || '',
        type: vrnDetails.type || '',
        rtoStatus: vrnDetails.rtoStatus || 'ACTIVE',
        tagVehicleClassID: vrnDetails.tagVehicleClassID || '4',
        npciVehicleClassID: vrnDetails.npciVehicleClassID || '4',
        vehicleType: vrnDetails.vehicleType || '',
        rechargeAmount: vrnDetails.rechargeAmount || '0.00',
        securityDeposit: vrnDetails.securityDeposit || '100.00',
        tagCost: vrnDetails.tagCost || '100.00',
        vehicleDescriptor: vrnDetails.vehicleDescriptor || 'DIESEL',
        isNationalPermit: vrnDetails.isNationalPermit || '1',
        permitExpiryDate: vrnDetails.permitExpiryDate || '31/12/2025',
        stateOfRegistration: vrnDetails.stateOfRegistration || 'MH',
        commercial: vrnDetails.commercial === false ? false : true,
        npciStatus: otpResponse.validateOtpResp?.npciStatus || 'ACTIVE',
        
        // Pass channel and agentId from OTP response
        channel: otpResponse.validateOtpResp?.channel || route.params.channel || 'CBPL',
        agentId: otpResponse.validateOtpResp?.agentId || route.params.agentId || '70003',
        
        // UDF fields from OTP response
        udf1: otpResponse.validateOtpResp?.udf1 || '',
        udf2: otpResponse.validateOtpResp?.udf2 || '',
        udf3: otpResponse.validateOtpResp?.udf3 || '',
        udf4: otpResponse.validateOtpResp?.udf4 || '',
        udf5: otpResponse.validateOtpResp?.udf5 || '',
        
        // Document details
        documentDetails
      });
    } else {
      Alert.alert(
        'Required Documents',
        'Please upload all required documents before proceeding.'
      );
    }
  };
  
  // Render document upload card
  const renderDocumentCard = (imageType) => {
    const isUploaded = uploadedDocs[imageType];
    const isLoading = loading && currentUploadType === imageType;
    
    return (
      <View style={styles.documentCard} key={imageType}>
        <Text style={styles.documentTitle}>{documentDescriptions[imageType]}</Text>
        
        {images[imageType] ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: images[imageType].uri }} 
              style={styles.imagePreview} 
              resizeMode="cover"
            />
            
            <View style={styles.imageControls}>
              <TouchableOpacity 
                style={[styles.imageButton, styles.removeButton]}
                onPress={() => removeImage(imageType)}
                disabled={loading}
              >
                <Text style={styles.imageButtonText}>Remove</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.imageButton, styles.uploadButton, isUploaded && styles.uploadedButton]}
                onPress={() => uploadDocument(imageType)}
                disabled={loading || isUploaded}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.imageButtonText}>
                    {isUploaded ? 'Uploaded ✓' : 'Upload'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.imageActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cameraButton]}
              onPress={() => takePhoto(imageType)}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.galleryButton]}
              onPress={() => pickImage(imageType)}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>Pick from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  // Add development mode toggle UI
  const renderDevelopmentModeToggle = () => {
    if (__DEV__) {
      return (
        <View style={styles.devModeContainer}>
          <Text style={styles.devModeText}>Development Mode</Text>
          <Switch
            value={isDevelopmentMode}
            onValueChange={setIsDevelopmentMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDevelopmentMode ? '#2196F3' : '#f4f3f4'}
          />
        </View>
      );
    }
    return null;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Documents</Text>
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
            <Text style={styles.infoTitle}>FasTag Document Upload</Text>
            <Text style={styles.infoText}>
              Upload all five mandatory documents required for FasTag registration.
              All documents must be uploaded before proceeding to registration.
            </Text>
          </View>
          
          {renderDevelopmentModeToggle()}
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Documents Uploaded: {Object.values(uploadedDocs).filter(Boolean).length} of 5
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(Object.values(uploadedDocs).filter(Boolean).length / 5) * 100}%` }
                ]} 
              />
            </View>
          </View>
          
          {/* Document Cards */}
          <View style={styles.documentsContainer}>
            {Object.keys(images).map(imageType => renderDocumentCard(imageType))}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.uploadAllButton, loading && styles.disabledButton]}
              onPress={uploadAllDocuments}
              disabled={loading}
            >
              {loading && !currentUploadType ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Upload All Documents</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.proceedButton, 
                (!allDocumentsUploaded() || loading) && styles.disabledButton
              ]}
              onPress={proceedToRegistration}
              disabled={!allDocumentsUploaded() || loading}
            >
              <Text style={styles.buttonText}>Proceed to Registration</Text>
            </TouchableOpacity>
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
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',  // Green for success
  },
  documentsContainer: {
    marginBottom: 16,
  },
  documentCard: {
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
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    backgroundColor: '#0277BD',
    marginRight: 8,
  },
  galleryButton: {
    backgroundColor: '#00796B',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  imagePreviewContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imageControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  imageButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    backgroundColor: '#F44336',
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: '#3F51B5',
    marginLeft: 8,
  },
  uploadedButton: {
    backgroundColor: '#4CAF50',
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionContainer: {
    marginBottom: 24,
  },
  button: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadAllButton: {
    backgroundColor: '#3F51B5',
  },
  proceedButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#BBBBBB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  devModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  devModeText: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DocumentUploadScreen;
