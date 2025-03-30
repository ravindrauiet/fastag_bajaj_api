import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import bajajApi from '../api/bajajApi';

const OTPVerification = ({ route, navigation }) => {
  // Extract the values received from the Send OTP response
  const { mobileNo, responseData } = route.params;
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  // FIXED: Extract the correct requestId and sessionId from the sendOtp response
  // Based on the API response structure from logs
  const requestId = responseData?.validateCustResp?.requestId; 
  const sessionId = responseData?.validateCustResp?.sessionId;

  useEffect(() => {
    console.log('OTP Verification Component loaded with:');
    console.log('Mobile Number:', mobileNo);
    console.log('RequestId:', requestId);
    console.log('SessionId:', sessionId);
  }, []);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    if (!requestId || !sessionId) {
      Alert.alert('Error', 'Missing requestId or sessionId from previous request');
      return;
    }

    setLoading(true);
    try {
      // Pass the parameters in the correct order:
      // 1. The actual OTP entered by user (e.g., "123456") - NOT requestId
      // 2. The requestId from sendOtp response 
      // 3. The sessionId from sendOtp response
      const response = await bajajApi.validateOtp(otp, requestId, sessionId);
      
      console.log('Verify OTP Response:', response);
      
      if (response.response.code === '00' && response.response.status === 'success') {
        Alert.alert('Success', 'OTP verification successful');
        navigation.navigate('VehicleDetails', { verificationData: response });
      } else {
        Alert.alert('Error', response.response.msg || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      Alert.alert('Error', error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to {mobileNo}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
      </TouchableOpacity>
      
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>requestId: {requestId}</Text>
        <Text style={styles.debugText}>sessionId: {sessionId}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 20,
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#555',
  }
});

export default OTPVerification; 