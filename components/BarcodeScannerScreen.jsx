import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const BarcodeScannerScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barcode Scanner</Text>
      <Text style={styles.subtitle}>Camera functionality temporarily disabled for testing</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('ManualActivation')}
      >
        <Text style={styles.buttonText}>Enter Code Manually</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BarcodeScannerScreen;
