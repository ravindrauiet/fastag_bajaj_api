import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';

const HomeScreen = ({ navigation }) => {
  // Access the notification context
  const { addScreenCompletionNotification, addNotification } = useContext(NotificationContext);
  
  // Add a navigation listener to track screen changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // When the HomeScreen comes into focus, we can do something here
      console.log('HomeScreen focused');
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Add navigation enhancers to track screen completion
  const navigateWithNotification = (screenName, params = {}) => {
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

  // Start FasTag registration flow
  const startFasTagRegistration = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header removed and replaced with default React Navigation header */}

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTopSection}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₹ 25,000</Text>
          </View>
          
          <View style={styles.barcodeSection}>
            <Image
              style={styles.barcode}
              source={{ uri: 'https://via.placeholder.com/350x60/808080/FFFFFF' }}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.balanceBottomSection}>
            <View>
              <Text style={styles.userName}>Ishita Chitkara</Text>
              <Text style={styles.userId}>ID 358729689</Text>
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

        {/* Frequently Used Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Frequently Used</Text>
          <View style={styles.frequentlyUsedGrid}>
            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>📞</Text>
              </View>
              <Text style={styles.serviceText}>FasTag{'\n'}Recharge</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>💳</Text>
              </View>
              <Text style={styles.serviceText}>FasTag{'\n'}Insurance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceItem}
              onPress={() => navigateWithNotification('FasTagReplacementScreen')}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>▶</Text>
              </View>
              <Text style={styles.serviceText}>FasTag{'\n'}Replacement</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceItem}
              onPress={startFasTagRegistration}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>➕</Text>
              </View>
              <Text style={styles.serviceText}>Add{'\n'}FasTag</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>💰</Text>
              </View>
              <Text style={styles.serviceText}>Request{'\n'}Money</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity
              onPress={() => navigateWithNotification('ServicesScreen')}
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
              onPress={() => navigateWithNotification('NETCFastagScreen')}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E3F2FD'}]}>
                <Text style={styles.serviceCardIcon}>📋</Text>
              </View>
              <Text style={styles.serviceCardText}>NETC FasTag</Text>
              <Text style={styles.serviceCardDescription}>Manage your NETC account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigateWithNotification('VrnUpdateScreen')}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#FFF8E1'}]}>
                <Text style={styles.serviceCardIcon}>🚗</Text>
              </View>
              <Text style={styles.serviceCardText}>VRN Update</Text>
              <Text style={styles.serviceCardDescription}>Update vehicle registration</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigateWithNotification('FasTagRekycScreen')}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E8F5E9'}]}>
                <Text style={styles.serviceCardIcon}>📷</Text>
              </View>
              <Text style={styles.serviceCardText}>Re-KYC</Text>
              <Text style={styles.serviceCardDescription}>Update your KYC documents</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigateWithNotification('BarcodeScanner')}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#F3E5F5'}]}>
                <Text style={styles.serviceCardIcon}>📱</Text>
              </View>
              <Text style={styles.serviceCardText}>Scanner</Text>
              <Text style={styles.serviceCardDescription}>Scan FasTag barcodes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigateWithNotification('ManualActivation')}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#FFEBEE'}]}>
                <Text style={styles.serviceCardIcon}>🔄</Text>
              </View>
              <Text style={styles.serviceCardText}>Activation</Text>
              <Text style={styles.serviceCardDescription}>Manually activate your tag</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigateWithNotification('DocumentUpload')}
            >
              <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E0F7FA'}]}>
                <Text style={styles.serviceCardIcon}>📄</Text>
              </View>
              <Text style={styles.serviceCardText}>Documents</Text>
              <Text style={styles.serviceCardDescription}>Upload required documents</Text>
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
          onPress={() => navigateWithNotification('BarcodeScanner')}
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
          
          <TouchableOpacity style={styles.navItemCenter} onPress={() => navigateWithNotification('BarcodeScanner')}>
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
  // Header styles removed as we're now using the default React Navigation header
  
  // Balance Card
  balanceCard: {
    backgroundColor: '#333333',
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
  },
  balanceTopSection: {
    padding: 16,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  barcodeSection: {
    backgroundColor: '#888888',
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
    color: '#CCCCCC',
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
  
  // Sections
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
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
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333333',
  },
  
  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#00ACC1',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    height: 160,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  serviceCardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceCardIcon: {
    fontSize: 24,
  },
  serviceCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  serviceCardDescription: {
    fontSize: 12,
    color: '#777777',
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
});

export default HomeScreen;