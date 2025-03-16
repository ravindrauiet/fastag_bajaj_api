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
  Animated, 
  Image,
  Alert,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';

const VehicleDetailsScreen = ({ route, navigation }) => {
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Form state
  const [vehicleNo, setVehicleNo] = useState('');
  const [rcImageUri, setRcImageUri] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  
  // Dropdown state
  const [openVehicleClass, setOpenVehicleClass] = useState(false);
  const [vehicleClass, setVehicleClass] = useState(null);
  const [vehicleClassItems, setVehicleClassItems] = useState([
    {label: 'Car/Jeep/Van', value: 'Car/Jeep/Van'},
    {label: 'LCV', value: 'LCV'},
    {label: 'Bus/Truck', value: 'Bus/Truck'},
    {label: 'Multi-Axle', value: 'Multi-Axle'},
    {label: 'Heavy Vehicle', value: 'Heavy Vehicle'},
  ]);
  
  const [openMakeModel, setOpenMakeModel] = useState(false);
  const [makeModel, setMakeModel] = useState(null);
  const [makeModelItems, setMakeModelItems] = useState([
    {label: 'Maruti Suzuki Swift', value: 'Maruti Suzuki Swift'},
    {label: 'Hyundai i20', value: 'Hyundai i20'},
    {label: 'Honda City', value: 'Honda City'},
    {label: 'Tata Nexon', value: 'Tata Nexon'},
    {label: 'Mahindra XUV700', value: 'Mahindra XUV700'},
    {label: 'Kia Seltos', value: 'Kia Seltos'},
    {label: 'Toyota Fortuner', value: 'Toyota Fortuner'},
  ]);
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Start animations when component mounts
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
  
  // Field validation
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'vehicleNo':
        // Basic vehicle number validation for India
        // Actual validation would be more complex
        if (value && !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(value)) {
          error = 'Invalid vehicle number format (e.g., MH01AB1234)';
        }
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  };
  
  // Handle vehicle number input
  const handleVehicleNoChange = (text) => {
    // Convert to uppercase
    const upperText = text.toUpperCase();
    setVehicleNo(upperText);
    validateField('vehicleNo', upperText);
  };
  
  // Handle image upload
  const handleUploadImage = async (source) => {
    try {
      if (source === 'camera') {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'We need camera permission to take photos');
          return;
        }

        // Launch camera with simplified options
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          allowsEditing: false, // Disable editing to prevent issues
          quality: 0.5, // Lower quality to avoid memory issues
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setRcImageUri(result.assets[0].uri);
        }
      } else {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'We need gallery permission to select images');
          return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setRcImageUri(result.assets[0].uri);
        }
      }
      
      // Close the modal
      setShowImageOptions(false);
    } catch (error) {
      console.log('Image selection error:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
      setShowImageOptions(false);
    }
  };
  
  // Handle proceed to next screen
  const handleProceed = () => {
    // Validate required fields
    let isValid = true;
    const newErrors = {};
    
    if (!vehicleNo) {
      newErrors.vehicleNo = 'Vehicle number is required';
      isValid = false;
    } else {
      isValid = validateField('vehicleNo', vehicleNo) && isValid;
    }
    
    if (!vehicleClass) {
      newErrors.vehicleClass = 'Please select a vehicle class';
      isValid = false;
    }
    
    if (!makeModel) {
      newErrors.makeModel = 'Please select a make/model';
      isValid = false;
    }
    
    if (!rcImageUri) {
      newErrors.rcImage = 'RC image is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    
    if (isValid) {
      // Navigate to next screen with vehicle details
      navigation.navigate('UserDetails', {
        vehicleDetails: {
          vehicleNo,
          vehicleClass,
          makeModel,
          rcImageUri
        }
      });
    } else {
      Alert.alert('Validation Error', 'Please fill all required fields correctly.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>Vehicle Information</Text>
          <Text style={styles.subtitle}>Please provide your vehicle details</Text>
          
          {/* Vehicle Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Number<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.vehicleNo ? styles.inputError : null]}
              placeholder="Enter your vehicle number"
              value={vehicleNo}
              onChangeText={handleVehicleNoChange}
              autoCapitalize="characters"
              maxLength={10}
            />
            {errors.vehicleNo ? <Text style={styles.errorText}>{errors.vehicleNo}</Text> : null}
          </View>
          
          {/* Vehicle Class Dropdown */}
          <View style={[styles.inputGroup, { zIndex: 2000 }]}>
            <Text style={styles.label}>Vehicle Class<Text style={styles.required}>*</Text></Text>
            <DropDownPicker
              open={openVehicleClass}
              value={vehicleClass}
              items={vehicleClassItems}
              setOpen={setOpenVehicleClass}
              setValue={setVehicleClass}
              setItems={setVehicleClassItems}
              placeholder="Select vehicle class"
              style={[styles.dropdown, errors.vehicleClass ? styles.inputError : null]}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownPlaceholder}
              zIndex={2000}
            />
            {errors.vehicleClass ? <Text style={styles.errorText}>{errors.vehicleClass}</Text> : null}
          </View>
          
          {/* Make and Model Dropdown */}
          <View style={[styles.inputGroup, { zIndex: 1000 }]}>
            <Text style={styles.label}>Vehicle Make & Model<Text style={styles.required}>*</Text></Text>
            <DropDownPicker
              open={openMakeModel}
              value={makeModel}
              items={makeModelItems}
              setOpen={setOpenMakeModel}
              setValue={setMakeModel}
              setItems={setMakeModelItems}
              placeholder="Select make and model"
              style={[styles.dropdown, errors.makeModel ? styles.inputError : null]}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownPlaceholder}
              zIndex={1000}
            />
            {errors.makeModel ? <Text style={styles.errorText}>{errors.makeModel}</Text> : null}
          </View>
          
          {/* RC Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload RC<Text style={styles.required}>*</Text></Text>
            
            <TouchableOpacity 
              style={[styles.uploadContainer, errors.rcImage ? styles.inputError : null]}
              onPress={() => setShowImageOptions(true)}
            >
              {rcImageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: rcImageUri }}
                    style={styles.imagePreview}
                  />
                  <Text style={styles.changeImageText}>Tap to change</Text>
                </View>
              ) : (
                <View style={styles.uploadPrompt}>
                  <Icon name="upload" size={24} color="#666666" />
                  <Text style={styles.uploadText}>Tap to upload RC image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.rcImage ? <Text style={styles.errorText}>{errors.rcImage}</Text> : null}
          </View>
          
          <Text style={styles.infoText}>
            Please ensure that the RC details are clearly visible in the uploaded image.
          </Text>
        </Animated.View>
        
        {/* Proceed Button */}
        <TouchableOpacity 
          style={styles.proceedButton} 
          onPress={handleProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
        
        <View style={{ height: 20 }} />
      </ScrollView>
      
      {/* Image Source Selection Modal */}
      <Modal
        transparent={true}
        visible={showImageOptions}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload RC Image</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handleUploadImage('camera')}
            >
              <Icon name="camera" size={24} color="#333333" style={styles.modalIcon} />
              <Text style={styles.modalOptionText}>Take a Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => handleUploadImage('gallery')}
            >
              <Icon name="image" size={24} color="#333333" style={styles.modalIcon} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelOption]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    flex: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  required: {
    color: '#FF0000',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
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
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    minHeight: 45,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderTopWidth: 0,
  },
  dropdownPlaceholder: {
    color: '#999999',
    fontSize: 16,
  },
  uploadContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 4,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPrompt: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#666666',
    fontSize: 14,
    marginTop: 8,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: '90%',
    height: '80%',
    resizeMode: 'contain',
  },
  changeImageText: {
    color: '#333333',
    fontSize: 12,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  proceedButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalIcon: {
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  cancelOption: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  scanFrame: {
    width: 200,
    height: 100,
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 8,
    marginVertical: 20,
    alignSelf: 'center',
  }
});

export default VehicleDetailsScreen; 