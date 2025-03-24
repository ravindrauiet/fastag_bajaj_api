import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
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
  const [fadeOutAnim] = useState(new Animated.Value(1));
  const [slideUpAnim] = useState(new Animated.Value(0));
  const [paymentOptionsAnim] = useState(new Animated.Value(50));
  
  // Payment state
  const [amount, setAmount] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommercialVehicle, setIsCommercialVehicle] = useState(false);
  const [selectedProductOption, setSelectedProductOption] = useState('option1');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  
  // Generated fastag ID
  const [fastagId, setFastagId] = useState('');
  
  // Scroll view reference
  const scrollViewRef = useRef(null);
  
  const productOptions = [
    { id: 'option1', name: 'Basic FASTag', price: 500, description: 'Standard FASTag with basic features' },
    { id: 'option2', name: 'Premium FASTag', price: 750, description: 'Premium FASTag with enhanced features' },
    { id: 'option3', name: 'Commercial FASTag', price: 1000, description: 'Designed for commercial vehicles' }
  ];
  
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
  
  // Calculate total amount
  useEffect(() => {
    calculateTotalAmount();
  }, [selectedProductOption, isCommercialVehicle]);
  
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
  
  // Payment breakdown data
  const paymentBreakdown = [
    { label: 'Tag Insurance Fee', value: 100 },
    { label: 'Security Deposit', value: 0 },
    { label: 'Minimum Balance', value: 150 },
    { label: 'First Recharge', value: 0 },
  ];
  
  // Calculate breakdown total amount
  const breakdownTotal = paymentBreakdown.reduce((sum, item) => sum + item.value, 0);
  
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
      
      // Show payment options and scroll to it
      setShowPaymentOptions(true);
      
      // Animate slide out of form and slide in of payment options
      Animated.parallel([
        // Fade out and slide up the form
        Animated.timing(fadeOutAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
        
        // Slide in the payment options
        Animated.spring(paymentOptionsAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
      
      // Scroll to the payment options section
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 100);
      
    }, 1500);
  };
  
  const handlePaymentOptions = () => {
    // Show payment options instead of alert
    setShowPaymentOptions(true);
  };
  
  const handleBackToForm = () => {
    // Animate back to the form
    Animated.parallel([
      // Fade in and slide down the form
      Animated.timing(fadeOutAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      
      // Slide out the payment options
      Animated.timing(paymentOptionsAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowPaymentOptions(false);
    });
  };
  
  const handleProductOptionSelect = (option) => {
    setSelectedProductOption(option);
  };
  
  const handleCommercialVehicleToggle = () => {
    setIsCommercialVehicle(!isCommercialVehicle);
  };
  
  const handlePayment = (method) => {
    setPaymentMethod(method);
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      
      // Generate random FASTag ID
      const randomId = Math.floor(10000000000 + Math.random() * 90000000000);
      setFastagId(`34161FAB${randomId.toString().substring(0, 10)}`);
    }, 1500);
  };
  
  const handleComplete = () => {
    // Navigate back to home screen and reset the navigation stack
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      })
    );
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
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {!paymentComplete ? (
          <>
            {/* Original Payment Details */}
            <Animated.View 
              style={[
                styles.formContainer,
                showPaymentOptions ? {
                  opacity: fadeOutAnim,
                  transform: [{ translateY: slideUpAnim }],
                } : {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                },
                showPaymentOptions && styles.collapsedContainer
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
            
            {/* Original Confirm Button */}
            {!showPaymentOptions && (
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
            )}
            
            {/* New Payment Options Section */}
            {showPaymentOptions && (
              <Animated.View 
                style={[
                  styles.paymentOptionsContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: paymentOptionsAnim }]
                  }
                ]}
              >
                <View style={styles.paymentOptionsHeader}>
                  <TouchableOpacity 
                    style={styles.backToFormButton}
                    onPress={handleBackToForm}
                  >
                    <Text style={styles.backToFormText}>←</Text>
                  </TouchableOpacity>
                  <Text style={styles.paymentOptionsTitle}>Complete Payment</Text>
                </View>
                {/* Payment Breakdown Section */}
                <Text style={styles.breakdownTitle}>Payment breakdown</Text>
                
                {paymentBreakdown.map((item, index) => (
                  <View key={index} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                    <Text style={styles.breakdownValue}>₹ {item.value}</Text>
                  </View>
                ))}
                
                <View style={styles.divider} />
                
                {/* Final Amount */}
                <View style={styles.finalAmountContainer}>
                  <Text style={styles.finalAmountLabel}>Final amount</Text>
                  <View style={styles.finalAmountBadge}>
                    <Text style={styles.finalAmountValue}>₹ {breakdownTotal}</Text>
                  </View>
                </View>
                
                {/* Payment Buttons */}
                <View style={styles.paymentButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.paymentButton, styles.upiButton]} 
                    onPress={() => handlePayment('UPI')}
                    disabled={isProcessing}
                  >
                    {isProcessing && paymentMethod === 'UPI' ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.paymentButtonText}>Paid via UPI</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.paymentButton, styles.cashButton]} 
                    onPress={() => handlePayment('Cash')}
                    disabled={isProcessing}
                  >
                    {isProcessing && paymentMethod === 'Cash' ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.paymentButtonText}>Paid by Cash</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
            
            <View style={{ height: 20 }} />
          </>
        ) : (
          /* Success Message and Details */
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.successContainer}>
              <View style={styles.successHeader}>
                <Text style={styles.successMessage}>FASTag has been issued successfully!</Text>
                <View style={styles.completeBadge}>
                  <Text style={styles.completeText}>COMPLETE</Text>
                </View>
              </View>
              
              <View style={styles.fastagDetailsCard}>
                <View style={styles.detailRow}>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>FASTAG ID</Text>
                    <Text style={styles.detailValue}>{fastagId}</Text>
                  </View>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>VEHICLE NO.</Text>
                    <Text style={styles.detailValue}>{vehicleDetails?.vehicleNo || 'MH02FU6974'}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>MOBILE NUMBER</Text>
                    <Text style={styles.detailValue}>
                      {userDetails?.mobile || vehicleDetails?.vrnMobileNo || '8435120730'}
                    </Text>
                  </View>
                  <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>KYC STATUS</Text>
                    <Text style={styles.detailValue}>Min KYC</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.completeButton} 
                onPress={handleComplete}
              >
                <Text style={styles.completeButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
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
  },
  // New payment options styles
  paymentOptionsContainer: {
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
  paymentOptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 16,
    marginBottom: 16,
  },
  paymentOptionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  backToFormButton: {
    paddingRight: 12,
  },
  backToFormText: {
    fontSize: 20,
    color: '#333333',
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#333333',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  finalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  finalAmountLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  finalAmountBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  finalAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  paymentButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  paymentButton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  upiButton: {
    backgroundColor: '#333333',
  },
  cashButton: {
    backgroundColor: '#333333',
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Success UI styles
  successContainer: {
    marginTop: 24,
  },
  successHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  completeBadge: {
    backgroundColor: '#007F56',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  completeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fastagDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
  },
  completeButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  collapsedContainer: {
    maxHeight: 0,
    overflow: 'hidden',
    padding: 0,
    margin: 0,
    borderWidth: 0,
  },
});

export default ConfirmPaymentScreen; 