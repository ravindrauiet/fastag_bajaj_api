import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ValidateCustomerScreen from './screens/ValidateCustomerScreen';
import ValidateOtpScreen from './screens/ValidateOtpScreen';
import CreateWalletScreen from './screens/CreateWalletScreen';
import DocumentUploadScreen from './screens/DocumentUploadScreen';
import FasTagRegistrationScreen from './screens/FasTagRegistrationScreen';
import FasTagReplacementScreen from './screens/FasTagReplacementScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ValidateCustomer" component={ValidateCustomerScreen} />
        <Stack.Screen name="ValidateOtp" component={ValidateOtpScreen} />
        <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
        <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
        <Stack.Screen name="FasTagRegistration" component={FasTagRegistrationScreen} />
        <Stack.Screen name="FasTagReplacement" component={FasTagReplacementScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}