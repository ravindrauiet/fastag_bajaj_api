import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { createWallet } from '../api.js';

const CreateWalletScreen = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [dob, setDob] = useState('');

  const handleCreateWallet = async () => {
    try {
      const response = await createWallet({ name, lastName, mobileNo, dob });
      alert('Wallet Created Successfully!');
    } catch (error) {
      alert('Error creating wallet');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Wallet</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobileNo}
        onChangeText={setMobileNo}
      />
      <TextInput
        style={styles.input}
        placeholder="Date of Birth (DD-MM-YYYY)"
        value={dob}
        onChangeText={setDob}
      />
      <Button title="Create Wallet" onPress={handleCreateWallet} />
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

export default CreateWalletScreen;