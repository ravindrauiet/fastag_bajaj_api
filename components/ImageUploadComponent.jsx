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

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      processImageResult(result);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to take photo: ' + error.message);
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#999999',
  },
  imageIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconText: {
    fontSize: 20,
    color: '#999999',
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  }
});

export default ImageUploadComponent; 