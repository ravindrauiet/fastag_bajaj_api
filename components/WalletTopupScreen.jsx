import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

// Base64 encoded QR code placeholder
const qrCodeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAMAAAC8EZcfAAAABlBMVEX///8AAABVwtN+AAAB7ElEQVR4nO2Z4Y6DMAxDSd7/pXeM7WgvlKP9cZO2fEIIErux03L9+jKZTCaTyWQymUwmk8n0b7q+ZZf08fPiDsBHDtfXCzjXOwDzBJ/5XiH4zOe5WdAv1wu4CgKPfALCpzwXiwG7gf7Oa37FeIcBa/UQ+JSn6L0xd+YD/J3gR47Xg/GDscCDMz3hQ5g7U3g++l5WsMfnsSNGwCf//PkwVhIkvJl8CCWEPuF2+TjubwlcE6xYLO90vkJwlw+rLCFgTdAScKdYPZ9Cz3eyHR9niYA5YFgDqm8CsAKM+Lg3vJQPoqNvmeDK/GEC3DtZ9/LFJMsKNYQdoV/vWm8HuEpAzFN/3Q6EJ/Ox2vLyxUqLgPa0z5MQNflynQzj/JCAPuHKh4S9nY4POhT0fNhKZIDfXMHfCW7yIfjLx/mNwJXPg7cShJ1uV9DzhdUFwSMfArZ8bHE9wCsJogFaCmIJXaRLPo+Gd3xrPsjnZDjCuxE+S3C9hOwNaPr4gkrQZ5kDdOsE2wvNtvJ2BiTVINaevF3CSoiA8V3WVKkj9BOE1WTfnGfyeUBOsB6D2AhxTfSIbQc7/JfxdkRcFT2iJwjr0Y7wBYOXfBnhax/nzzP5WP+YT1Pxho/1Rt9r1/dkMplMJpPJZDKZTCaTybTVL2i3KgtqZW4gAAAAAElFTkSuQmCC';

