import React, { useState, useEffect } from 'react';
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

const DocumentUploadScreen = ({ navigation }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [requestId] = useState(Date.now().toString());
  const [sessionId] = useState(Date.now().toString());
  const [imageType, setImageType] = useState('');
  const [openImageType, setOpenImageType] = useState(false);
  const [imageTypeItems] = useState([
    {label: 'ID Proof', value: 'ID_PROOF'},
    {label: 'Address Proof', value: 'ADDRESS_PROOF'},
    {label: 'Vehicle RC', value: 'VEHICLE_RC'},
    {label: 'Vehicle Photo', value: 'VEHICLE_PHOTO'},
    {label: 'Other', value: 'OTHER'}
  ]);
  
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  
  // Error state
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
    
    // Request camera and media library permissions
    (async () => {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
        Alert.alert('Permission Required', 'Camera and media library permissions are required to upload documents.');
      }
    })();
  }, []);
  
  // Pick image from media library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0]);
        // Clear error when image is selected
        setErrors(prev => ({ ...prev, image: '' }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };
  
  // Take photo with camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0]);
        // Clear error when image is taken
        setErrors(prev => ({ ...prev, image: '' }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };
  
  // Basic validation
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'imageType':
        if (!value) {
          error = 'Document type is required';
        }
        break;
        
      case 'image':
        if (!value) {
          error = 'Document image is required';
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
    // Validate required fields
    const validImageType = validateField('imageType', imageType);
    const validImage = validateField('image', image);
    
    if (!(validImageType && validImage)) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    
    // In a real app, we would upload the image and other details here
    // For the demo, simulate a successful upload
    Alert.alert(
      'Success',
      'Document uploaded successfully!',
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
        <Text style={styles.headerTitle}>Upload Document</Text>
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
            <Text style={styles.infoTitle}>Document Upload</Text>
            <Text style={styles.infoText}>
              Upload documents required for FasTag registration or replacement.
              You can take a photo or select an image from your gallery.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            {/* Document Type Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document Type<Text style={styles.required}>*</Text></Text>
              <View style={[styles.dropdownContainer, errors.imageType ? styles.inputError : null]}>
                <TouchableOpacity 
                  style={styles.dropdown}
                  onPress={() => setOpenImageType(!openImageType)}
                >
                  <Text style={imageType ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {imageType ? 
                      imageTypeItems.find(item => item.value === imageType)?.label || 'Select document type' : 
                      'Select document type'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                
                {openImageType && (
                  <View style={styles.dropdownList}>
                    {imageTypeItems.map((item) => (
                      <TouchableOpacity
                        key={item.value}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setImageType(item.value);
                          setOpenImageType(false);
                          validateField('imageType', item.value);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {errors.imageType ? (
                <Text style={styles.errorText}>{errors.imageType}</Text>
              ) : null}
            </View>
            
            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter description (optional)"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={3}
              />
            </View>
            
            {/* Document Image */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Document Image<Text style={styles.required}>*</Text></Text>
              
              <View style={styles.imageContainer}>
                {image ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => {
                        setImage(null);
                        setErrors(prev => ({ ...prev, image: 'Document image is required' }));
                      }}
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
                  <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                    <Text style={styles.imageButtonText}>📷 Take Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <Text style={styles.imageButtonText}>🖼️ Choose from Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {errors.image ? (
                <Text style={styles.errorText}>{errors.image}</Text>
              ) : null}
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Upload Document</Text>
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
    textAlignVertical: 'top',
    minHeight: 80,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 4,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#333333',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1001,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333333',
  },
  imageContainer: {
    marginBottom: 8,
  },
  noImageContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    height: 200,
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
    height: 200,
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

export default DocumentUploadScreen;
