import React, { useState, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, ActivityIndicator, Alert } from 'react-native';
import { NotificationContext, NotificationProvider } from '../contexts/NotificationContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

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
import ProfileScreen from '../components/ProfileScreen';
import WalletScreen from '../components/WalletScreen';
import WalletRechargeScreen from '../components/WalletRechargeScreen';
import PaymentGatewayScreen from '../components/PaymentGatewayScreen';
import PaymentSuccessScreen from '../components/PaymentSuccessScreen';
import PaymentFailureScreen from '../components/PaymentFailureScreen';
import TransactionHistoryScreen from '../components/TransactionHistoryScreen';
import TransactionDetailScreen from '../components/TransactionDetailScreen';
import BankAccountLinkScreen from '../components/BankAccountLinkScreen';

// Import Authentication Screens
import LoginScreen from '../components/LoginScreen';
import SignUpScreen from '../components/SignUpScreen';
import ForgotPasswordScreen from '../components/ForgotPasswordScreen';

// Create stack navigator for the main app flow
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const AuthStack = createStackNavigator();

// Authentication Stack Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

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

// Wallet Stack
const WalletStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletMain" component={WalletScreen} />
      <Stack.Screen name="WalletRecharge" component={WalletRechargeScreen} />
      <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="PaymentFailure" component={PaymentFailureScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="BankAccountLink" component={BankAccountLinkScreen} />
    </Stack.Navigator>
  );
};

// Custom hamburger menu icon component
const FourDotMenuIcon = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.hamburgerButton}>
    <View style={styles.hamburgerContainer}>
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
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
  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
    <Image
      style={{ height: 50, width: 180 }}
      source={require('../assets/tm_square_logo.jpeg')}
      resizeMode="contain"
    />
  </View>
);

// Custom drawer content component
const CustomDrawerContent = (props) => {
  const { logout } = useAuth();
  
  const renderMenuItem = (label, iconName, screenName, isMain = false) => {
    const isActive = props.state.routes[props.state.index].name === screenName;
    
    return (
      <TouchableOpacity
        style={[
          styles.drawerMenuItem,
          isActive && styles.activeDrawerMenuItem
        ]}
        onPress={() => props.navigation.navigate(screenName)}
      >
        <View style={styles.menuIconContainer}>
          <Text style={[styles.menuIcon, isActive && styles.activeMenuIcon]}>
            {iconName}
          </Text>
        </View>
        <Text style={[
          styles.drawerMenuItemText,
          isActive && styles.activeDrawerMenuItemText,
          isMain && styles.mainMenuItemText
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await logout();
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.drawerContainer}>
      {/* User Profile Section */}
      <View style={styles.drawerHeader}>
        <View style={styles.userAvatarContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>IC</Text>
          </View>
        </View>
        <Text style={styles.userName}>Ishita Chitkara</Text>
        <Text style={styles.userEmail}>ishita.chitkara@example.com</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.drawerMenuContainer}>
        <View style={styles.drawerSection}>
          <Text style={styles.drawerSectionTitle}>MAIN</Text>
          {renderMenuItem('Home', '🏠', 'Home', true)}
          {renderMenuItem('NETC Fastag', '🔄', 'NETC', true)}
          {renderMenuItem('Fastag Inventory', '📦', 'Inventory', true)}
        </View>
        
        <View style={styles.drawerDivider} />
        
        <View style={styles.drawerSection}>
          <Text style={styles.drawerSectionTitle}>SERVICES</Text>
          {renderMenuItem('Barcode Scanner', '📷', 'BarcodeScanner')}
          {renderMenuItem('Manual Activation', '🔧', 'ManualActivation')}
          {renderMenuItem('Create Wallet', '💳', 'CreateWallet')}
          {renderMenuItem('Document Upload', '📄', 'DocumentUpload')}
          {renderMenuItem('FasTag Registration', '📝', 'FasTagRegistration')}
          {renderMenuItem('FasTag Replacement', '🔄', 'FasTagReplacement')}
          {renderMenuItem('VRN Update', '🚗', 'VrnUpdate')}
          {renderMenuItem('FasTag Re-KYC', '🔐', 'FasTagRekyc')}
          {renderMenuItem('OTP Verification', '📱', 'ValidateOtp')}
          {renderMenuItem('Validate Customer', '👤', 'ValidateCustomer')}
          {renderMenuItem('Vehicle KYC Screen', '🚘', 'VehicleKYCScreen')}
        </View>
        
        <View style={styles.drawerDivider} />
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonIcon}>🚪</Text>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Main Application Stack
const AppStack = ({ navigation }) => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerShown: true,
        drawerStyle: {
          width: '80%',
          backgroundColor: '#FFFFFF',
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 2,
            height: 0,
          },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 16,
          paddingVertical: 10,
        },
        // Apply custom header to all screens by default
        headerTitle: props => <LogoTitle {...props} />,
        headerLeft: () => <FourDotMenuIcon onPress={() => navigation.openDrawer()} />,
        headerRight: () => <NotificationBell />,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 2,
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 2,
          borderBottomWidth: 0,
        },
        headerTintColor: '#333333',
        headerTitleStyle: {
          fontWeight: 'bold',
          textAlign: 'center',
          alignSelf: 'center',
          flex: 1,
        },
        headerTitleAlign: 'center',
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
        name="Wallet" 
        component={WalletStack} 
        options={{
          title: 'My Wallet',
          headerTitle: 'My Wallet'
        }}
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
      
      <Drawer.Screen 
        name="ProfileScreen" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          headerTitle: 'Profile'
        }}
      />
    </Drawer.Navigator>
  );
};

// Main Navigator that handles authentication state
const MainNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    // Show a loading screen while checking authentication state
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#333333" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#333333' }}>Loading...</Text>
      </View>
    );
  }
  
  // Render either the main app or authentication flow based on auth state
  return isAuthenticated ? <AppStack /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    height: 180,
    backgroundColor: '#333333',
    justifyContent: 'center',
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
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
    fontSize: 12,
    color: '#777',
    marginTop: 25,
    marginBottom: 15,
    paddingHorizontal: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
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
  drawerHeader: {
    height: 180,
    backgroundColor: '#333333',
    justifyContent: 'center',
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  userAvatarContainer: {
    marginBottom: 15,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  drawerMenuContainer: {
    flex: 1,
    paddingTop: 5,
  },
  drawerSection: {
    paddingHorizontal: 5,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 2,
    borderRadius: 10,
  },
  activeDrawerMenuItem: {
    backgroundColor: '#f5f5f5',
  },
  drawerMenuItemText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#444',
  },
  activeDrawerMenuItemText: {
    fontWeight: '600',
    color: '#333',
  },
  mainMenuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  menuIcon: {
    fontSize: 18,
  },
  activeMenuIcon: {
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
  },
  logoutButtonIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#FF3B30',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FF3B30',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  hamburgerButton: {
    padding: 12,
  },
  hamburgerContainer: {
    width: 22,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
  },
});

// Main App Navigator
const AppNavigator = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AppNavigator;