import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from 'react-native';

const HomeScreen = ({ navigation }) => {
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
              onPress={() => navigation.navigate('FastagInventoryScreen')}
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
              onPress={() => navigation.navigate('FasTagReplacementScreen')}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>▶</Text>
              </View>
              <Text style={styles.serviceText}>FasTag{'\n'}Replacement</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.serviceItem}
              onPress={() => navigation.navigate('EnterDetails')}
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
          <Text style={styles.sectionTitle}>Service</Text>
          <View style={styles.servicesGrid}>
            <TouchableOpacity 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('NETCFastagScreen')}
            >
              <View style={styles.serviceCardIconContainer}>
                <Text style={styles.serviceCardIcon}>📋</Text>
              </View>
              <Text style={styles.serviceCardText}>NETC FasTag</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.serviceCard}>
              <View style={styles.serviceCardIconContainer}>
                <Text style={styles.serviceCardIcon}>📄</Text>
              </View>
              <Text style={styles.serviceCardText}>RC Details</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Space for bottom navigation */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('BarcodeScanner')}
        >
          <Text style={styles.fabIcon}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💳</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, { opacity: 0 }]}>
          <Text></Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👛</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
        </TouchableOpacity>
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
  
  // Services Grid
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
  },
  serviceCardIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EEEEEE',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceCardIcon: {
    fontSize: 20,
  },
  serviceCardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  
  // Floating Action Button
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    zIndex: 999,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  
  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
  },
});

export default HomeScreen;