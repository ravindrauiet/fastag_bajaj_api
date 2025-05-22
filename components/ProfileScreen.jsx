import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  // Access auth context
  const { userInfo, userProfile, logout, updateProfile, isLoading } = useAuth();

  // State for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    aadharCard: '',
    panCard: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Toggle states - set default to false
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  // Access notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Update form data when user profile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        address: userProfile.address || '',
        aadharCard: userProfile.aadharCard || '',
        panCard: userProfile.panCard || '',
      });
    }
  }, [userProfile]);

  // Get full name from profile
  const getFullName = () => {
    if (userProfile && userProfile.displayName) {
      return userProfile.displayName;
    } else if (userInfo && userInfo.displayName) {
      return userInfo.displayName;
    }
    return 'Guest User';
  };

  // Get customer ID from profile
  const getCustomerId = () => {
    if (userProfile && userProfile.id) {
      return `CUST${userProfile.id.substring(0, 8)}`;
    } else if (userInfo && userInfo.uid) {
      return `CUST${userInfo.uid.substring(0, 8)}`;
    }
    return 'GUEST000000';
  };

  // Get KYC status from profile
  const getKycStatus = () => {
    if (userProfile && userProfile.kycStatus) {
      return userProfile.kycStatus;
    } else if (userInfo && userInfo.emailVerified) {
      return 'Verified';
    }
    return 'Not Verified';
  };

  // Get minimum FasTag balance if set by admin
  const getMinFasTagBalance = () => {
    if (userProfile && userProfile.minFasTagBalance) {
      return userProfile.minFasTagBalance;
    }
    return '400'; // Default value
  };

  // Get user wallet balance
  const getWalletBalance = () => {
    if (userProfile && userProfile.wallet) {
      return userProfile.wallet.toFixed(2);
    }
    return '0.00';
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      // Create display name
      const displayName = `${formData.firstName} ${formData.lastName}`;
      
      // Update profile in Firestore
      const success = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName,
        phone: formData.phone,
        address: formData.address,
        aadharCard: formData.aadharCard,
        panCard: formData.panCard,
      });
      
      if (success) {
        addNotification({
          id: Date.now(),
          message: 'Profile updated successfully',
          time: 'Just now',
          read: false
        });
        
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            setLoading(true);
            const success = await logout();
            if (success) {
              addNotification({
                id: Date.now(),
                message: 'You have been logged out successfully',
                time: 'Just now',
                read: false
              });
            } else {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
            setLoading(false);
          }
        }
      ]
    );
  };
  
  // Handle settings toggle with coming soon message
  const handleSettingsToggle = (setting) => {
    Alert.alert(
      'Coming Soon',
      `This feature will be available in the next update. Stay tuned!`,
      [{ text: 'OK' }]
    );
  };
  
  // If auth is still loading, show loading spinner
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ACC1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ACC1" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            {/* Profile Summary */}
            <View style={styles.profileSummary}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getFullName().charAt(0)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{getFullName()}</Text>
                <Text style={styles.profileId}>{getCustomerId()}</Text>
                {/* <View style={styles.kycBadge}>
                  <Text style={styles.kycText}>KYC {getKycStatus()}</Text>
                </View> */}
              </View>
            </View>
            
            {/* Wallet Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wallet</Text>
              <View style={styles.walletCard}>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletLabel}>Available Balance</Text>
                  <Text style={styles.walletBalance}>₹{getWalletBalance()}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addMoneyButton}
                  onPress={() => navigation.navigate('Wallet')}
                >
                  <Text style={styles.addMoneyButtonText}>Add Money</Text>
                </TouchableOpacity>
              </View>
              
              {/* Show Minimum FasTag Balance if set by admin */}
              {userProfile && userProfile.minFasTagBalance && (
                <View style={styles.minBalanceContainer}>
                  <Text style={styles.minBalanceText}>
                    Minimum FasTag Balance: ₹{getMinFasTagBalance()}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              {isEditing ? (
                // Edit Form
                <View style={styles.infoCard}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.firstName}
                      onChangeText={(text) => handleInputChange('firstName', text)}
                      placeholder="Enter your first name"
                    />
                  </View>
                  
                  <View style={styles.separator} />
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.lastName}
                      onChangeText={(text) => handleInputChange('lastName', text)}
                      placeholder="Enter your last name"
                    />
                  </View>
                  
                  <View style={styles.separator} />
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.phone}
                      onChangeText={(text) => handleInputChange('phone', text)}
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                    />
                  </View>
                  
                  <View style={styles.separator} />
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={[styles.textInput, { color: '#777777' }]}
                      value={formData.email}
                      editable={false}
                      placeholder="Email address"
                    />
                  </View>
                  
                  <View style={styles.separator} />
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Address</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.address}
                      onChangeText={(text) => handleInputChange('address', text)}
                      placeholder="Enter your address"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                  
                  <View style={styles.separator} />
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Aadhar Card</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.aadharCard}
                      onChangeText={(text) => handleInputChange('aadharCard', text)}
                      placeholder="Enter your 12-digit Aadhar number"
                      keyboardType="number-pad"
                      maxLength={12}
                    />
                  </View>
                  
                  <View style={styles.separator} />
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>PAN Card</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formData.panCard}
                      onChangeText={(text) => handleInputChange('panCard', text)}
                      placeholder="Enter your PAN Card number"
                      autoCapitalize="characters"
                      maxLength={10}
                    />
                  </View>
                </View>
              ) : (
                // Display Info
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{userProfile?.phone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{userProfile?.email || userInfo?.email || 'Not provided'}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{userProfile?.address || 'Not provided'}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Aadhar Card</Text>
                    <Text style={styles.infoValue}>{userProfile?.aadharCard || 'Not provided'}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>PAN Card</Text>
                    <Text style={styles.infoValue}>{userProfile?.panCard || 'Not provided'}</Text>
                  </View>
                </View>
              )}
              
              {isEditing ? (
                <View style={styles.editButtonsRow}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.editButtonText}>Edit Information</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.settingsCard}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={() => handleSettingsToggle('notifications')}
                    trackColor={{ false: '#DDDDDD', true: '#00ACC1' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                <View style={styles.separator} />
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Biometric Authentication</Text>
                  <Switch
                    value={biometricEnabled}
                    onValueChange={() => handleSettingsToggle('biometric')}
                    trackColor={{ false: '#DDDDDD', true: '#00ACC1' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </View>
            
            {/* Support & Help */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support & Help</Text>
              <View style={styles.supportCard}>
                <TouchableOpacity 
                  style={styles.supportRow}
                  onPress={() => navigation.navigate('ContactSupport')}
                >
                  <View style={styles.supportIconContainer}>
                    <Text style={styles.supportIcon}>📞</Text>
                  </View>
                  <Text style={styles.supportLabel}>Contact Support</Text>
                  <Text style={styles.supportArrow}>→</Text>
                </TouchableOpacity>
                <View style={styles.separator} />
                <TouchableOpacity 
                  style={styles.supportRow}
                  onPress={() => navigation.navigate('FAQ')}
                >
                  <View style={styles.supportIconContainer}>
                    <Text style={styles.supportIcon}>❓</Text>
                  </View>
                  <Text style={styles.supportLabel}>FAQ</Text>
                  <Text style={styles.supportArrow}>→</Text>
                </TouchableOpacity>
                <View style={styles.separator} />
                <TouchableOpacity 
                  style={styles.supportRow}
                  onPress={() => navigation.navigate('TermsConditions')}
                >
                  <View style={styles.supportIconContainer}>
                    <Text style={styles.supportIcon}>📄</Text>
                  </View>
                  <Text style={styles.supportLabel}>Terms & Conditions</Text>
                  <Text style={styles.supportArrow}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Logout Button */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.logoutButtonText}>Logout</Text>
              )}
            </TouchableOpacity>
            
            {/* App Version */}
            <Text style={styles.versionText}>App Version: 1.0.38</Text>
            
            {/* Bottom space for navigation */}
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#00ACC1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 400,
  },
  loadingText: {
    fontSize: 16,
    color: '#777777',
    marginTop: 12,
  },
  
  // Profile Summary
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00ACC1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 8,
  },
  kycBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  kycText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Section Styling
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  
  // Wallet Section
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  addMoneyButton: {
    backgroundColor: '#00ACC1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addMoneyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  minBalanceContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  minBalanceText: {
    color: '#777777',
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  // Info Card
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  infoRow: {
    padding: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333333',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  },
  
  // Edit Form
  inputGroup: {
    padding: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: '#333333',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#777777',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00ACC1',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#00ACC1',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Settings
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
  },
  
  // Support Card
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  supportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportIcon: {
    fontSize: 20,
  },
  supportLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  supportArrow: {
    fontSize: 18,
    color: '#777777',
  },
  
  // Logout Button
  logoutButton: {
    backgroundColor: '#00ACC1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Version
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999999',
    marginTop: 16,
    marginBottom: 16,
  },
  
  // Bottom Navigation
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    width: '92%',
    height: 75,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    paddingHorizontal: 15,
    position: 'relative',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingTop: 5,
  },
  navIconContainer: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 5,
  },
  activeNavIcon: {
    backgroundColor: 'rgba(0, 172, 193, 0.1)',
  },
  navIcon: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#777777',
  },
  activeNavLabel: {
    color: '#00ACC1',
    fontWeight: '600',
  },
  navItemCenter: {
    width: 75,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCenterButton: {
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    bottom: 20,
    position: 'absolute',
  },
  navCenterIcon: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  centerButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
  },
});

export default ProfileScreen; 