import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

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
import EnterDetailsScreen from '../components/EnterDetailsScreen';
import VehicleDetailsScreen from '../components/VehicleDetailsScreen';
import UserDetailsScreen from '../components/UserDetailsScreen';
import OtpVerificationScreen from '../components/OtpVerificationScreen';
import AddOnsScreen from '../components/AddOnsScreen';
import ConfirmPaymentScreen from '../components/ConfirmPaymentScreen';

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
      
      {/* Add FASTag Flow Screens */}
      <Stack.Screen name="EnterDetails" component={EnterDetailsScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="AddOns" component={AddOnsScreen} />
      <Stack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} />
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

// Custom 4-dot menu icon component
const FourDotMenuIcon = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ padding: 8 }}>
    <View style={{
      width: 24,
      height: 24,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignContent: 'space-between',
    }}>
      <View style={dotStyle} />
      <View style={dotStyle} />
      <View style={dotStyle} />
      <View style={dotStyle} />
    </View>
  </TouchableOpacity>
);

// Custom notification bell component
const NotificationBell = () => (
  <TouchableOpacity style={{ padding: 8 }}>
    <View style={{
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{ fontSize: 16 }}>🔔</Text>
    </View>
  </TouchableOpacity>
);

// Custom logo component
const LogoTitle = () => (
  <Image
    style={{ height: 40, width: 160 }}
    source={{ uri: 'https://via.placeholder.com/200x50' }} // Replace with actual logo
    resizeMode="contain"
  />
);

// Custom drawer content component
const CustomDrawerContent = (props) => {
  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>TMsquare</Text>
        <Text style={styles.drawerSubtitle}>GLOBAL Solutions</Text>
      </View>
      <View style={styles.drawerItems}>
        <Text 
          style={[styles.drawerItem, props.state.index === 0 ? styles.activeDrawerItem : null]}
          onPress={() => props.navigation.navigate('Home')}
        >
          Home
        </Text>
        <Text 
          style={[styles.drawerItem, props.state.index === 1 ? styles.activeDrawerItem : null]}
          onPress={() => props.navigation.navigate('NETC')}
        >
          NETC Fastag
        </Text>
        <Text 
          style={[styles.drawerItem, props.state.index === 2 ? styles.activeDrawerItem : null]}
          onPress={() => props.navigation.navigate('Inventory')}
        >
          Fastag Inventory
        </Text>
        
        <Text style={styles.drawerSectionTitle}>Services</Text>
        
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
        screenOptions={({ navigation }) => ({
          headerShown: true,
          drawerStyle: {
            width: '70%',
          },
          // Apply custom header to all screens by default
          headerTitle: props => <LogoTitle {...props} />,
          headerLeft: () => <FourDotMenuIcon onPress={() => navigation.openDrawer()} />,
          headerRight: () => <NotificationBell />,
          headerStyle: {
            backgroundColor: '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#F0F0F0',
          },
          headerTintColor: '#333333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Drawer.Screen 
          name="Home" 
          component={HomeStack} 
        />
        <Drawer.Screen 
          name="NETC" 
          component={NETCStack} 
        />
        <Drawer.Screen 
          name="Inventory" 
          component={InventoryStack} 
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
    backgroundColor: '#333333',
    justifyContent: 'flex-end',
    padding: 16,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  drawerSubtitle: {
    color: '#00ACC1',
    fontSize: 16,
  },
  drawerItems: {
    flex: 1,
    padding: 16,
  },
  drawerSectionTitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  drawerItem: {
    fontSize: 16,
    marginVertical: 12,
    color: '#333',
  },
  activeDrawerItem: {
    color: '#000',
    fontWeight: 'bold',
  },
});

const dotStyle = {
  width: 10,
  height: 10,
  backgroundColor: '#2D3A4A',
  borderRadius: 2,
};

export default AppNavigator;