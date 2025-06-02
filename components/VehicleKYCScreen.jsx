import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Alert
} from 'react-native';
import ImageUploadComponent from './ImageUploadComponent';

const VehicleKYCScreen = ({ navigation, route }) => {
  const { fastagId } = route.params || {};
  
  const [vehicleImages, setVehicleImages] = useState({
    frontImage: null,
    closeUpImage: null,
    sideImage: null
  });

  useEffect(() => {
    // Check if a fastagId was passed
    if (!fastagId) {
      Alert.alert('Error', 'No FasTag ID provided', [
        { text: 'Go Back', onPress: () => navigation.goBack() }
      ]);
    }
  }, [fastagId, navigation]);

  const handleImageSelected = (imageType, imageData) => {
    setVehicleImages(prev => ({
      ...prev,
      [imageType]: imageData
    }));
  };

  const handleActivate = () => {
    // Check if all images are uploaded
    const allImagesUploaded = Object.values(vehicleImages).every(img => img !== null);
    
    if (!allImagesUploaded) {
      Alert.alert('Incomplete', 'Please upload all required images');
      return;
    }

    // Process the images and proceed
    console.log('Images uploaded:', vehicleImages);
    Alert.alert(
      'Success', 
      `FasTag ID ${fastagId} activated successfully!`,
      [{ text: 'OK', onPress: () => navigation.navigate('HomeScreen') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.headerText}>Complete KYV for vehicle</Text>
          
          {fastagId ? (
            <Text style={styles.fastagIdText}>FasTag ID: {fastagId}</Text>
          ) : null}
          
          <View style={styles.uploadsContainer}>
            <ImageUploadComponent 
              title="Front Image with Vehicle No & Fastag"
              imageSize="4 MB"
              onImageSelected={(data) => handleImageSelected('frontImage', data)}
            />
            
            <ImageUploadComponent 
              title="Close Up with Tag Pasted"
              imageSize="4 MB"
              onImageSelected={(data) => handleImageSelected('closeUpImage', data)}
            />
            
            <ImageUploadComponent 
              title="Side Image with Front and Back Wheel"
              imageSize="4 MB"
              onImageSelected={(data) => handleImageSelected('sideImage', data)}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.activateButton}
            onPress={handleActivate}
          >
            <Text style={styles.activateButtonText}>Activate Tag</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200EE',
    marginVertical: 16,
  },
  fastagIdText: {
    fontSize: 16,
    color: '#6200EE',
    marginBottom: 16,
    backgroundColor: '#EDE7F6',
    padding: 8,
    borderRadius: 4,
  },
  uploadsContainer: {
    marginBottom: 24,
  },
  activateButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default VehicleKYCScreen; 