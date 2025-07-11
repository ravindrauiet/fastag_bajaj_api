import React, { useState, useEffect, useContext, useRef } from 'react';
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
import ErrorHandler from './ValidationErrorHandler';
import FormLogger from '../utils/FormLogger';
import { trackFormSubmission, FORM_TYPES, SUBMISSION_STATUS } from '../utils/FormTracker';
import FasTagRegistrationHelper from '../utils/FasTagRegistrationHelper';

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
    lastName,
    otpResponse = null,
    formSubmissionId = null,
    fastagRegistrationId = null
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

  // Document icons for visual representation
  const documentIcons = {
    RCFRONT: "📄",
    RCBACK: "📄",
    VEHICLEFRONT: "🚗",
    VEHICLESIDE: "🚗",
    TAGAFFIX: "🏷️"
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
        // aspect: [4, 3],
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
        // aspect: [4, 3],
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
      ErrorHandler.showErrorAlert(
        'Missing Image',
        `Please select a ${documentDescriptions[imageType]} image first.`
      );
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
        
        // Use our new error handler instead of Alert.alert directly
        ErrorHandler.showErrorAlert(
          'Upload Error',
          `${errorMsg}. You can try again.`
        );
        
        // Keep the session active but return false to indicate failure
        return false;
      }
    } catch (error) {
      console.error(`Document Upload Error (${imageType}):`, error);
      
      // Use our new error handler for better error display and logging
      return await ErrorHandler.handleApiError(
        error,
        `Upload ${documentDescriptions[imageType]}`,
        {
          imageType,
          documentType: documentDescriptions[imageType],
          requestId,
          sessionId
        },
        null, // No specific form type for now
        'upload_document'
      );
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
    
    // Create form data for tracking
    const formData = {
      requestId,
      sessionId,
      mobileNo,
      vehicleNo,
      chassisNo,
      engineNo,
      customerId,
      walletId,
      name,
      imagesUploaded: Object.keys(images).filter(type => images[type] !== null).length,
      timestamp: new Date().toISOString()
    };
    
    // Track with FormTracker - start the document upload process
    const trackingResult = await trackFormSubmission(
      FORM_TYPES.DOCUMENT_UPLOAD,
      formData,
      null, // New submission for this step
      SUBMISSION_STATUS.STARTED
    );
    
    // Track with FormLogger
    const logResult = await FormLogger.logFormAction(
      FORM_TYPES.DOCUMENT_UPLOAD,
      formData,
      'upload',
      'started'
    );
    
    // NEW: Track with FasTag registration system
    const fastagResult = await FasTagRegistrationHelper.trackDocumentUpload(
      formData,
      fastagRegistrationId // Use ID from previous screen
    );
    console.log('FasTag tracking for document upload started:', fastagResult);
    
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
          // Don't break out of the loop - continue with other documents
        }
      }
    }
    
    // After all uploads are complete, check if all were successful
    if (allSuccess && allDocumentsUploaded()) {
      // Update FormTracker with success
      await trackFormSubmission(
        FORM_TYPES.DOCUMENT_UPLOAD,
        {
          ...formData,
          uploadedDocs,
          apiSuccess: true
        },
        trackingResult.id,
        SUBMISSION_STATUS.COMPLETED
      );
      
      // Update FormLogger with success
      await FormLogger.logFormAction(
        FORM_TYPES.DOCUMENT_UPLOAD,
        {
          ...formData,
          uploadedDocs,
          apiSuccess: true
        },
        'upload',
        'success'
      );
      
      // NEW: Update FasTag tracking with success
      await FasTagRegistrationHelper.trackDocumentUpload(
        {
          ...formData,
          uploadedDocs,
          apiSuccess: true
        },
        fastagResult.registrationId
      );
      
      Alert.alert(
        'Documents Uploaded',
        'All documents have been uploaded successfully! You can now proceed with the FasTag registration.',
        [
          {
            text: 'Proceed',
            onPress: proceedToRegistration
          }
        ]
      );
    } else {
      // Some document uploads failed
      const failedDocs = Object.keys(uploadedDocs)
        .filter(type => !uploadedDocs[type])
        .map(type => documentDescriptions[type]);
      
      // Update FormTracker with partial success
      await trackFormSubmission(
        FORM_TYPES.DOCUMENT_UPLOAD,
        {
          ...formData,
          uploadedDocs,
          failedDocs,
          apiSuccess: false
        },
        trackingResult.id,
        SUBMISSION_STATUS.IN_PROGRESS
      );
      
      // Update FormLogger with partial success
      await FormLogger.logFormAction(
        FORM_TYPES.DOCUMENT_UPLOAD,
        {
          ...formData,
          uploadedDocs,
          failedDocs,
          apiSuccess: false
        },
        'upload',
        'error',
        new Error(`Failed to upload some documents: ${failedDocs.join(', ')}`)
      );
      
      // NEW: Update FasTag tracking with partial success
      await FasTagRegistrationHelper.trackDocumentUpload(
        {
          ...formData,
          uploadedDocs,
          failedDocs,
          apiSuccess: false
        },
        fastagResult.registrationId
      );
      
      Alert.alert(
        'Processing Images',
        `We're still processing some images. Please press OK and then click "Upload All Documents" again to complete the process.`,
        [{ text: 'OK' }]
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
        channel: otpResponse.validateOtpResp?.channel || route.params.channel || 'TMSQ',
        agentId: otpResponse.validateOtpResp?.agentId || route.params.agentId || '70043',
        
        // UDF fields from OTP response
        udf1: otpResponse.validateOtpResp?.udf1 || '',
        udf2: otpResponse.validateOtpResp?.udf2 || '',
        udf3: otpResponse.validateOtpResp?.udf3 || '',
        udf4: otpResponse.validateOtpResp?.udf4 || '',
        udf5: otpResponse.validateOtpResp?.udf5 || '',
        
        // Document details
        documentDetails,
        // Pass form submission IDs for tracking
        formSubmissionId: formSubmissionId,
        fastagRegistrationId: fastagRegistrationId
      });
    } else {
      Alert.alert(
        'Required Documents',
        'Please upload all required documents before proceeding.'
      );
    }
  };
  
  // Render each document upload card
  const renderDocumentCard = (imageType) => {
    const hasImage = images[imageType] !== null;
    const isUploaded = uploadedDocs[imageType];
    const isCurrentlyUploading = currentUploadType === imageType && loading;
    
    // Determine if this is a camera-only document type
    const isCameraOnly = [''].includes(imageType);
    
    return (
      <View style={styles.documentCard} key={imageType}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <Text style={styles.documentIcon}>{documentIcons[imageType]}</Text>
          </View>
          <View style={styles.documentTitleContainer}>
            <Text style={styles.documentTitle}>{documentDescriptions[imageType]}</Text>
            <Text style={styles.documentSubtitle}>
              {hasImage 
                ? (isUploaded ? 'Uploaded successfully' : 'Ready to upload') 
                : 'Select or take a photo'}
            </Text>
          </View>
          {isUploaded && (
            <View style={styles.uploadedBadge}>
              <Text style={styles.uploadedBadgeText}>✓</Text>
            </View>
          )}
        </View>
        
        <View style={styles.documentContent}>
          {hasImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{uri: images[imageType].uri}} 
                style={styles.imagePreview}
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => removeImage(imageType)}
                disabled={isUploaded || isCurrentlyUploading}
              >
                <Text style={[
                  styles.removeImageText,
                  (isUploaded || isCurrentlyUploading) && styles.disabledText
                ]}>❌</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageOptions}>
              <TouchableOpacity 
                style={styles.imageOptionButton}
                onPress={() => takePhoto(imageType)}
                // onPress={() => {
                //   Alert.alert(
                //     'Coming Soon',
                //     'Camera functionality will be available in the next update.',
                //     [{ text: 'OK' }]
                //   );
                // }}
              >
                <Text style={styles.imageOptionIcon}>📷</Text>
                <Text style={styles.imageOptionText}>Camera</Text>
              </TouchableOpacity>
              
              {!isCameraOnly && (
                <TouchableOpacity 
                  style={styles.imageOptionButton}
                  onPress={() => pickImage(imageType)}
                >
                  <Text style={styles.imageOptionIcon}>🖼️</Text>
                  <Text style={styles.imageOptionText}>Gallery</Text>
                </TouchableOpacity>
              )}
              
              {isCameraOnly && (
                <View style={[styles.imageOptionButton, styles.disabledButton]}>
                  <Text style={[styles.imageOptionIcon, styles.disabledText]}>🖼️</Text>
                  <Text style={[styles.imageOptionText, styles.disabledText]}>Gallery (Disabled)</Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.documentFooter}>
          {hasImage && !isUploaded && (
            <TouchableOpacity 
              style={[styles.uploadButton, { opacity: 0.5 }]}
              disabled={true}
            >
              <Text style={styles.uploadButtonText}>Upload Next Document</Text>
            </TouchableOpacity>
          )}
        </View>
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
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Upload</Text>
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
              Please upload all required documents for FasTag registration.
              Clear images will help process your application faster.
            </Text>
          </View>
          
          {/* {renderDevelopmentModeToggle()} */}
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Uploaded: {Object.values(uploadedDocs).filter(Boolean).length} of 5
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round((Object.values(uploadedDocs).filter(Boolean).length / 5) * 100)}%
              </Text>
            </View>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    opacity: 0.8,
  },
  progressContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#EDE7F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200EE',
    borderRadius: 3,
  },
  documentsContainer: {
    marginBottom: 20,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    overflow: 'hidden',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  documentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentIcon: {
    fontSize: 18,
  },
  documentTitleContainer: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6200EE',
  },
  documentSubtitle: {
    fontSize: 12,
    color: '#6200EE',
  },
  uploadedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  documentContent: {
    padding: 15,
  },
  imagePreviewContainer: {
    padding: 15,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  removeImageText: {
    color: '#6200EE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#CCCCCC',
  },
  imageOptions: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'center',
  },
  imageOptionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EDE7F6',
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  imageOptionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  imageOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6200EE',
  },
  documentFooter: {
    padding: 15,
  },
  uploadButton: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    marginBottom: 30,
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  uploadAllButton: {
    backgroundColor: '#6200EE',
  },
  proceedButton: {
    backgroundColor: '#6200EE',
  },
  disabledButton: {
    backgroundColor: '#EDE7F6',
    borderColor: '#EDE7F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  devModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  devModeText: {
    marginRight: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#6200EE',
  },
});

export default DocumentUploadScreen;
