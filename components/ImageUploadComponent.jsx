import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ImageUploadComponent = ({ 
  title, 
  description = '',
  imageSize = "4 MB",
  onImageSelected,
  style = {} 
}) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const openImagePicker = () => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => pickImageFromCamera()
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickImageFromGallery()
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const pickImageFromCamera = async () => {
    try {
      setLoading(true);
      
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera permission to take photos');
        setLoading(false);
        return;
      }

      // Launch camera with reduced quality and no editing
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: false, // Set to false to prevent editing issues
        quality: 0.5, // Reduce quality to avoid memory issues
        base64: false, // Set to false initially
      });

      // Handle the result safely
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setImage(selectedAsset.uri);
        
        // Get base64 in a separate step if needed
        if (onImageSelected) {
          onImageSelected({
            uri: selectedAsset.uri,
            type: 'image/jpeg',
            name: 'image.jpg'
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.log('Camera error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      setLoading(true);
      
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera roll permission to upload images');
        setLoading(false);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      processImageResult(result);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const processImageResult = (result) => {
    setLoading(false);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setImage(selectedAsset.uri);
      
      // Pass image data to parent component
      if (onImageSelected) {
        onImageSelected({
          uri: selectedAsset.uri,
          base64: selectedAsset.base64,
          type: selectedAsset.type || 'image/jpeg',
          name: selectedAsset.fileName || 'image.jpg'
        });
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={openImagePicker}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>Supported format: JPEG   Size limit: {imageSize}</Text> : null}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#999" style={styles.imageIcon} />
      ) : image ? (
        <Image source={{ uri: image }} style={styles.previewImage} />
      ) : (
        <View style={styles.imageIcon}>
          <Text style={styles.uploadIconText}>↑</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200EE',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#6200EE',
  },
  imageIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconText: {
    fontSize: 20,
    color: '#6200EE',
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  }
});

export default ImageUploadComponent; 