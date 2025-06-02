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
import WalletTopupScreen from '../components/WalletTopupScreen';
import PaymentGatewayScreen from '../components/PaymentGatewayScreen';
import TransactionHistoryScreen from '../components/TransactionHistoryScreen';
import TransactionDetailScreen from '../components/TransactionDetailScreen';
import BankAccountLinkScreen from '../components/BankAccountLinkScreen';
import FeedbackForm from '../components/FeedbackForm';
import AdminDashboard from '../components/AdminDashboard';
import FormSubmissionsScreen from '../components/admin/FormSubmissionsScreen';
import FormSubmissionDetailScreen from '../components/admin/FormSubmissionDetailScreen';
import AllUsersScreen from '../components/admin/AllUsersScreen';
import ServicesScreen from '../components/ServicesScreen';
import UserDetailScreen from '../components/admin/UserDetailScreen';
import FormDetailScreen from '../components/admin/FormDetailScreen';
import AllocatedFasTagsScreen from '../components/AllocatedFasTagsScreen';
// Import Support Screens
import ContactSupportScreen from '../components/ContactSupportScreen';
import FAQScreen from '../components/FAQScreen';
import TermsConditionsScreen from '../components/TermsConditionsScreen';

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
      <Stack.Screen name="FeedbackForm" component={FeedbackForm} />
      <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
      <Stack.Screen name="AllocatedFasTags" component={AllocatedFasTagsScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
      
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
      <Stack.Screen name="AllocatedFasTags" component={AllocatedFasTagsScreen} />
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
      <Stack.Screen name="AllocatedFasTags" component={AllocatedFasTagsScreen} />
    </Stack.Navigator>
  );
};

