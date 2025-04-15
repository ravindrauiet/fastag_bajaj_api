import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';

// Quick amount options
const QUICK_AMOUNTS = [
  { label: '₹100', value: 100 },
  { label: '₹200', value: 200 },
  { label: '₹500', value: 500 },
  { label: '₹1000', value: 1000 },
  { label: '₹2000', value: 2000 }
];

const WalletRechargeScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useContext(NotificationContext);

  // Update amount
  const handleAmountChange = (text) => {
    // Allow only numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  // Set amount from quick options
  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  // Process recharge
  const handleProceedToPayment = () => {
    if (!amount || parseInt(amount) < 100) {
      Alert.alert('Invalid Amount', 'Please enter an amount of at least ₹100');
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      
      // Navigate to payment screen with amount
      navigation.navigate('PaymentGateway', { 
        amount: parseInt(amount),
        source: 'wallet_recharge'
      });
      
      // Add notification about recharge initiation
      addNotification({
        id: Date.now(),
        message: `Wallet recharge of ₹${amount} initiated`,
        time: 'Just now',
        read: false
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Amount Input Section */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Enter Amount</Text>
            <Text style={styles.amountLabel}>How much would you like to add?</Text>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0"
                keyboardType="number-pad"
                maxLength={6} // Limit to 6 digits (max ₹999,999)
                placeholderTextColor="#AAAAAA"
                autoFocus
              />
            </View>
            
            <Text style={styles.limitText}>
              Minimum: ₹100 • Maximum: ₹50,000 per transaction
            </Text>
          </View>
          
          {/* Quick Amount Options */}
          <View style={styles.quickAmountSection}>
            <Text style={styles.quickAmountTitle}>Quick Amounts</Text>
            <View style={styles.quickAmountContainer}>
              {QUICK_AMOUNTS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickAmountButton,
                    amount === item.value.toString() && styles.quickAmountButtonActive
                  ]}
                  onPress={() => handleQuickAmount(item.value)}
                >
                  <Text style={[
                    styles.quickAmountText,
                    amount === item.value.toString() && styles.quickAmountTextActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Payment Methods Info */}
          <View style={styles.paymentInfoSection}>
            <Text style={styles.paymentInfoTitle}>Supported Payment Methods</Text>
            <View style={styles.paymentMethodsContainer}>
              <View style={styles.paymentMethod}>
                <Text style={styles.paymentMethodIcon}>💳</Text>
                <Text style={styles.paymentMethodText}>Credit/Debit Cards</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text style={styles.paymentMethodIcon}>🏦</Text>
                <Text style={styles.paymentMethodText}>Net Banking</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Text style={styles.paymentMethodIcon}>📱</Text>
                <Text style={styles.paymentMethodText}>UPI</Text>
              </View>
            </View>
          </View>
          
          {/* Terms and Conditions */}
          <Text style={styles.termsText}>
            By proceeding, you agree to our Terms & Conditions for wallet transactions
          </Text>
        </ScrollView>
        
        {/* Bottom Button */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.proceedButton,
              (!amount || parseInt(amount) < 100) && styles.proceedButtonDisabled
            ]}
            onPress={handleProceedToPayment}
            disabled={!amount || parseInt(amount) < 100 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.proceedButtonText}>
                Proceed to Payment
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 90,
  },
  amountSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    paddingBottom: 10,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 30,
    fontWeight: '600',
    color: '#333333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 30,
    fontWeight: '600',
    color: '#333333',
    padding: 0,
  },
  limitText: {
    fontSize: 12,
    color: '#777777',
  },
  quickAmountSection: {
    marginBottom: 30,
  },
  quickAmountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  quickAmountButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  quickAmountButtonActive: {
    backgroundColor: 'rgba(51, 51, 51, 0.1)',
    borderColor: '#333333',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  quickAmountTextActive: {
    fontWeight: '600',
  },
  paymentInfoSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    alignItems: 'center',
    width: '30%',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555555',
  },
  termsText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  proceedButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WalletRechargeScreen; 