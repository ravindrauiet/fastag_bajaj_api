import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { validateOtp } from '../api.js';

const ValidateOtpScreen = () => {
  const [otp, setOtp] = useState('');
  const [requestId, setRequestId] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handleValidateOtp = async () => {
    try {
      const response = await validateOtp(otp, requestId, sessionId);
      alert('OTP Validated Successfully!');
    } catch (error) {
      alert('Error validating OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Validate OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="OTP"
        value={otp}
        onChangeText={setOtp}
      />
      <TextInput
        style={styles.input}
        placeholder="Request ID"
        value={requestId}
        onChangeText={setRequestId}
      />
      <TextInput
        style={styles.input}
        placeholder="Session ID"
        value={sessionId}
        onChangeText={setSessionId}
      />
      <Button title="Validate OTP" onPress={handleValidateOtp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default ValidateOtpScreen;