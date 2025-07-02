import React, { useEffect, useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, ActivityIndicator, Modal, Alert, Linking, FlatList } from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import DebugConsole from './DebugConsole';
import { db } from '../services/firebase';
import { doc, getDoc, collection, query, getDocs, where } from 'firebase/firestore';

const HomeScreen = ({ navigation }) => {
  // Access the notification context
  const { addScreenCompletionNotification, addNotification, notifications } = useContext(NotificationContext);
  
  // Access auth context to get user data
  const { userInfo, userProfile, isLoading } = useAuth();
  
  // State for balance and active tags
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [activeTagsCount, setActiveTagsCount] = useState(0);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  
  // Debug console state
  const [debugVisible, setDebugVisible] = useState(false);
  
  // Message center state
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Calculate unread notifications
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(notification => !notification.read).length;
      setUnreadCount(count);
    }
  }, [notifications]);
  
  // Fetch wallet balance and active tags when the screen is focused
  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo || !userInfo.uid) return;
      
      setIsLoadingBalance(true);
      setIsLoadingTags(true);
      
      try {
        // Fetch wallet balance
        const userRef = doc(db, 'users', userInfo.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // If wallet field exists, use it, otherwise default to 0
          setWalletBalance(userData.wallet || 0);
          
          // Fetch active tags count
          await fetchActiveTagsCount(userData);
        } else {
          setWalletBalance(0);
          setActiveTagsCount(0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setWalletBalance(0);
        setActiveTagsCount(0);
      } finally {
        setIsLoadingBalance(false);
        setIsLoadingTags(false);
      }
    };
    
    fetchData();
    
    // Set up a focus listener to refresh data when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('HomeScreen focused, fetching data');
      fetchData();
    });
    
    return unsubscribe;
  }, [navigation, userInfo]);

  // Fetch active tags count
  const fetchActiveTagsCount = async (userData) => {
    try {
      const bcId = userData.bcId || userData.BC_Id;
      
      if (bcId) {
        console.log('Found BC ID:', bcId);
        const allocatedTagsQuery = query(
          collection(db, "allocatedFasTags"),
          where('bcId', '==', bcId)
        );
        
        const tagsSnapshot = await getDocs(allocatedTagsQuery);
        console.log('Allocated tags query returned:', tagsSnapshot.size, 'documents');
        
        let activeCount = 0;
        tagsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === 'available') activeCount++;
        });
        
        setActiveTagsCount(activeCount);
        console.log('Active tags count:', activeCount);
      } else {
        console.log('No BC ID found in user profile');
        setActiveTagsCount(0);
      }
    } catch (error) {
      console.error('Error fetching active tags count:', error);
      setActiveTagsCount(0);
    }
  };
  
  // Add a navigation listener to track screen changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // When the HomeScreen comes into focus, we can do something here
      console.log('HomeScreen focused');
    });
    
    // Add header right button for messages
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerMessageButton}
          onPress={() => setMessageModalVisible(true)}
        >
          <Text style={styles.messageIcon}>📩</Text>
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
    
    return unsubscribe;
  }, [navigation, unreadCount]);
  
  // Toggle debug console
  const toggleDebugConsole = () => {
    setDebugVisible(!debugVisible);
  };
  
  // Mark notification as read
  const markAsRead = (id) => {
    // This function should be implemented in the NotificationContext
    if (addNotification) {
      // For now we'll just close the modal
      setMessageModalVisible(false);
    }
  };
  
  // Add navigation enhancers to track screen completion
  const navigateWithNotification = (screenName, params = {}) => {
    // Debug logging
    console.log(`Navigating to ${screenName}`, params);
    
    // Navigate to the screen
    navigation.navigate(screenName, params);
    
    // Add a slight delay to make the notification appear after navigation
    setTimeout(() => {
      addScreenCompletionNotification(screenName);
    }, 300);
  };

  // Function to navigate to ValidateCustomer explicitly without data
  const navigateToValidateCustomer = () => {
    navigation.navigate('ValidateCustomer');
  };

  // Start FasTag registration flow with balance check
  const startFasTagRegistration = () => {
    // Get the minimum balance requirement - use custom value if set, otherwise default to 400
    const minimumBalance = userProfile && userProfile.minFasTagBalance 
      ? parseFloat(userProfile.minFasTagBalance) 
      : 400;
      
    // Check if user has sufficient balance
    if (walletBalance < minimumBalance) {
      // Show alert for insufficient balance
      Alert.alert(
        "Insufficient Balance",
        `You need a minimum balance of ₹${minimumBalance} to proceed with FasTag registration. Would you like to recharge your wallet?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Recharge Now",
            onPress: () => navigation.navigate('Wallet', { screen: 'WalletTopup' })
          }
        ]
      );
      return;
    }
    
    // Navigate to the ValidateCustomerScreen to start the registration process
    navigateWithNotification('ValidateCustomer');
    
    // Add notification about starting the process
    addNotification({
      id: Date.now(),
      message: 'Starting FasTag registration process',
      time: 'Just now',
      read: false
    });
  };

  // Get display name from user profile or auth user
  const getDisplayName = () => {
    if (userProfile && userProfile.displayName) {
      return userProfile.displayName;
    } else if (userInfo && userInfo.displayName) {
      return userInfo.displayName;
    }
    return 'Guest User';
  };

  // Get user ID from Firestore or Firebase Auth
  const getUserId = () => {
    if (userProfile && userProfile.bcId) {
      return `ID ${userProfile.bcId}`;
    } else if (userProfile && userProfile.id) {
      return `ID ${userProfile.id.substring(0, 8)}`;
    } else if (userInfo && userInfo.uid) {
      return `ID ${userInfo.uid.substring(0, 8)}`;
    }
    return 'Guest';
  };

  // If data is still loading, show loading spinner
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ACC1" />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Debug Console */}
      <DebugConsole 
        visible={debugVisible}
        onClose={() => setDebugVisible(false)}
      />
      
      {/* Message Center Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={messageModalVisible}
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notifications</Text>
                <TouchableOpacity 
                  style={styles.closeButtonContainer}
                  onPress={() => setMessageModalVisible(false)}
                >
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {/* Fixed height container for the notifications list */}
              <View style={styles.notificationsContainer}>
                {notifications && notifications.length > 0 ? (
                  <FlatList
                    data={notifications}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={[
                          styles.notificationItem,
                          !item.read && styles.unreadNotification
                        ]}
                        onPress={() => markAsRead(item.id)}
                      >
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationMessage}>{item.message}</Text>
                          <Text style={styles.notificationTime}>{item.time}</Text>
                        </View>
                        {!item.read && (
                          <View style={styles.unreadIndicator} />
                        )}
                      </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id.toString()}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.notificationsListContent}
                  />
                ) : (
                  <View style={styles.emptyNotifications}>
                    <Text style={styles.emptyText}>No notifications</Text>
                  </View>
                )}
              </View>
              
              {/* Optional footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.markAllReadButton}
                  onPress={() => {
                    Alert.alert("Info", "Mark all as read feature coming soon");
                    // Future functionality to mark all as read
                  }}
                >
                  <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header removed and replaced with default React Navigation header */}

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTopSection}>
            <View style={styles.balanceRow}>
              <View style={styles.balanceColumn}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                {isLoadingBalance ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.balanceAmount}>₹ {walletBalance.toLocaleString('en-IN')}</Text>
                )}
              </View>
              <View style={styles.tagsColumn}>
                <Text style={styles.tagsLabel}>Available</Text>
                {isLoadingTags ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.tagsAmount}>{activeTagsCount}</Text>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.balanceBottomSection}>
            <View>
              <Text style={styles.userName}>{getDisplayName()}</Text>
              <Text style={styles.userId}>{getUserId()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.inventoryButton}
              onPress={() => navigateWithNotification('Inventory')}
            >
              <Text style={styles.inventoryText}>Inventory</Text>
              <Text style={styles.inventoryIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Debug Button - Only visible for admins */}
        {userInfo && userInfo.isAdmin && (
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={toggleDebugConsole}
          >
            <Text style={styles.debugButtonText}>Debug Console</Text>
          </TouchableOpacity>
        )}

        {/* Welcome Message for User */}
        {userProfile && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome back, {userProfile.firstName || getDisplayName().split(' ')[0]}!
            </Text>
            <Text style={styles.welcomeSubtext}>
              Your account was created on {" "}
              {userProfile.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString() : 'recently'}
            </Text>
            <Text style={styles.welcomeSubtext}>
              Last login: {" "}
              {userProfile.lastLogin ? new Date(userProfile.lastLogin.seconds * 1000).toLocaleString() : 'Just now'}
            </Text>
          </View>
        )}

        {/* Frequently Used Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Frequently Used</Text>
          <View style={styles.frequentlyUsedGrid}>
            <TouchableOpacity 
              style={styles.serviceItem}
              onPress={() => navigateWithNotification('ValidateCustomer', { reqType: 'REP' })}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>▶</Text>
              </View>
              <Text style={styles.serviceText}>Replacement</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceItem}
              onPress={() => {
                Linking.openURL('https://rc-check-final.vercel.app/register');
              }}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>🚗</Text>
              </View>
              <Text style={styles.serviceText}>RC{'\n'}Verification</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceItem}
              onPress={startFasTagRegistration}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIconLarge}>+</Text>
              </View>
              <Text style={styles.serviceText}>Allocate{'\n'}FasTag</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceItem}
              onPress={() => navigateWithNotification('Wallet', { screen: 'WalletTopup' })}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>💰</Text>
              </View>
              <Text style={styles.serviceText}>Recharge{'\n'}Wallet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceItem}
              onPress={() => navigateWithNotification('FeedbackForm')}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>📝</Text>
              </View>
              <Text style={styles.serviceText}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity
              onPress={() => {
                console.log('View All button pressed');
                // Try direct navigation without using the notification wrapper
                navigation.navigate('ServicesScreen');
              }}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesRow}
          >
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => {
                Linking.openURL('https://rc-check-final.vercel.app/register');
              }}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E1F5FE'}]}>
                <Text style={styles.serviceCardIcon}>🔍</Text>
              </View>
              <Text style={styles.serviceCardText}>RC Verification</Text>
              <Text style={styles.serviceCardDescription}>Verify vehicle documents</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => {
                Linking.openURL('https://www.npci.org.in/what-we-do/netc-fastag/check-your-netc-fastag-status');
              }}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E3F2FD'}]}>
                <Text style={styles.serviceCardIcon}>📋</Text>
              </View>
              <Text style={styles.serviceCardText}>NETC FasTag</Text>
              <Text style={styles.serviceCardDescription}>Check your FasTag status</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => {
                Alert.alert(
                  "Feature in Development",
                  "The VRN Update feature is currently in development and will be available soon.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#FFF8E1'}]}>
                <Text style={styles.serviceCardIcon}>🚗</Text>
              </View>
              <Text style={styles.serviceCardText}>VRN Update</Text>
              <Text style={styles.serviceCardDescription}>Coming soon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => {
                Alert.alert(
                  "Feature in Development",
                  "The Re-KYC feature is currently in development and will be available soon.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E8F5E9'}]}>
                <Text style={styles.serviceCardIcon}>📷</Text>
              </View>
              <Text style={styles.serviceCardText}>Re-KYC</Text>
              <Text style={styles.serviceCardDescription}>Coming soon</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => {
                Alert.alert(
                  "Feature in Development",
                  "The Scanner feature is currently in development and will be available soon.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#F3E5F5'}]}>
                <Text style={styles.serviceCardIcon}>📱</Text>
              </View>
              <Text style={styles.serviceCardText}>Scanner</Text>
              <Text style={styles.serviceCardDescription}>Coming soon</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => {
                Alert.alert(
                  "Feature in Development",
                  "The Activation feature is currently in development and will be available soon.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#FFEBEE'}]}>
                <Text style={styles.serviceCardIcon}>🔄</Text>
              </View>
              <Text style={styles.serviceCardText}>Activation</Text>
              <Text style={styles.serviceCardDescription}>Coming soon</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => {
                Alert.alert(
                  "Feature in Development",
                  "The Documents feature is currently in development and will be available soon.",
                  [{ text: "OK" }]
                );
              }}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E0F7FA'}]}>
                <Text style={styles.serviceCardIcon}>📄</Text>
              </View>
              <Text style={styles.serviceCardText}>Documents</Text>
              <Text style={styles.serviceCardDescription}>Coming soon</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Space for bottom navigation */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigateWithNotification('AllocatedFasTags')}
        >
          <Text style={styles.fabIcon}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <View style={[styles.navIconContainer, styles.activeNavIcon]}>
              <Text style={styles.navIcon}>💳</Text>
            </View>
            <Text style={[styles.navLabel, styles.activeNavLabel]}>Cards</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Wallet', { screen: 'TransactionHistory' })}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>📋</Text>
            </View>
            <Text style={styles.navLabel}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItemCenter} onPress={() => navigateWithNotification('AllocatedFasTags')}>
            <View style={styles.navCenterButton}>
              <View style={styles.navCenterIcon}>
                <Text style={styles.fabIcon}>▶</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Wallet')}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>💰</Text>
            </View>
            <Text style={styles.navLabel}>Wallet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('ProfileScreen')}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>👤</Text>
            </View>
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6200EE',
  },
  // Header styles for message center
  headerMessageButton: {
    marginRight: 16,
    padding: 8,
    position: 'relative',
  },
  messageIcon: {
    fontSize: 24,
    color: '#6200EE',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#03DAC5',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Message Modal Styles
  modalSafeArea: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    height: '70%', // Fixed height for the modal
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButtonContainer: {
    padding: 5,
  },
  closeButton: {
    fontSize: 20,
    color: '#777777',
  },
  notificationsContainer: {
    flex: 1, // This allows the FlatList to scroll properly
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationsListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: 'rgba(0, 172, 193, 0.05)',
  },
  notificationContent: {
    flex: 1,
    paddingRight: 16,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#777777',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00ACC1',
  },
  emptyNotifications: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
  },
  modalFooter: {
    padding: 16,
    alignItems: 'center',
  },
  markAllReadButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  markAllReadText: {
    color: '#00ACC1',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Balance Card
  balanceCard: {
    backgroundColor: '#6200EE',
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  balanceTopSection: {
    padding: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceColumn: {
    flex: 1,
  },
  tagsColumn: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  tagsLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'right',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  tagsAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  barcodeSection: {
    backgroundColor: '#E0E7FF',
    padding: 10,
    alignItems: 'center',
  },
  barcode: {
    height: 40,
    width: '100%',
  },
  balanceBottomSection: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userId: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  inventoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inventoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 4,
  },
  inventoryIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  
  // Welcome Message
  welcomeContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: -8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#6200EE',
    marginTop: 4,
  },
  
  // Sections
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200EE',
  },
  
  // Frequently Used Grid
  frequentlyUsedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  serviceItem: {
    alignItems: 'center',
    width: '19%',
    marginBottom: 16,
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  serviceIcon: {
    fontSize: 24,
    color: '#6200EE',
  },
  serviceIconLarge: {
    fontSize: 45,
    color: '#6200EE',
  },
  serviceText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#6200EE',
  },
  
  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#6200EE',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Services Grid - update the styles
  servicesRow: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  serviceCard: {
    width: 160,
    // backgroundColor: '#6200EE',
    backgroundColor: '#FFFFFF',
    // borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    height: 160,
    justifyContent: 'flex-start',
    // shadowColor: '#6200EE',
    // shadowOffset: { width: 2, height: 2 },
    // shadowOpacity: 0.06,
    // shadowRadius: 4,
    // elevation: 2,
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  serviceCardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  serviceCardIcon: {
    fontSize: 24,
    color: '#6200EE',
  },
  serviceCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
    marginBottom: 4,
  },
  serviceCardDescription: {
    fontSize: 12,
    color: '#6200ee',
    lineHeight: 16,
  },
  
  // Floating Action Button - Hidden since we're using center button in navbar
  fabContainer: {
    display: 'none', // Hide the floating button since we have it in the navbar
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
    backgroundColor: '#E0E7FF',
  },
  navIcon: {
    fontSize: 22,
    color: '#6200EE',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6200EE',
  },
  activeNavLabel: {
    color: '#6200EE',
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
    backgroundColor: '#E0E7FF',
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 6,
    bottom: 20,
    position: 'absolute',
  },
  navCenterIcon: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#EDE7F6',
  },

  fabIcon: {
    color: '#FFFFFF',
  },
  
  // Debug Button
  debugButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    padding: 8,
    margin: 16,
    marginTop: 0,
    alignItems: 'center',
    width: '40%',
    alignSelf: 'flex-end',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default HomeScreen;