import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { registerFastag } from '../api.js';

const FasTagRegistrationScreen = () => {
  const [regDetails, setRegDetails] = useState({
    requestId: '',
    sessionId: '',
    // Add other necessary fields
  });

  const handleRegisterFastag = async () => {
    try {
      const response = await registerFastag(regDetails);
      alert('FasTag Registered Successfully!');
    } catch (error) {
      alert('Error registering FasTag');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FasTag Registration</Text>
      <TextInput
        style={styles.input}
        placeholder="Request ID"
        value={regDetails.requestId}
        onChangeText={(text) => setRegDetails({ ...regDetails, requestId: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Session ID"
        value={regDetails.sessionId}
        onChangeText={(text) => setRegDetails({ ...regDetails, sessionId: text })}
      />
      {/* Add more input fields as needed */}
      <Button title="Register FasTag" onPress={handleRegisterFastag} />
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

export default FasTagRegistrationScreen;