// Wallet Stack
const WalletStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletMain" component={WalletScreen} />
      <Stack.Screen name="WalletRecharge" component={WalletRechargeScreen} />
      <Stack.Screen name="WalletTopup" component={WalletTopupScreen} />
      <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} />
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
      {/* <TouchableOpacity onPress={toggleDropdown} style={styles.bellButton}>
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity> */}
      
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
              {notifications.map((notification, index) => (
                <TouchableOpacity 
                  key={notification.id || index} 
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
                    key={`delete-${notification.id || index}`}
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
  <View style={styles.logoTitleContainer}>
    <Image
      style={styles.logoTitleImage}
      source={require('../assets/icons/tm_square_png-removebg-preview.png')}
      resizeMode="contain"
    />
  </View>
);

// Custom drawer content component
const CustomDrawerContent = (props) => {
  const { logout, userProfile, isAdmin } = useAuth();
  
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
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/icons/tm_square_png-removebg-preview.png')}
            style={styles.drawerLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>FasTag Admin Portal</Text>
        <Text style={styles.userEmail}>Powered by Maydiv Infotech</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.drawerMenuContainer}>
        <View style={styles.drawerSection}>
          <Text style={styles.drawerSectionTitle}>MAIN</Text>
          {renderMenuItem('Home', '🏠', 'Home', true)}
          {renderMenuItem('NETC Fastag', '🔄', 'NETC', true)}
          {renderMenuItem('User Inventory', '📦', 'Inventory', true)}
        </View>
        
        <View style={styles.drawerDivider} />
        
        <View style={styles.drawerSection}>
          <Text style={styles.drawerSectionTitle}>SERVICES</Text>
          {/* {renderMenuItem('Barcode Scanner', '📷', 'BarcodeScanner')} */}
          {/* {renderMenuItem('Manual Activation', '🔧', 'ManualActivation')} */}
          {/* {renderMenuItem('Create Wallet', '💳', 'CreateWallet')} */}
          {/* {renderMenuItem('Document Upload', '📄', 'DocumentUpload')} */}
          {/* {renderMenuItem('FasTag Registration', '📝', 'FasTagRegistration')} */}
          {/* {renderMenuItem('FasTag Replacement', '🔄', 'FasTagReplacement')} */}
          {renderMenuItem('VRN Update', '🚗', 'VrnUpdate')}
          {renderMenuItem('FasTag Re-KYC', '🔐', 'FasTagRekyc')}
          {/* {renderMenuItem('OTP Verification', '📱', 'ValidateOtp')} */}
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
          shadowColor: '#6200EE',
          shadowOffset: {
            width: 2,
            height: 0,
          },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 16,
          paddingVertical: 10,
        },
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
          height: 60,
        },
        headerTintColor: '#6200EE',
        headerTitleStyle: {
          fontWeight: 'bold',
          textAlign: 'center',
          alignSelf: 'center',
          flex: 1,
          marginLeft: -40,
        },
        headerTitleAlign: 'center',
      })}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeStack} 
        options={{
          headerTitle: (props) => <LogoTitle {...props} />,
          headerRight: () => (
            <View style={styles.headerRight}>
              <NotificationBell />
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="NETC" 
        component={NETCStack} 
        options={{ headerTitle: 'NETC FasTag' }}
      />
      <Drawer.Screen 
        name="Inventory" 
        component={InventoryStack} 
        options={{ headerTitle: 'FasTag Inventory' }}
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
      <Drawer.Screen
        name="ServicesScreen"
        component={ServicesScreen}
        options={{ headerTitle: 'All Services' }}
      />
      <Drawer.Screen
        name="ContactSupport"
        component={ContactSupportScreen}
        options={{ headerTitle: 'Contact Support' }}
      />
      <Drawer.Screen
        name="FAQ"
        component={FAQScreen}
        options={{ headerTitle: 'FAQ' }}
      />
      <Drawer.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
        options={{ headerTitle: 'Terms & Conditions' }}
      />
    </Drawer.Navigator>
  );
};

// Main Navigator that handles authentication flow
const MainNavigator = () => {
  const { isAuthenticated, isAdmin, isLoading, userInfo } = useAuth();
  
  console.log('MainNavigator state:', { 
    isAuthenticated, 
    isAdmin, 
    isLoading,
    email: userInfo?.email 
  });
  
  if (isLoading) {
    // Show loading screen while checking authentication
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333333" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // Special case: admin user - should always go to admin dashboard
  const isAdminEmail = userInfo?.email === 'admin@gmail.com';
  
  // Force admin nav if email is admin@gmail.com, even if isAdmin flag isn't set yet
  const showAdminDashboard = isAuthenticated && (isAdmin || isAdminEmail);
  
  console.log('Navigation decision:', { 
    showAdminDashboard, 
    isAuthenticated, 
    isAdmin, 
    isAdminEmail 
  });
  
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        showAdminDashboard ? (
          // Admin is authenticated, show admin dashboard
          <Stack.Navigator>
            <Stack.Screen 
              name="AdminDashboard" 
              component={AdminDashboard}
              options={{
                headerShown: false // Use the custom header in AdminDashboard
              }}
            />
            <Stack.Screen 
              name="ProfileScreen" 
              component={ProfileScreen}
              options={{
                headerTitle: 'Profile',
                headerStyle: {
                  backgroundColor: '#333333',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen 
              name="ContactSupport" 
              component={ContactSupportScreen}
              options={{
                headerTitle: 'Contact Support',
                headerStyle: {
                  backgroundColor: '#333333',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen 
              name="FAQ" 
              component={FAQScreen}
              options={{
                headerTitle: 'FAQ',
                headerStyle: {
                  backgroundColor: '#333333',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen 
              name="TermsConditions" 
              component={TermsConditionsScreen}
              options={{
                headerTitle: 'Terms & Conditions',
                headerStyle: {
                  backgroundColor: '#333333',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="FormSubmissionsScreen"
              component={FormSubmissionsScreen}
              options={{
                headerTitle: 'Form Submissions',
                headerStyle: {
                  backgroundColor: '#333333',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="AllUsersScreen"
              component={AllUsersScreen}
              options={{
                headerTitle: 'All Users',
                headerStyle: {
                  backgroundColor: '#333333',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen
              name="ServicesScreen"
              component={ServicesScreen}
              options={{
                headerTitle: 'All Services',
                headerStyle: {
                  backgroundColor: '#333333',
                },
                headerTintColor: '#fff',
              }}
            />
            {/* Add other screens that might be needed in admin flow */}
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
            <Stack.Screen name="ManualActivation" component={ManualActivationScreen} />
            <Stack.Screen name="FasTagRegistration" component={FasTagRegistrationScreen} />
            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
            <Stack.Screen
              name="UserDetailScreen"
              component={UserDetailScreen}
              options={{
                headerTitle: 'User Details',
                headerStyle: {
                  backgroundColor: '#333333',
                },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="FormDetailScreen"
              component={FormDetailScreen}
              options={{ headerTitle: 'Form Details' }}
            />
          </Stack.Navigator>
        ) : (
          // User is authenticated, show main app flow
          <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              drawerStyle: {
                backgroundColor: '#FFFFFF',
                width: 280,
              },
              headerStyle: {
                backgroundColor: '#FFFFFF',
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: '#333333',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerTitleAlign: 'center',
            }}
          >
            <Drawer.Screen
              name="Home"
              component={HomeStack}
              options={{
                headerTitle: (props) => <LogoTitle {...props} />,
                headerRight: () => (
                  <View style={styles.headerRight}>
                    <NotificationBell />
                  </View>
                ),
              }}
            />
            <Drawer.Screen
              name="ProfileScreen"
              component={ProfileScreen}
              options={{ headerTitle: 'My Profile' }}
            />
            <Drawer.Screen
              name="NETC"
              component={NETCStack}
              options={{ headerTitle: 'NETC FasTag' }}
            />
            <Drawer.Screen
              name="Inventory"
              component={InventoryStack}
              options={{ headerTitle: 'FasTag Inventory' }}
            />
            <Drawer.Screen
              name="Wallet"
              component={WalletStack}
              options={{ headerTitle: 'My Wallet' }}
            />
            <Drawer.Screen
              name="ServicesScreen"
              component={ServicesScreen}
              options={{ headerTitle: 'All Services' }}
            />
            <Drawer.Screen
              name="ContactSupport"
              component={ContactSupportScreen}
              options={{ headerTitle: 'Contact Support' }}
            />
            <Drawer.Screen
              name="FAQ"
              component={FAQScreen}
              options={{ headerTitle: 'FAQ' }}
            />
            <Drawer.Screen
              name="TermsConditions"
              component={TermsConditionsScreen}
              options={{ headerTitle: 'Terms & Conditions' }}
            />
          </Drawer.Navigator>
        )
      ) : (
        // User is not authenticated, show auth flow
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    height: 180,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  drawerTitle: {
    color: '#6200EE',
    fontSize: 24,
    fontWeight: 'bold',
  },
  drawerSubtitle: {
    color: '#6200EE',
    fontSize: 16,
  },
  drawerItems: {
    flex: 1,
    padding: 16,
  },
  drawerSectionTitle: {
    fontSize: 12,
    color: '#6200EE',
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
    color: '#6200EE',
  },
  activeDrawerItem: {
    color: '#6200EE',
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
    color: '#6200EE',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#6200EE',
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
    shadowColor: "#6200EE",
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
    borderBottomColor: '#EDE7F6',
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#6200EE',
  },
  markAllRead: {
    color: '#6200EE',
    fontSize: 12,
  },
  emptyNotifications: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6200EE',
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
    borderBottomColor: '#EDE7F6',
  },
  unreadNotification: {
    backgroundColor: '#EDE7F6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#6200EE',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteIcon: {
    fontSize: 18,
    color: '#6200EE',
  },
  drawerHeader: {
    height: 180,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerLogo: {
    width: 220,
    height: 100,
    backgroundColor: 'transparent',
    marginVertical: 10,
  },
  appName: {
    color: '#6200EE',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  userEmail: {
    color: '#6200EE',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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
    backgroundColor: '#EDE7F6',
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
    backgroundColor: '#EDE7F6',
  },
  drawerMenuItemText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#6200EE',
  },
  activeDrawerMenuItemText: {
    fontWeight: '600',
    color: '#6200EE',
  },
  mainMenuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200EE',
  },
  menuIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#EDE7F6',
  },
  menuIcon: {
    fontSize: 18,
    color: '#6200EE',
  },
  activeMenuIcon: {
    color: '#6200EE',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#EDE7F6',
  },
  logoutButtonIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#6200EE',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6200EE',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#6200EE',
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
    backgroundColor: '#6200EE',
    borderRadius: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6200EE',
  },
  headerRight: {
    marginRight: 10,
  },
  logoTitleContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginLeft: 0,
  },
  logoTitleImage: {
    height: 35,
    width: 170,
    marginVertical: 5,
  },
});

// Main App Navigator
const AppNavigator = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </NotificationProvider>
  );
};

export default AppNavigator;