import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { sendOtp } from '../api.js';

const ValidateCustomerScreen = () => {
  const [mobileNo, setMobileNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [chassisNo, setChassisNo] = useState('');

  const handleSendOtp = async () => {
    try {
      const response = await sendOtp(mobileNo, vehicleNo, chassisNo);
      alert('OTP Sent Successfully!');
    } catch (error) {
      alert('Error sending OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Validate Customer</Text>
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobileNo}
        onChangeText={setMobileNo}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Number"
        value={vehicleNo}
        onChangeText={setVehicleNo}
      />
      <TextInput
        style={styles.input}
        placeholder="Chassis Number"
        value={chassisNo}
        onChangeText={setChassisNo}
      />
      <Button title="Send OTP" onPress={handleSendOtp} />
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

export default ValidateCustomerScreen;
