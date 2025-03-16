import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  TextInput, 
  Alert, 
  Modal, 
  Animated,
  Image,
  Switch,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommonActions } from '@react-navigation/native';

const ConfirmPaymentScreen = ({ route, navigation }) => {
  const { selectedProducts, vehicleDetails, userDetails } = route.params || {};
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  
  // Payment state
  const [amount, setAmount] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommercialVehicle, setIsCommercialVehicle] = useState(false);
  const [selectedProductOption, setSelectedProductOption] = useState('option1');
  
  const productOptions = [
    { id: 'option1', name: 'Basic FASTag', price: 500, description: 'Standard FASTag with basic features' },
    { id: 'option2', name: 'Premium FASTag', price: 750, description: 'Premium FASTag with enhanced features' },
    { id: 'option3', name: 'Commercial FASTag', price: 1000, description: 'Designed for commercial vehicles' }
  ];
  
  // Calculate total amount
  useEffect(() => {
    calculateTotalAmount();
  }, [selectedProductOption, isCommercialVehicle]);
  
  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const calculateTotalAmount = () => {
    // Find selected product
    const product = productOptions.find(p => p.id === selectedProductOption);
    let total = product ? product.price : 0;
    
    // Add commercial vehicle surcharge if applicable
    if (isCommercialVehicle) {
      total += 200; // Additional fee for commercial vehicles
    }
    
    // Add any selected add-ons from previous screen
    if (selectedProducts && selectedProducts.length > 0) {
      const addOnTotal = selectedProducts.reduce((sum, product) => sum + product.price, 0);
      total += addOnTotal;
    }
    
    setAmount(total.toString());
  };
  
  const handleScanBarcode = () => {
    // Simulate barcode scanning
    setScannedBarcode('FASTAG' + Math.floor(Math.random() * 10000000000));
    Alert.alert('Barcode Scanned', 'Barcode has been successfully scanned.');
  };
  
  const handleAmountChange = (text) => {
    // Only allow numbers
    if (/^\d*$/.test(text)) {
      setAmount(text);
    }
  };
  
  const validatePaymentDetails = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return false;
    }
    
    if (!scannedBarcode) {
      Alert.alert('Missing Barcode', 'Please scan a barcode to proceed with payment.');
      return false;
    }
    
    return true;
  };
  
  const handleConfirmPayment = () => {
    if (!validatePaymentDetails()) {
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Show success message
      Alert.alert(
        'Payment Successful',
        'Your FASTag has been activated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to home screen and reset the navigation stack
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'HomeScreen' }],
                })
              );
            },
          },
        ]
      );
    }, 2000);
  };
  
  const handleProductOptionSelect = (option) => {
    setSelectedProductOption(option);
  };
  
  const handleCommercialVehicleToggle = () => {
    setIsCommercialVehicle(!isCommercialVehicle);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>Payment Details</Text>
          <Text style={styles.subtitle}>Confirm your payment details</Text>
          
          {/* Product Options */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Select Product</Text>
            
            {productOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.productOption,
                  selectedProductOption === option.id && styles.selectedProductOption
                ]}
                onPress={() => handleProductOptionSelect(option.id)}
              >
                <View style={styles.productOptionHeader}>
                  <View style={styles.radioButton}>
                    {selectedProductOption === option.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.productName}>{option.name}</Text>
                  <Text style={styles.productPrice}>₹{option.price}</Text>
                </View>
                <Text style={styles.productDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Commercial Vehicle Toggle */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Commercial Vehicle</Text>
              <Text style={styles.toggleDescription}>Additional charges apply for commercial vehicles</Text>
            </View>
            <Switch
              trackColor={{ false: '#D3D3D3', true: '#86939e' }}
              thumbColor={isCommercialVehicle ? '#333333' : '#f4f3f4'}
              ios_backgroundColor="#D3D3D3"
              onValueChange={handleCommercialVehicleToggle}
              value={isCommercialVehicle}
            />
          </View>
          
          {/* Barcode Section */}
          <View style={styles.barcodeContainer}>
            <Text style={styles.sectionTitle}>Scan Barcode</Text>
            <View style={styles.scanFrame}>
              <Text style={styles.scanText}>
                {scannedBarcode ? scannedBarcode : 'No barcode scanned yet'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={handleScanBarcode}
              activeOpacity={0.8}
            >
              <Icon name="barcode-scan" size={20} color="#FFFFFF" />
              <Text style={styles.scanButtonText}>Scan Barcode</Text>
            </TouchableOpacity>
          </View>
          
          {/* Payment Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.sectionTitle}>Payment Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                editable={false}
              />
            </View>
          </View>
          
          {/* Payment Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Selected Product:</Text>
              <Text style={styles.summaryValue}>
                {productOptions.find(p => p.id === selectedProductOption)?.name}
              </Text>
            </View>
            
            {selectedProducts && selectedProducts.length > 0 && (
              <View style={styles.addOnsContainer}>
                <Text style={styles.addOnsTitle}>Add-ons:</Text>
                {selectedProducts.map((product, index) => (
                  <View key={index} style={styles.summaryRow}>
                    <Text style={styles.addOnLabel}>{product.name}</Text>
                    <Text style={styles.addOnValue}>₹{product.price}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {isCommercialVehicle && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Commercial Vehicle Fee:</Text>
                <Text style={styles.summaryValue}>₹200</Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>₹{amount}</Text>
            </View>
          </View>
          
          {/* User Information Summary */}
          <View style={styles.userSummaryContainer}>
            <Text style={styles.summaryTitle}>User Information</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Name:</Text>
              <Text style={styles.summaryValue}>
                {userDetails?.firstName} {userDetails?.lastName}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle:</Text>
              <Text style={styles.summaryValue}>{vehicleDetails?.vehicleNo}</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Confirm Payment Button */}
        <TouchableOpacity 
          style={[styles.confirmButton, isProcessing && styles.disabledButton]} 
          onPress={handleConfirmPayment}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Payment</Text>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  productOption: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 12,
    marginBottom: 8,
  },
  selectedProductOption: {
    borderColor: '#333333',
    backgroundColor: '#F5F5F5',
  },
  productOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#333333',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 30,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 20,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666666',
  },
  barcodeContainer: {
    marginBottom: 20,
  },
  scanFrame: {
    height: 100,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanText: {
    fontSize: 16,
    color: '#666666',
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  amountContainer: {
    marginBottom: 20,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 20,
    color: '#333333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#333333',
  },
  summaryContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  addOnsContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  addOnsTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  addOnLabel: {
    fontSize: 14,
    color: '#666666',
    paddingLeft: 16,
  },
  addOnValue: {
    fontSize: 14,
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  userSummaryContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
  },
  confirmButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    margin: 16,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#9e9e9e',
  }
});

export default ConfirmPaymentScreen; 