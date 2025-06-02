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
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NotificationContext } from '../contexts/NotificationContext';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import bajajApi from '../api/bajajApi';
import { API_URL, API_ENDPOINTS } from '../config';

const FasTagRekycScreen = ({ navigation }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [vrn, setVrn] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  
  // Images with base64 data
  const [images, setImages] = useState({
    TAGAFFIX: null,
    VEHICLESIDE: null,
    VEHICLEFRONT: null, 
    RCFRONT: null,
    RCBACK: null
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  
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
      });
      
      if (!result.canceled) {
        updateImage(imageType, result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  // Take photo with camera
  const takePhoto = async (imageType) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
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
    setImages(prevImages => ({
      ...prevImages,
      [imageType]: {
        uri: imageData.uri,
        base64: imageData.base64
      }
    }));
    
    // Clear error for this image type
    setErrors(prev => ({ 
      ...prev, 
      [imageType]: '' 
    }));
  };
  
  // Remove image
  const removeImage = (imageType) => {
    setImages(prevImages => ({
      ...prevImages,
      [imageType]: null
    }));
    
    // Set error for this image type
    setErrors(prev => ({ 
      ...prev, 
      [imageType]: `${getImageTypeLabel(imageType)} image is required` 
    }));
  };
  
  // Basic validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Validate VRN
    if (!vrn.trim()) {
      newErrors.vrn = 'Vehicle number is required';
      isValid = false;
    } else if (!/^[A-Z0-9]{5,10}$/.test(vrn)) {
      newErrors.vrn = 'Enter a valid vehicle number';
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
    
    // Validate all images
    Object.keys(images).forEach(imageType => {
      if (!images[imageType]) {
        newErrors[imageType] = `${getImageTypeLabel(imageType)} image is required`;
        isValid = false;
      }
    });
    
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
      const formData = new FormData();
      Object.entries(images).forEach(([key, image]) => {
        if (image) {
          formData.append(key, {
            uri: image.uri,
            type: 'image/jpeg',
            name: `${key}.jpg`
          });
        }
      });

      const response = await fetch(`${API_URL}${API_ENDPOINTS.FASTAG_REKYC}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Re-KYC images uploaded successfully');
        setImages({
          TAGAFFIX: null,
          VEHICLESIDE: null,
          VEHICLEFRONT: null,
          RCFRONT: null,
          RCBACK: null
        });
      } else {
        throw new Error(data.message || 'Failed to upload images');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get human-readable label for image types
  const getImageTypeLabel = (imageType) => {
    const labels = {
      RCFRONT: 'RC Front',
      RCBACK: 'RC Back',
      VEHICLEFRONT: 'Vehicle Front',
      VEHICLESIDE: 'Vehicle Side',
      TAGAFFIX: 'Tag Affixed on Vehicle',
    };
    return labels[imageType] || imageType;
  };
  
  // Render progress indicator
  const renderProgressIndicator = (imageType) => {
    const status = uploadProgress[imageType];
    
    if (status === true) {
      return <ActivityIndicator size="small" color="#0066CC" />;
    } else if (status === 'success') {
      return <AntDesign name="checkcircle" size={18} color="green" />;
    } else if (status === 'failed') {
      return <AntDesign name="closecircle" size={18} color="red" />;
    }
    
    return null;
  };
  
  // Render image section with upload options
  const renderImageSection = (imageType) => {
    const title = getImageTypeLabel(imageType);
    const image = images[imageType];
    
    return (
      <View style={styles.imageSection} key={imageType}>
        <View style={styles.imageSectionHeader}>
          <Text style={styles.label}>{title}<Text style={styles.required}>*</Text></Text>
          {renderProgressIndicator(imageType)}
        </View>
        
        <View style={styles.imageContainer}>
          {image ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => removeImage(imageType)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No image selected</Text>
            </View>
          )}
          
          <View style={styles.imageActionButtons}>
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={() => takePhoto(imageType)}
            >
              <Text style={styles.imageButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={() => pickImage(imageType)}
            >
              <Text style={styles.imageButtonText}>🖼️ Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {errors[imageType] ? (
          <Text style={styles.errorText}>{errors[imageType]}</Text>
        ) : null}
      </View>
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
        <Text style={styles.headerTitle}>FasTag Re-KYC Upload</Text>
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
            <Text style={styles.infoTitle}>FasTag Re-KYC Image Upload</Text>
            <Text style={styles.infoText}>
              Upload all five mandatory images required for the FasTag Re-KYC process.
              All fields marked with * are required.
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
                placeholder="Enter serial number (e.g., 608268-001-0056151)"
                value={serialNo}
                onChangeText={setSerialNo}
              />
              {errors.serialNo ? (
                <Text style={styles.errorText}>{errors.serialNo}</Text>
              ) : null}
            </View>
          </View>
          
          <View style={styles.imagesContainer}>
            <Text style={styles.sectionTitle}>Required Images</Text>
            
            {Object.keys(images).map(imageType => renderImageSection(imageType))}
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
              <Text style={styles.submitButtonText}>Submit Re-KYC</Text>
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
  imagesContainer: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200EE',
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
  imageContainer: {
    marginBottom: 8,
  },
  noImageContainer: {
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  noImageText: {
    color: '#6200EE',
    fontSize: 16,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    margin: 4,
  },
  imageButtonText: {
    color: '#6200EE',
    fontWeight: 'bold',
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
});

export default FasTagRekycScreen; 