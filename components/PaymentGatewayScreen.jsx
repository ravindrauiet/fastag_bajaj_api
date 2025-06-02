import React, { useState, useEffect, useContext } from 'react';
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
import { NotificationContext } from '../contexts/NotificationContext';
import PaymentStatusModal from './PaymentStatusModal';

// Payment methods
const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦' }
];

const PaymentGatewayScreen = ({ navigation, route }) => {
  // Get params from route
  const { amount, source = 'wallet_recharge', currentBalance = 0 } = route.params || {};
  
  // State variables
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get notification context
  const { addNotification } = useContext(NotificationContext);
  
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
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  // Format card expiry (MM/YY)
  const formatCardExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Process payment
  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate transaction ID
      const txnId = 'TXN' + Date.now();
      setTransactionId(txnId);
      
      // Simulate success/failure (80% success rate)
      const isSuccess = Math.random() < 0.8;
      
      if (isSuccess) {
        setPaymentStatus('success');
        addNotification({
          id: Date.now(),
          message: `Payment of ₹${amount} successful`,
          time: 'Just now',
          read: false
        });
      } else {
        setPaymentStatus('failure');
        setErrorMessage('Transaction declined by bank. Please try again.');
        addNotification({
          id: Date.now(),
          message: `Payment of ₹${amount} failed`,
          time: 'Just now',
          read: false
        });
      }
      
      setShowPaymentStatus(true);
      
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowPaymentStatus(false);
    if (paymentStatus === 'success') {
      navigation.goBack();
    }
  };

  // Handle go to wallet
  const handleGoToWallet = () => {
    navigation.navigate('WalletMain');
  };

  // Handle go to home
  const handleGoToHome = () => {
    navigation.navigate('HomeScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView style={styles.scrollView}>
        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amount}>₹{amount.toLocaleString('en-IN')}</Text>
        </View>
        
        {/* Payment Methods */}
        <View style={styles.methodsContainer}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          {PAYMENT_METHODS.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodButton,
                selectedPaymentMethod === method.id && styles.methodButtonActive
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <Text style={[
                styles.methodLabel,
                selectedPaymentMethod === method.id && styles.methodLabelActive
              ]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Payment Details Form */}
        <View style={styles.formContainer}>
          {selectedPaymentMethod === 'card' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                maxLength={19}
              />
              
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChangeText={(text) => setCardExpiry(formatCardExpiry(text))}
                  keyboardType="numeric"
                  maxLength={5}
                />
                
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  value={cardCvv}
                  onChangeText={setCardCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
              />
            </>
          )}
          
          {selectedPaymentMethod === 'upi' && (
            <TextInput
              style={styles.input}
              placeholder="Enter UPI ID"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
          
          {selectedPaymentMethod === 'netbanking' && (
            <ScrollView style={styles.bankList}>
              {banks.map(bank => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankOption,
                    selectedBank === bank.id && styles.bankOptionActive
                  ]}
                  onPress={() => setSelectedBank(bank.id)}
                >
                  <Text style={[
                    styles.bankName,
                    selectedBank === bank.id && styles.bankNameActive
                  ]}>
                    {bank.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
      
      {/* Pay Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>Pay ₹{amount.toLocaleString('en-IN')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Status Modal */}
      <PaymentStatusModal
        visible={showPaymentStatus}
        status={paymentStatus}
        amount={amount}
        newBalance={paymentStatus === 'success' ? currentBalance + amount : currentBalance}
        transactionId={transactionId}
        errorMessage={errorMessage}
        onClose={handleCloseModal}
        onGoToWallet={handleGoToWallet}
        onGoToHome={handleGoToHome}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  amountContainer: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  amountLabel: {
    fontSize: 16,
    color: '#6200EE',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  methodsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6200EE',
    marginBottom: 16,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 12,
    marginBottom: 12,
  },
  methodButtonActive: {
    borderColor: '#6200EE',
    backgroundColor: '#EDE7F6',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  methodLabel: {
    fontSize: 16,
    color: '#6200EE',
  },
  methodLabelActive: {
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    color: '#6200EE',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  bankList: {
    maxHeight: 200,
  },
  bankOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderRadius: 12,
    marginBottom: 8,
  },
  bankOptionActive: {
    borderColor: '#6200EE',
    backgroundColor: '#EDE7F6',
  },
  bankName: {
    fontSize: 16,
    color: '#6200EE',
  },
  bankNameActive: {
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EDE7F6',
  },
  payButton: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentGatewayScreen; 