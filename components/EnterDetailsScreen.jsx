import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Image,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const EnterDetailsScreen = ({ navigation }) => {
  const [vehicleNo, setVehicleNo] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [frontRCImage, setFrontRCImage] = useState(null);
  const [backRCImage, setBackRCImage] = useState(null);
  
  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // Start animations when component mounts
  React.useEffect(() => {
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
  
  // Handle image upload (in a real app, this would use image picker)
  const handleImageUpload = (type) => {
    // In a real app, show options for camera or gallery
    Alert.alert(
      "Upload Image",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => takePhoto(type)
        },
        {
          text: "Choose from Gallery",
          onPress: () => chooseFromGallery(type)
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };
  
  const takePhoto = async (type) => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera permission to take photos');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const imageData = { uri: selectedAsset.uri };
        
        if (type === 'front') {
          setFrontRCImage(imageData);
        } else {
          setBackRCImage(imageData);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo: ' + error.message);
    }
  };
  
  const chooseFromGallery = async (type) => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need gallery permission to select images');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const imageData = { uri: selectedAsset.uri };
        
        if (type === 'front') {
          setFrontRCImage(imageData);
        } else {
          setBackRCImage(imageData);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image: ' + error.message);
    }
  };
  
  const handleSubmit = () => {
    // Validate inputs before proceeding
    if (vehicleNo && chassisNo && mobileNo && frontRCImage && backRCImage) {
      // Navigate to vehicle details screen with the entered data
      navigation.navigate('VehicleDetails', {
        vehicleNo,
        chassisNo,
        mobileNo,
        frontRCImage,
        backRCImage
      });
    } else {
      // Show error (in a real app, use proper error handling)
      alert('Please fill all fields and upload both RC images');
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
        <Text style={styles.headerTitle}>Enter Details</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>Please enter your details</Text>
          <Text style={styles.subtitle}>Provide the following information to proceed with FASTag activation</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter vehicle number"
                value={vehicleNo}
                onChangeText={setVehicleNo}
                autoCapitalize="characters"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chassis Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last 5 digits of chassis number"
                value={chassisNo}
                onChangeText={setChassisNo}
                maxLength={5}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 10 digit mobile number"
                value={mobileNo}
                onChangeText={setMobileNo}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            
            {/* RC Image Upload */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Upload RC Images</Text>
              
              <View style={styles.uploadContainer}>
                <View style={styles.uploadCard}>
                  <Text style={styles.uploadLabel}>Front Side RC</Text>
                  
                  {frontRCImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image 
                        source={frontRCImage} 
                        style={styles.imagePreview} 
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.changeButton}
                        onPress={() => handleImageUpload('front')}
                      >
                        <Text style={styles.changeButtonText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => handleImageUpload('front')}
                    >
                      <Text style={styles.uploadIcon}>+</Text>
                      <Text style={styles.uploadButtonText}>Upload Front RC</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.uploadCard}>
                  <Text style={styles.uploadLabel}>Back Side RC</Text>
                  
                  {backRCImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image 
                        source={backRCImage} 
                        style={styles.imagePreview} 
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.changeButton}
                        onPress={() => handleImageUpload('back')}
                      >
                        <Text style={styles.changeButtonText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => handleImageUpload('back')}
                    >
                      <Text style={styles.uploadIcon}>+</Text>
                      <Text style={styles.uploadButtonText}>Upload Back RC</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Submit</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  formContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  uploadSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadCard: {
    width: width / 2 - 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
  },
  uploadLabel: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 12,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    height: 120,
  },
  uploadIcon: {
    fontSize: 24,
    color: '#999999',
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  changeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EnterDetailsScreen; 