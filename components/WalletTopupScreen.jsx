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
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const WalletTopupScreen = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrImageLoaded, setQrImageLoaded] = useState(false);
  const [upiId, setUpiId] = useState('example@upi');

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
        setScreenshot(result.assets[0].uri);
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

    try {
      setIsLoading(true);

      // Upload screenshot to Firebase Storage
      const storage = getStorage();
      const fileRef = ref(storage, `topup-screenshots/${userInfo.uid}/${Date.now()}.jpg`);
      
      // Convert image URI to blob
      const response = await fetch(screenshot);
      const blob = await response.blob();
      
      // Upload the blob
      await uploadBytes(fileRef, blob);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef);

      // Add document to wallet_topups collection
      const topupData = {
        userId: userInfo.uid,
        userName: userInfo.displayName || 'User',
        amount: parseFloat(amount),
        screenshotUrl: downloadURL,
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
    backgroundColor: '#FAFAFA',
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
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  amountSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 60,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#333333',
    height: 60,
  },
  quickAmountSection: {
    marginBottom: 24,
  },
  quickAmountLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    minWidth: '18%',
    alignItems: 'center',
  },
  selectedAmountButton: {
    borderColor: '#00ACC1',
    backgroundColor: '#E0F7FA',
  },
  quickAmountText: {
    color: '#333333',
    fontWeight: '500',
  },
  selectedAmountText: {
    color: '#00ACC1',
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
    borderColor: '#EEEEEE',
  },
  instructionText: {
    fontSize: 14,
    color: '#444444',
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
    borderColor: '#EEEEEE',
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
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upiIdLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginRight: 6,
  },
  upiId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
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
    borderColor: '#DDDDDD',
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
    color: '#666666',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#00ACC1',
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
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default WalletTopupScreen; 