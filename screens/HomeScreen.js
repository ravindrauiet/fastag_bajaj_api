import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bajaj FasTag App</Text>
      <Button title="Validate Customer" onPress={() => navigation.navigate('ValidateCustomer')} />
      <Button title="Validate OTP" onPress={() => navigation.navigate('ValidateOtp')} />
      <Button title="Create Wallet" onPress={() => navigation.navigate('CreateWallet')} />
      <Button title="Upload Document" onPress={() => navigation.navigate('DocumentUpload')} />
      <Button title="Register FasTag" onPress={() => navigation.navigate('FasTagRegistration')} />
      <Button title="Replace FasTag" onPress={() => navigation.navigate('FasTagReplacement')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;