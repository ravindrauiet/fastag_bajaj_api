import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import bajajApi from '../api/bajajApi';

const SendOTP = ({ navigation }) => {
  const [mobileNo, setMobileNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!mobileNo || mobileNo.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    if (!vehicleNo) {
      Alert.alert('Error', 'Please enter vehicle number');
      return;
    }

    if (!engineNo) {
      Alert.alert('Error', 'Please enter the last 5 digits of engine number');
      return;
    }

    setLoading(true);
    try {
      // Make the sendOtp API call
      const response = await bajajApi.sendOtp(mobileNo, vehicleNo, "", engineNo);
      
      console.log('Send OTP Response:', JSON.stringify(response, null, 2));
      
      // Check if response is successful and has the required data
      if (response.response.code === '00' && response.response.status === 'success') {
        // Verify the response has the required fields
        const requestId = response.validateCustResp?.requestId;
        const sessionId = response.validateCustResp?.sessionId;
        
        console.log('SendOTP success: extracted requestId:', requestId);
        console.log('SendOTP success: extracted sessionId:', sessionId);
        
        if (!requestId || !sessionId) {
          Alert.alert('Error', 'Missing required data from the server. Please try again.');
          return;
        }

        // Pass the entire response to the OTP verification screen
        navigation.navigate('OTPVerification', {
          mobileNo,
          responseData: response
        });
      } else {
        Alert.alert('Error', response.response.msg || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FasTag Registration</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        maxLength={10}
        value={mobileNo}
        onChangeText={setMobileNo}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Vehicle Number (e.g. MH12TK1078)"
        autoCapitalize="characters"
        value={vehicleNo}
        onChangeText={setVehicleNo}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Last 5 digits of Engine Number"
        maxLength={5}
        value={engineNo}
        onChangeText={setEngineNo}
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
      </TouchableOpacity>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SendOTP; 