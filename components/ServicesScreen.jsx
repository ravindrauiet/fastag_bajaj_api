import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';

const ServicesScreen = ({ navigation }) => {
  // Function to navigate with screen completion notification
  const navigateToService = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.title}>All Services</Text>
          <Text style={styles.description}>
            Access all FasTag services in one place
          </Text>
        </View>

        <View style={styles.servicesGrid}>
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => navigateToService('NETCFastagScreen')}
          >
            <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E3F2FD'}]}>
              <Text style={styles.serviceCardIcon}>📋</Text>
            </View>
            <Text style={styles.serviceCardText}>NETC FasTag</Text>
            <Text style={styles.serviceCardDescription}>Manage your NETC account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => navigateToService('VrnUpdateScreen')}
          >
            <View style={[styles.serviceCardIconContainer, {backgroundColor: '#FFF8E1'}]}>
              <Text style={styles.serviceCardIcon}>🚗</Text>
            </View>
            <Text style={styles.serviceCardText}>VRN Update</Text>
            <Text style={styles.serviceCardDescription}>Update vehicle registration</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => navigateToService('FasTagRekycScreen')}
          >
            <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E8F5E9'}]}>
              <Text style={styles.serviceCardIcon}>📷</Text>
            </View>
            <Text style={styles.serviceCardText}>Re-KYC</Text>
            <Text style={styles.serviceCardDescription}>Update your KYC documents</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => navigateToService('BarcodeScanner')}
          >
            <View style={[styles.serviceCardIconContainer, {backgroundColor: '#F3E5F5'}]}>
              <Text style={styles.serviceCardIcon}>📱</Text>
            </View>
            <Text style={styles.serviceCardText}>Scanner</Text>
            <Text style={styles.serviceCardDescription}>Scan FasTag barcodes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => navigateToService('ManualActivation')}
          >
            <View style={[styles.serviceCardIconContainer, {backgroundColor: '#FFEBEE'}]}>
              <Text style={styles.serviceCardIcon}>🔄</Text>
            </View>
            <Text style={styles.serviceCardText}>Activation</Text>
            <Text style={styles.serviceCardDescription}>Manually activate your tag</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => navigateToService('DocumentUpload')}
          >
            <View style={[styles.serviceCardIconContainer, {backgroundColor: '#E0F7FA'}]}>
              <Text style={styles.serviceCardIcon}>📄</Text>
            </View>
            <Text style={styles.serviceCardText}>Documents</Text>
            <Text style={styles.serviceCardDescription}>Upload required documents</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => navigateToService('FasTagReplacement')}
          >
            <View style={[styles.serviceCardIconContainer, {backgroundColor: '#F8BBD0'}]}>
              <Text style={styles.serviceCardIcon}>🔁</Text>
            </View>
            <Text style={styles.serviceCardText}>Replacement</Text>
            <Text style={styles.serviceCardDescription}>Replace your FasTag</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => navigateToService('CreateWallet')}
          >
            <View style={[styles.serviceCardIconContainer, {backgroundColor: '#D1C4E9'}]}>
              <Text style={styles.serviceCardIcon}>💼</Text>
            </View>
            <Text style={styles.serviceCardText}>Create Wallet</Text>
            <Text style={styles.serviceCardDescription}>Setup your FasTag wallet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
});

export default ServicesScreen; 