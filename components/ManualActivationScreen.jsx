import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const ManualActivationScreen = ({ route }) => {
  const [fastagId, setFastagId] = useState('');

  useEffect(() => {
    // If scanned data is passed, set it as the initial value
    if (route.params?.scannedData) {
      setFastagId(route.params.scannedData);
    }
  }, [route.params?.scannedData]);

  const handleActivate = () => {
    alert(`FASTag ID: ${fastagId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your FASTag ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter FASTag ID"
        keyboardType="numeric"
        value={fastagId}
        onChangeText={setFastagId}
      />
      <TouchableOpacity style={styles.button} onPress={handleActivate}>
        <Text style={styles.buttonText}>Activate Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ManualActivationScreen;