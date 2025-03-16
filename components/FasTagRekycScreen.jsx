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
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NotificationContext } from '../contexts/NotificationContext';

const FasTagRekycScreen = ({ navigation }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [requestId] = useState(Date.now().toString());
  const [sessionId] = useState(Date.now().toString());
  const [channel] = useState("APP");
  const [agentId] = useState("70003");
  const [vrn, setVrn] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  
  // Images
  const [tagAffixImage, setTagAffixImage] = useState(null);
  const [vehicleSideImage, setVehicleSideImage] = useState(null);
  const [vehicleFrontImage, setVehicleFrontImage] = useState(null);
  const [rcFrontImage, setRcFrontImage] = useState(null);
  const [rcBackImage, setRcBackImage] = useState(null);
  
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
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
        Alert.alert('Permission Required', 'Camera and media library permissions are required to upload documents.');
      }
    })();
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
    switch (imageType) {
      case 'TAGAFFIX':
        setTagAffixImage(imageData);
        setErrors(prev => ({ ...prev, tagAffixImage: '' }));
        break;
      case 'VEHICLESIDE':
        setVehicleSideImage(imageData);
        setErrors(prev => ({ ...prev, vehicleSideImage: '' }));
        break;
      case 'VEHICLEFRONT':
        setVehicleFrontImage(imageData);
        setErrors(prev => ({ ...prev, vehicleFrontImage: '' }));
        break;
      case 'RCFRONT':
        setRcFrontImage(imageData);
        setErrors(prev => ({ ...prev, rcFrontImage: '' }));
        break;
      case 'RCBACK':
        setRcBackImage(imageData);
        setErrors(prev => ({ ...prev, rcBackImage: '' }));
        break;
    }
  };
  
  // Remove image
  const removeImage = (imageType) => {
    switch (imageType) {
      case 'TAGAFFIX':
        setTagAffixImage(null);
        setErrors(prev => ({ ...prev, tagAffixImage: 'Tag affix image is required' }));
        break;
      case 'VEHICLESIDE':
        setVehicleSideImage(null);
        setErrors(prev => ({ ...prev, vehicleSideImage: 'Vehicle side image is required' }));
        break;
      case 'VEHICLEFRONT':
        setVehicleFrontImage(null);
        setErrors(prev => ({ ...prev, vehicleFrontImage: 'Vehicle front image is required' }));
        break;
      case 'RCFRONT':
        setRcFrontImage(null);
        setErrors(prev => ({ ...prev, rcFrontImage: 'RC front image is required' }));
        break;
      case 'RCBACK':
        setRcBackImage(null);
        setErrors(prev => ({ ...prev, rcBackImage: 'RC back image is required' }));
        break;
    }
  };
  
  // Basic validation
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'vrn':
        if (!value) {
          error = 'Vehicle number is required';
        } else if (!/^[A-Z0-9]{5,10}$/.test(value)) {
          error = 'Enter a valid vehicle number';
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
        
      case 'tagAffixImage':
        if (!value) {
          error = 'Tag affix image is required';
        }
        break;
        
      case 'vehicleSideImage':
        if (!value) {
          error = 'Vehicle side image is required';
        }
        break;
        
      case 'vehicleFrontImage':
        if (!value) {
          error = 'Vehicle front image is required';
        }
        break;
        
      case 'rcFrontImage':
        if (!value) {
          error = 'RC front image is required';
        }
        break;
        
      case 'rcBackImage':
        if (!value) {
          error = 'RC back image is required';
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
    const validVrn = validateField('vrn', vrn);
    const validMobile = validateField('mobileNo', mobileNo);
    const validSerial = validateField('serialNo', serialNo);
    const validTagAffix = validateField('tagAffixImage', tagAffixImage);
    const validVehicleSide = validateField('vehicleSideImage', vehicleSideImage);
    const validVehicleFront = validateField('vehicleFrontImage', vehicleFrontImage);
    const validRcFront = validateField('rcFrontImage', rcFrontImage);
    const validRcBack = validateField('rcBackImage', rcBackImage);
    
    if (!(validVrn && validMobile && validSerial && validTagAffix && validVehicleSide && 
          validVehicleFront && validRcFront && validRcBack)) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    
    // Create array of images to be uploaded
    const imagesToUpload = [
      { type: 'TAGAFFIX', image: tagAffixImage },
      { type: 'VEHICLESIDE', image: vehicleSideImage },
      { type: 'VEHICLEFRONT', image: vehicleFrontImage },
      { type: 'RCFRONT', image: rcFrontImage },
      { type: 'RCBACK', image: rcBackImage }
    ];
    
    // Log each image upload (in a real app, these would be API calls)
    imagesToUpload.forEach(img => {
      const payload = {
        regDetails: {
          requestId,
          sessionId,
          channel,
          agentId,
          reqDateTime: getCurrentDateTime()
        },
        documentDetails: {
          vrn,
          mobileNo,
          serialNo,
          imageType: img.type,
          image: img.image.base64 ? img.image.base64.substring(0, 20) + '...' : '...',
          sessionId: null,
          udf1: null,
          udf2: null,
          udf3: null,
          udf4: null,
          udf5: null
        }
      };
      
      console.log(`Uploading ${img.type} image:`, payload);
    });
    
    // Add a notification
    addNotification({
      id: Date.now(),
      message: 'FasTag Re-KYC images uploaded successfully',
      time: 'Just now',
      read: false
    });
    
    // In a real app, we would call the API here for each image
    // For the demo, we'll simulate a successful response
    Alert.alert(
      'Success',
      'All FasTag Re-KYC images have been uploaded successfully!',
      [
        { text: 'OK', onPress: () => navigation.navigate('HomeScreen') }
      ]
    );
  };
  
  // Render image section with upload options
  const renderImageSection = (title, imageType, image, setImage) => {
    const errorKey = imageType.toLowerCase().replace(/^/, '') + 'Image';
    return (
      <View style={styles.imageSection}>
        <Text style={styles.label}>{title}<Text style={styles.required}>*</Text></Text>
        
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
        
        {errors[errorKey] ? (
          <Text style={styles.errorText}>{errors[errorKey]}</Text>
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
                  validateField('vrn', upperText);
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
          </View>
          
          <View style={styles.imagesContainer}>
            <Text style={styles.sectionTitle}>Required Images</Text>
            
            {renderImageSection('Tag Affix (FasTag on vehicle)', 'TAGAFFIX', tagAffixImage, setTagAffixImage)}
            {renderImageSection('Vehicle Side View', 'VEHICLESIDE', vehicleSideImage, setVehicleSideImage)}
            {renderImageSection('Vehicle Front View', 'VEHICLEFRONT', vehicleFrontImage, setVehicleFrontImage)}
            {renderImageSection('RC Front Side', 'RCFRONT', rcFrontImage, setRcFrontImage)}
            {renderImageSection('RC Back Side', 'RCBACK', rcBackImage, setRcBackImage)}
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Upload All Images</Text>
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
  imagesContainer: {
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
  imageSection: {
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 8,
  },
  noImageContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  noImageText: {
    color: '#999999',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    margin: 4,
  },
  imageButtonText: {
    color: '#333333',
    fontWeight: 'bold',
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

export default FasTagRekycScreen; 