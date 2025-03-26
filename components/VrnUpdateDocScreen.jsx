import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Alert,
  Animated,
  Image,
  ActivityIndicator,
  TextInput,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NotificationContext } from '../contexts/NotificationContext';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import bajajApi from '../api/bajajApi';

const VrnUpdateDocScreen = ({ navigation, route }) => {
  // Get any params passed from previous screen
  const { vehicleNo, chassisNo, engineNo, mobileNo, serialNo } = route.params || {};
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [rcFrontImage, setRcFrontImage] = useState(null);
  const [rcBackImage, setRcBackImage] = useState(null);
  const [mobileInput, setMobileInput] = useState(mobileNo || '');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    rcFront: null,
    rcBack: null,
  });
  
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
  
  // Update image based on type
  const updateImage = (imageType, imageData) => {
    if (imageType === 'rcFront') {
      setRcFrontImage({
        uri: imageData.uri,
        base64: imageData.base64
      });
      setErrors(prev => ({ ...prev, rcFront: '' }));
    } else if (imageType === 'rcBack') {
      setRcBackImage({
        uri: imageData.uri,
        base64: imageData.base64
      });
      setErrors(prev => ({ ...prev, rcBack: '' }));
    }
  };
  
  // Show image source picker (camera or gallery)
  const showImageSourcePicker = (imageType) => {
    Alert.alert(
      'Select Image Source',
      'Choose where to select the image from',
      [
        { 
          text: 'Camera', 
          onPress: () => takePhoto(imageType) 
        },
        { 
          text: 'Gallery', 
          onPress: () => pickImage(imageType) 
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
      ],
      { cancelable: true }
    );
  };
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Validate mobile number
    if (!mobileInput.trim()) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(mobileInput)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
      isValid = false;
    }
    
    // Validate images
    if (!rcFrontImage) {
      newErrors.rcFront = 'RC front image is required';
      isValid = false;
    }
    
    if (!rcBackImage) {
      newErrors.rcBack = 'RC back image is required';
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
      // Set upload progress for UI feedback
      setUploadProgress({
        rcFront: 'uploading',
        rcBack: 'uploading'
      });
      
      // Call Bajaj API to update VRN documents
      const response = await bajajApi.updateVrnDocument(
        rcFrontImage.base64,
        rcBackImage.base64,
        mobileInput
      );
      
      console.log('VRN Document Update Response:', response);
      
      if (response && response.response && response.response.status === 'success') {
        // Update upload progress
        setUploadProgress({
          rcFront: 'success',
          rcBack: 'success'
        });
        
        // Add notification
        addNotification({
          id: Date.now(),
          message: 'RC documents uploaded successfully for VRN update',
          time: 'Just now',
          read: false
        });
        
        Alert.alert(
          'Success',
          'RC documents uploaded successfully!',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        const errorMsg = response?.response?.errorDesc || 'Failed to upload RC documents';
        setUploadProgress({
          rcFront: 'failed',
          rcBack: 'failed'
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('VRN Document Update Error:', error);
      
      setUploadProgress({
        rcFront: 'failed',
        rcBack: 'failed'
      });
      
      Alert.alert(
        'Upload Failed',
        `Failed to upload RC documents: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Render progress indicator
  const renderProgressIndicator = (imageType) => {
    const status = uploadProgress[imageType];
    
    if (status === 'uploading') {
      return <ActivityIndicator size="small" color="#0066CC" />;
    } else if (status === 'success') {
      return <AntDesign name="checkcircle" size={18} color="green" />;
    } else if (status === 'failed') {
      return <AntDesign name="closecircle" size={18} color="red" />;
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
        <Text style={styles.headerTitle}>Upload RC Documents</Text>
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
            <Text style={styles.infoTitle}>Upload Registration Certificate</Text>
            <Text style={styles.infoText}>
              Please upload clear images of both sides of your vehicle Registration Certificate (RC).
              These documents are required to complete the VRN update process.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.mobile ? styles.inputError : null]}
                placeholder="Enter 10 digit mobile number"
                value={mobileInput}
                onChangeText={setMobileInput}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.mobile ? (
                <Text style={styles.errorText}>{errors.mobile}</Text>
              ) : null}
            </View>
            
            {/* RC Front Image */}
            <View style={styles.imageSection}>
              <View style={styles.imageSectionHeader}>
                <Text style={styles.label}>RC Front Side<Text style={styles.required}>*</Text></Text>
                {renderProgressIndicator('rcFront')}
              </View>
              
              {rcFrontImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: rcFrontImage.uri }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.changeButton}
                    onPress={() => showImageSourcePicker('rcFront')}
                  >
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => showImageSourcePicker('rcFront')}
                >
                  <MaterialIcons name="add-photo-alternate" size={40} color="#777" />
                  <Text style={styles.uploadButtonText}>Upload RC Front</Text>
                </TouchableOpacity>
              )}
              
              {errors.rcFront ? (
                <Text style={styles.errorText}>{errors.rcFront}</Text>
              ) : null}
            </View>
            
            {/* RC Back Image */}
            <View style={styles.imageSection}>
              <View style={styles.imageSectionHeader}>
                <Text style={styles.label}>RC Back Side<Text style={styles.required}>*</Text></Text>
                {renderProgressIndicator('rcBack')}
              </View>
              
              {rcBackImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: rcBackImage.uri }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.changeButton}
                    onPress={() => showImageSourcePicker('rcBack')}
                  >
                    <Text style={styles.changeButtonText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => showImageSourcePicker('rcBack')}
                >
                  <MaterialIcons name="add-photo-alternate" size={40} color="#777" />
                  <Text style={styles.uploadButtonText}>Upload RC Back</Text>
                </TouchableOpacity>
              )}
              
              {errors.rcBack ? (
                <Text style={styles.errorText}>{errors.rcBack}</Text>
              ) : null}
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Upload Documents</Text>
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
  imageSection: {
    marginBottom: 20,
  },
  imageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadButton: {
    height: 160,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  uploadButtonText: {
    marginTop: 12,
    fontSize: 16,
    color: '#777777',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#999999',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VrnUpdateDocScreen; 