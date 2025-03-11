import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';

// Import all screens
import HomeScreen from '../components/HomeScreen';
import BarcodeScannerScreen from '../components/BarcodeScannerScreen';
import ManualActivationScreen from '../components/ManualActivationScreen';
import NETCFastagScreen from '../components/NETCFastagScreen';
import FastagInventoryScreen from '../components/FastagInventoryScreen';
import CreateWalletScreen from '../components/CreateWalletScreen';
import DocumentUploadScreen from '../components/DocumentUploadScreen';
import FasTagRegistrationScreen from '../components/FasTagRegistrationScreen';
import FasTagReplacementScreen from '../components/FasTagReplacementScreen';
import ValidateOtpScreen from '../components/ValidateOtpScreen';
import ValidateCustomerScreen from '../components/ValidateCustomerScreen';

// Create stack navigator for the main app flow
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Home Stack
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
      <Stack.Screen name="ManualActivation" component={ManualActivationScreen} />
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
      <Stack.Screen name="ValidateOtp" component={ValidateOtpScreen} />
      <Stack.Screen name="ValidateCustomer" component={ValidateCustomerScreen} />
    </Stack.Navigator>
  );
};

// NETC Fastag Stack
const NETCStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NETCMain" component={NETCFastagScreen} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
      <Stack.Screen name="ManualActivation" component={ManualActivationScreen} />
      <Stack.Screen name="FasTagRegistration" component={FasTagRegistrationScreen} />
      <Stack.Screen name="FasTagReplacement" component={FasTagReplacementScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
      <Stack.Screen name="ValidateOtp" component={ValidateOtpScreen} />
      <Stack.Screen name="ValidateCustomer" component={ValidateCustomerScreen} />
    </Stack.Navigator>
  );
};

// Inventory Stack
const InventoryStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InventoryMain" component={FastagInventoryScreen} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
      <Stack.Screen name="ManualActivation" component={ManualActivationScreen} />
      <Stack.Screen name="FasTagReplacement" component={FasTagReplacementScreen} />
      <Stack.Screen name="FasTagRegistration" component={FasTagRegistrationScreen} />
    </Stack.Navigator>
  );
};

// Custom drawer content component
const CustomDrawerContent = (props) => {
  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>FASTag App</Text>
      </View>
      <View style={styles.drawerItems}>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Home')}
        >
          Home
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('NETC')}
        >
          NETC Fastag
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('Inventory')}
        >
          Fastag Inventory
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('BarcodeScanner')}
        >
          Barcode Scanner
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('ManualActivation')}
        >
          Manual Activation
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('CreateWallet')}
        >
          Create Wallet
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('DocumentUpload')}
        >
          Document Upload
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('FasTagRegistration')}
        >
          FasTag Registration
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('FasTagReplacement')}
        >
          FasTag Replacement
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('ValidateOtp')}
        >
          Validate OTP
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('ValidateCustomer')}
        >
          Validate Customer
        </Text>
      </View>
    </View>
  );
};

// Main drawer navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          drawerStyle: {
            width: '70%',
          },
        }}
      >
        <Drawer.Screen 
          name="Home" 
          component={HomeStack} 
          options={{ 
            title: 'Home',
            headerTitle: 'FASTag',
          }} 
        />
        <Drawer.Screen 
          name="NETC" 
          component={NETCStack} 
          options={{ title: 'NETC Fastag' }} 
        />
        <Drawer.Screen 
          name="Inventory" 
          component={InventoryStack} 
          options={{ title: 'Fastag Inventory' }} 
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    height: 150,
    backgroundColor: '#007AFF',
    justifyContent: 'flex-end',
    padding: 16,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  drawerItems: {
    flex: 1,
    padding: 16,
  },
  drawerItem: {
    fontSize: 18,
    marginVertical: 12,
    color: '#333',
  },
});

export default AppNavigator;