import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
// Temporarily commenting out barcode scanner imports to avoid native module error
// import { Camera } from 'expo-camera';
// import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BarcodeScannerScreen = ({ navigation }) => {
  // Simplified component without barcode scanning functionality
  const [loading, setLoading] = useState(false);
  
  // Replace entire component with a temporary UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.errorContainer}>
        <Icon name="barcode-scan" size={60} color="#A52A2A" />
        <Text style={styles.errorTitle}>Barcode Scanner Temporarily Unavailable</Text>
        <Text style={styles.errorMessage}>
          The barcode scanner functionality has been temporarily disabled due to a native module issue.
          Please use the manual entry option instead.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('ManualActivation')}
        >
          <Text style={styles.buttonText}>Enter Code Manually</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, {marginTop: 12, backgroundColor: '#555555'}]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  permissionText: {
    fontSize: 16,
    marginTop: 16,
    color: '#555555',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333333',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#A52A2A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default BarcodeScannerScreen;
