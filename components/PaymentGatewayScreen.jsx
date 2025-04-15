import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

// Payment methods
const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦' }
];

const PaymentGatewayScreen = ({ navigation, route }) => {
  // Get params from route
  const { amount, source = 'wallet_recharge' } = route.params || {};
  
  // State variables
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Banks for Net Banking
  const banks = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'kotak', name: 'Kotak Mahindra Bank' }
  ];

  // Format card number with spaces
  const formatCardNumber = (text) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Add a space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted;
  };

  // Format card expiry (MM/YY)
  const formatCardExpiry = (text) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as MM/YY
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    
    return cleaned;
  };

  // Handle card number input
  const handleCardNumberChange = (text) => {
    const formatted = formatCardNumber(text);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardNumber(formatted);
    }
  };

  // Handle card expiry input
  const handleCardExpiryChange = (text) => {
    // Remove slash if present
    const textWithoutSlash = text.replace('/', '');
    
    if (textWithoutSlash.length <= 4) { // MM/YY
      const formatted = formatCardExpiry(textWithoutSlash);
      setCardExpiry(formatted);
    }
  };

  // Handle CVV input
  const handleCardCvvChange = (text) => {
    // Only allow numbers and max length of 3-4
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCardCvv(cleaned);
    }
  };

  // Submit payment
  const handlePayNow = () => {
    // Validate inputs based on selected payment method
    if (!validatePaymentForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate payment processing (success or failure)
    setTimeout(() => {
      setLoading(false);
      
      // Random success or failure (80% success rate for demo)
      const isSuccess = Math.random() < 0.8;
      
      if (isSuccess) {
        // Navigate to success screen
        navigation.navigate('PaymentSuccess', {
          amount,
          source,
          transactionId: 'TXN' + Date.now()
        });
      } else {
        // Navigate to failure screen
        navigation.navigate('PaymentFailure', {
          amount,
          source,
          errorCode: 'ERR_PAYMENT_FAILED',
          errorMessage: 'The payment could not be processed. Please try again or use a different payment method.'
        });
      }
    }, 2000);
  };

  // Validate payment form
  const validatePaymentForm = () => {
    switch (selectedPaymentMethod) {
      case 'card':
        // Validate card details
        if (cardNumber.replace(/\s/g, '').length !== 16) {
          Alert.alert('Invalid Card Number', 'Please enter a valid 16-digit card number.');
          return false;
        }
        
        if (cardExpiry.length !== 5) { // MM/YY format
          Alert.alert('Invalid Expiry Date', 'Please enter a valid expiry date in MM/YY format.');
          return false;
        }
        
        const [month, year] = cardExpiry.split('/');
        const currentYear = new Date().getFullYear() % 100; // Get last 2 digits
        const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed
        
        if (parseInt(month) < 1 || parseInt(month) > 12) {
          Alert.alert('Invalid Expiry Month', 'Month must be between 01 and 12.');
          return false;
        }
        
        if ((parseInt(year) < currentYear) || 
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
          Alert.alert('Card Expired', 'The card expiry date is in the past.');
          return false;
        }
        
        if (cardCvv.length < 3) {
          Alert.alert('Invalid CVV', 'Please enter a valid CVV/CVC code.');
          return false;
        }
        
        if (!cardholderName.trim()) {
          Alert.alert('Invalid Name', 'Please enter the cardholder name.');
          return false;
        }
        break;
        
      case 'upi':
        // Validate UPI ID (username@provider format)
        if (!upiId.includes('@') || upiId.split('@').length !== 2) {
          Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID in the format username@provider.');
          return false;
        }
        break;
        
      case 'netbanking':
        // Validate bank selection
        if (!selectedBank) {
          Alert.alert('Bank Not Selected', 'Please select a bank for Net Banking.');
          return false;
        }
        break;
    }
    
    return true;
  };

  // Render payment form based on selected method
  const renderPaymentMethodForm = () => {
    switch (selectedPaymentMethod) {
      case 'card':
        return (
          <View style={styles.paymentMethodForm}>
            <Text style={styles.formLabel}>Card Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="number-pad"
              maxLength={19} // 16 digits + 3 spaces
            />
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChangeText={handleCardExpiryChange}
                  keyboardType="number-pad"
                  maxLength={5} // MM/YY
                />
              </View>
              
              <View style={styles.formColumn}>
                <Text style={styles.formLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="123"
                  value={cardCvv}
                  onChangeText={handleCardCvvChange}
                  keyboardType="number-pad"
                  maxLength={4} // Some cards have 4-digit CVV
                  secureTextEntry
                />
              </View>
            </View>
            
            <Text style={styles.formLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="JOHN SMITH"
              value={cardholderName}
              onChangeText={setCardholderName}
              autoCapitalize="characters"
            />
          </View>
        );
        
      case 'upi':
        return (
          <View style={styles.paymentMethodForm}>
            <Text style={styles.formLabel}>UPI ID</Text>
            <TextInput
              style={styles.textInput}
              placeholder="username@upi"
              value={upiId}
              onChangeText={setUpiId}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.upiNote}>
              <Text style={styles.upiNoteText}>
                You will receive a notification on your UPI app to approve this payment.
              </Text>
            </View>
          </View>
        );
        
      case 'netbanking':
        return (
          <View style={styles.paymentMethodForm}>
            <Text style={styles.formLabel}>Select Bank</Text>
            <View style={styles.bankList}>
              {banks.map(bank => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankItem,
                    selectedBank === bank.id && styles.bankItemSelected
                  ]}
                  onPress={() => setSelectedBank(bank.id)}
                >
                  <Text style={[
                    styles.bankItemText,
                    selectedBank === bank.id && styles.bankItemTextSelected
                  ]}>
                    {bank.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.netbankingNote}>
              <Text style={styles.netbankingNoteText}>
                You will be redirected to your bank's website to complete the payment.
              </Text>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Payment Header */}
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentTitle}>Payment</Text>
          <Text style={styles.paymentAmount}>₹{amount.toLocaleString('en-IN')}</Text>
        </View>
        
        {/* Payment Method Selection */}
        <View style={styles.methodSelectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodsGrid}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodItem,
                  selectedPaymentMethod === method.id && styles.paymentMethodItemSelected
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                <Text style={[
                  styles.paymentMethodLabel,
                  selectedPaymentMethod === method.id && styles.paymentMethodLabelSelected
                ]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Payment Method Form */}
        <View style={styles.paymentFormContainer}>
          {renderPaymentMethodForm()}
        </View>
        
        {/* Payment Security */}
        <View style={styles.securityContainer}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted. We do not store your card details.
          </Text>
        </View>
      </ScrollView>
      
      {/* Payment Button */}
      <View style={styles.payButtonContainer}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayNow}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.payButtonText}>Pay Now</Text>
          )}
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  paymentHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  paymentTitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  methodSelectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodItem: {
    width: '31%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  paymentMethodItemSelected: {
    backgroundColor: 'rgba(51, 51, 51, 0.05)',
    borderColor: '#333333',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentMethodLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666666',
    fontWeight: '500',
  },
  paymentMethodLabelSelected: {
    color: '#333333',
    fontWeight: '600',
  },
  paymentFormContainer: {
    marginBottom: 25,
  },
  paymentMethodForm: {
    marginTop: 10,
  },
  formLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333333',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  formColumn: {
    width: '48%',
  },
  upiNote: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  upiNoteText: {
    fontSize: 14,
    color: '#555555',
  },
  bankList: {
    marginBottom: 16,
  },
  bankItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 14,
    marginBottom: 8,
  },
  bankItemSelected: {
    backgroundColor: 'rgba(51, 51, 51, 0.05)',
    borderColor: '#333333',
  },
  bankItemText: {
    fontSize: 16,
    color: '#666666',
  },
  bankItemTextSelected: {
    color: '#333333',
    fontWeight: '500',
  },
  netbankingNote: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  netbankingNoteText: {
    fontSize: 14,
    color: '#555555',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  securityText: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  payButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  payButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentGatewayScreen; 