const WalletTopupScreen = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrImageLoaded, setQrImageLoaded] = useState(false);
  const [upiId, setUpiId] = useState('tarun1360@ybl');
  const [utrNumber, setUtrNumber] = useState('');

  // Predefined amounts for quick selection
  const quickAmounts = [100, 200, 500, 1000, 2000];

  // Helper to pick image from gallery
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your photo library to upload screenshots.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setScreenshot(imageUri);
        
        // Extract filename from the URI
        const filename = imageUri.split('/').pop() || `screenshot_${Date.now()}.jpg`;
        setScreenshotName(filename);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Submit the topup request
  const submitTopupRequest = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!screenshot) {
      Alert.alert('Screenshot Required', 'Please upload a payment screenshot');
      return;
    }

    if (!utrNumber.trim()) {
      Alert.alert('UTR Required', 'Please enter your UTR number');
      return;
    }

    try {
      setIsLoading(true);

      // Add document to wallet_topups collection
      const topupData = {
        userId: userInfo.uid,
        userName: userInfo.displayName || 'User',
        amount: parseFloat(amount),
        screenshotName: screenshotName,
        utrNumber: utrNumber.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'wallet_topups'), topupData);

      // Show success message
      Alert.alert(
        'Request Submitted',
        'Your wallet top-up request has been submitted and is pending admin approval.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting topup request:', error);
      Alert.alert('Error', 'Failed to submit your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set a predefined amount
  const selectAmount = (value) => {
    setAmount(value.toString());
  };

  useEffect(() => {
    // Fetch UPI ID from Firestore settings collection
    const fetchUpiDetails = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'payment');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists() && settingsSnap.data().upiId) {
          setUpiId(settingsSnap.data().upiId);
        }
      } catch (error) {
        console.error('Error fetching UPI details:', error);
      }
    };

    fetchUpiDetails();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Wallet Top-up</Text>
            <Text style={styles.subtitle}>Add money to your wallet</Text>
          </View>

          {/* Amount Input Section */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Enter Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Quick Amount Selection */}
          <View style={styles.quickAmountSection}>
            <Text style={styles.quickAmountLabel}>Quick Select:</Text>
            <View style={styles.quickAmountContainer}>
              {quickAmounts.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.quickAmountButton,
                    amount === value.toString() && styles.selectedAmountButton
                  ]}
                  onPress={() => selectAmount(value)}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      amount === value.toString() && styles.selectedAmountText
                    ]}
                  >
                    ₹{value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Instructions */}
          <View style={styles.paymentInstructionSection}>
            <Text style={styles.sectionTitle}>Payment Instructions</Text>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionText}>
                1. Scan the QR code or use UPI ID below
              </Text>
              <Text style={styles.instructionText}>
                2. Complete the payment for the amount entered
              </Text>
              <Text style={styles.instructionText}>
                3. Take a screenshot of your payment confirmation
              </Text>
              <Text style={styles.instructionText}>
                4. Upload the screenshot below
              </Text>
              <Text style={styles.instructionText}>
                5. Submit your top-up request
              </Text>
            </View>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <View style={styles.qrContainer}>
              {!qrImageLoaded && <ActivityIndicator style={styles.qrLoader} />}
              <Image
                source={require('../assets/qr-code-placeholder.png')}
                style={styles.qrImage}
                onLoad={() => setQrImageLoaded(true)}
              />
            </View>
            <View style={styles.upiIdContainer}>
              <Text style={styles.upiIdLabel}>UPI ID:</Text>
              <Text style={styles.upiId}>{upiId}</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => {
                  // Copy to clipboard functionality would go here
                  Alert.alert('Copied', 'UPI ID copied to clipboard');
                }}
              >
                <FeatherIcon name="copy" size={16} color="#00ACC1" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Screenshot Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Upload Payment Screenshot</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
            >
              {screenshot ? (
                <Image source={{ uri: screenshot }} style={styles.previewImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Icon name="image-plus" size={32} color="#00ACC1" />
                  <Text style={styles.uploadText}>Tap to select screenshot</Text>
                </View>
              )}
            </TouchableOpacity>
            {screenshot && (
              <Text style={styles.fileNameText}>Selected: {screenshotName}</Text>
            )}
          </View>

          {/* UTR Number Input */}
          <View style={styles.utrSection}>
            <Text style={styles.sectionTitle}>UTR Number</Text>
            <TextInput
              style={styles.utrInput}
              value={utrNumber}
              onChangeText={setUtrNumber}
              placeholder="Enter UTR number"
              placeholderTextColor="#999"
              keyboardType="default"
              autoCapitalize="characters"
            />
            <Text style={styles.utrHelpText}>
              Enter the UTR number from your payment confirmation
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!amount || !screenshot || isLoading) && styles.disabledButton
            ]}
            onPress={submitTopupRequest}
            disabled={!amount || !screenshot || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Top-up Request</Text>
            )}
          </TouchableOpacity>

          {/* Additional Information */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Your request will be processed within 24 hours. Once approved, the amount will be added to your wallet.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  subtitle: {
    fontSize: 16,
    color: '#6200EE',
    marginTop: 4,
  },
  amountSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200EE',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 60,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#6200EE',
    height: 60,
  },
  quickAmountSection: {
    marginBottom: 24,
  },
  quickAmountLabel: {
    fontSize: 14,
    color: '#6200EE',
    marginBottom: 8,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    minWidth: '18%',
    alignItems: 'center',
  },
  selectedAmountButton: {
    borderColor: '#6200EE',
    backgroundColor: '#EDE7F6',
  },
  quickAmountText: {
    color: '#6200EE',
    fontWeight: '500',
  },
  selectedAmountText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  paymentInstructionSection: {
    marginBottom: 24,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  instructionText: {
    fontSize: 14,
    color: '#6200EE',
    marginBottom: 8,
    lineHeight: 20,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    marginBottom: 12,
  },
  qrLoader: {
    position: 'absolute',
  },
  qrImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  upiIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE7F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upiIdLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6200EE',
    marginRight: 6,
  },
  upiId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    height: 160,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6200EE',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fileNameText: {
    fontSize: 12,
    color: '#6200EE',
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoText: {
    fontSize: 13,
    color: '#6200EE',
    textAlign: 'center',
    lineHeight: 18,
  },
  utrSection: {
    marginBottom: 24,
  },
  utrInput: {
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 50,
    fontSize: 16,
    color: '#6200EE',
  },
  utrHelpText: {
    fontSize: 12,
    color: '#6200EE',
    marginTop: 4,
  },
});

export default WalletTopupScreen; 