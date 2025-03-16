import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Image } from 'react-native';

const AddOnsScreen = ({ route, navigation }) => {
  const { vehicleDetails, userDetails } = route.params || {};
  
  // State for selected product
  const [selectedAddOn, setSelectedAddOn] = useState(false);
  
  // Handle proceed to payment
  const handleProceed = () => {
    navigation.navigate('ConfirmPayment', {
      vehicleDetails,
      userDetails,
      selectedAddOn
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Ons</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* User information fields based on image */}
        
        {/* Name/Company */}
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>{userDetails?.firstName} {userDetails?.lastName}</Text>
          <Text style={styles.infoLabel}>Name / Company</Text>
        </View>
        
        {/* Date of birth */}
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>21-11-1995</Text>
          <Text style={styles.infoLabel}>Date of birth(DOB)</Text>
        </View>
        
        {/* Mobile number */}
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>8435120730</Text>
          <Text style={styles.infoLabel}>Mobile number registered with Aadhaar</Text>
        </View>
        
        {/* Permanent Address */}
        <View style={styles.infoCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressTitle}>Permanent Address</Text>
            <View style={styles.homeIcon}>
              <Text style={styles.homeIconText}>🏠</Text>
            </View>
          </View>
          <Text style={styles.addressValue}>
            D/O: Sudhir Joshi, 146-A SILVER OAKS COLONY Indore ANNAPURNA ROAD, NA, 452009, INDORE, <Text style={styles.addressState}>MADHYA PRADESH</Text>
          </Text>
        </View>
        
        {/* Communication Address */}
        <View style={styles.infoCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressTitle}>Communication Address</Text>
            <View style={styles.homeIcon}>
              <Text style={styles.homeIconText}>🏠</Text>
            </View>
          </View>
          <Text style={styles.addressValue}>
            NA, NA, NA, NA, NA, NA
          </Text>
        </View>
        
        {/* Choose add-on Products */}
        <Text style={styles.sectionTitle}>Choose add-on Products</Text>
        
        <View style={styles.addOnContainer}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setSelectedAddOn(!selectedAddOn)}
          >
            <View style={styles.checkbox}>
              {selectedAddOn && <View style={styles.checkboxChecked} />}
            </View>
            <Text style={styles.addOnText}>Add MAX</Text>
          </TouchableOpacity>
        </View>
        
        {/* Proceed Button */}
        <TouchableOpacity 
          style={styles.proceedButton}
          onPress={handleProceed}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    backgroundColor: '#333333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  content: {
    flex: 1,
    padding: 16,
  },
  userInfoSection: {
    marginBottom: 16,
  },
  addressSection: {
    marginBottom: 16,
  },
  addOnsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777777',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '400',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
  },
  homeIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#333333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIconText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  addressValue: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  addressState: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  addOnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addOnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addOnTitleContainer: {
    flex: 1,
  },
  addOnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  addOnSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  addOnPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  addOnDescription: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  checkboxText: {
    fontSize: 16,
    color: '#333333',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 16,
    color: '#555555',
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  proceedButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
  },
  proceedButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddOnsScreen;