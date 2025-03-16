import React, { useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';

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
import VehicleKYCScreen from '../components/VehicleKYCScreen';
import VrnUpdateScreen from '../components/VrnUpdateScreen';
import FasTagRekycScreen from '../components/FasTagRekycScreen';

// Create stack navigator for the main app flow
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Home Stack
const HomeStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      screenListeners={({ navigation }) => ({
        state: (e) => {
          // You can implement screen completion tracking here
          // This would trigger when screens change in the stack
        },
      })}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
      <Stack.Screen name="ManualActivation" component={ManualActivationScreen} />
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
      <Stack.Screen name="ValidateOtp" component={ValidateOtpScreen} />
      <Stack.Screen name="ValidateCustomer" component={ValidateCustomerScreen} />
      <Stack.Screen name="FasTagRegistration" component={FasTagRegistrationScreen} />
      <Stack.Screen name="FasTagReplacement" component={FasTagReplacementScreen} />
      <Stack.Screen name="VrnUpdate" component={VrnUpdateScreen} />
      <Stack.Screen name="FasTagRekyc" component={FasTagRekycScreen} />
      
      {/* Add FASTag Flow Screens */}
      <Stack.Screen name="EnterDetails" component={EnterDetailsScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="AddOns" component={AddOnsScreen} />
      <Stack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} />
      <Stack.Screen name="VehicleKYCScreen" component={VehicleKYCScreen} />
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
      <Stack.Screen name="FasTagRekyc" component={FasTagRekycScreen} />
      <Stack.Screen name="VrnUpdate" component={VrnUpdateScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
      <Stack.Screen name="ValidateOtp" component={ValidateOtpScreen} />
      <Stack.Screen name="ValidateCustomer" component={ValidateCustomerScreen} />
      <Stack.Screen name="VehicleKYCScreen" component={VehicleKYCScreen} />
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
      <Stack.Screen name="VehicleKYCScreen" component={VehicleKYCScreen} />
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
const NotificationBell = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    getUnreadCount 
  } = useContext(NotificationContext);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = getUnreadCount();
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <View>
      <TouchableOpacity 
        style={{ padding: 8 }}
        onPress={toggleNotifications}
      >
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#F5F5F5',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 16 }}>🔔</Text>
          {unreadCount > 0 && (
            <View style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#FF0000',
              width: 16,
              height: 16,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <Modal
        transparent={true}
        visible={showNotifications}
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}
          activeOpacity={1}
          onPress={() => setShowNotifications(false)}
        >
          <View style={{
            position: 'absolute',
            top: 80,
            right: 10,
            width: 250,
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#F0F0F0',
            }}>
              <Text style={{ fontWeight: 'bold' }}>Notifications</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={{ color: '#0066CC', fontSize: 12 }}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {notifications.length > 0 ? (
              <ScrollView style={{ maxHeight: 300 }}>
                {notifications.map(notification => (
                  <TouchableOpacity 
                    key={notification.id}
                    style={{
                      padding: 12,
                      backgroundColor: notification.read ? '#FFFFFF' : '#F0F8FF',
                      borderBottomWidth: 1,
                      borderBottomColor: '#F0F0F0',
                    }}
                    onPress={() => {
                      markAsRead(notification.id);
                      // Don't close the modal when marking a notification as read
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{notification.message}</Text>
                    <Text style={{ fontSize: 12, color: '#999999', marginTop: 4 }}>{notification.time}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: '#999999' }}>No notifications</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

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
          onPress={() => props.navigation.navigate('VrnUpdate')}
        >
          VRN Update
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('FasTagRekyc')}
        >
          FasTag Re-KYC Upload
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
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('VehicleKYCScreen')}
        >
          Vehicle KYC Screen 
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