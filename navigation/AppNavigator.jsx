import React, { useState, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { NotificationContext, NotificationProvider } from '../contexts/NotificationContext';

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
import VrnUpdateDocScreen from '../components/VrnUpdateDocScreen';

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
      <Stack.Screen name="VrnUpdateDoc" component={VrnUpdateDocScreen} />
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

// Notification Bell component with dropdown
const NotificationBell = () => {
  const { notifications, markAsRead, clearNotification } = React.useContext(NotificationContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Calculate unread notifications
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handleNotificationPress = (id) => {
    markAsRead(id);
  };
  
  return (
    <View style={styles.bellContainer}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.bellButton}>
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <Modal
        transparent={true}
        visible={showDropdown}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.notificationPanel}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>Notifications</Text>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={() => {
                notifications.forEach(n => markAsRead(n.id));
                setShowDropdown(false);
              }}>
                <Text style={styles.markAllRead}>Mark all as read</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {notifications.length === 0 ? (
            <View style={styles.emptyNotifications}>
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          ) : (
            <View style={styles.notificationList}>
              {notifications.map(notification => (
                <TouchableOpacity 
                  key={notification.id} 
                  style={[
                    styles.notificationItem,
                    !notification.read ? styles.unreadNotification : null
                  ]}
                  onPress={() => handleNotificationPress(notification.id)}
                >
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                  >
                    <Text style={styles.deleteIcon}>×</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
          FasTag Re-KYC
        </Text>
        <Text 
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('ValidateOtp')}
        >
          OTP Verification
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
    <NotificationProvider>
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
          <Drawer.Screen 
            name="VrnUpdate" 
            component={VrnUpdateScreen} 
            options={{
              title: 'VRN Update',
              headerTitle: 'VRN Update'
            }}
          />
          <Drawer.Screen 
            name="FasTagRekyc" 
            component={FasTagRekycScreen} 
            options={{
              title: 'FasTag Re-KYC',
              headerTitle: 'FasTag Re-KYC'
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </NotificationProvider>
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
  bellContainer: {
    marginRight: 15,
  },
  bellButton: {
    padding: 5,
  },
  bellIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  notificationPanel: {
    position: 'absolute',
    top: 80,
    right: 10,
    width: 300,
    maxHeight: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  markAllRead: {
    color: '#007AFF',
    fontSize: 12,
  },
  emptyNotifications: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  notificationList: {
    maxHeight: 300,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteIcon: {
    fontSize: 18,
    color: '#999',
  },
});

const dotStyle = {
  width: 10,
  height: 10,
  backgroundColor: '#2D3A4A',
  borderRadius: 2,
};

export default AppNavigator;