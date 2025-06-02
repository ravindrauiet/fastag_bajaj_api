import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height } = Dimensions.get('window');

const PaymentStatusModal = ({ 
  visible, 
  status, 
  amount,
  newBalance,
  transactionId,
  errorMessage,
  onClose,
  onGoToWallet,
  onGoToHome 
}) => {
  // Animation values
  const slideAnim = new Animated.Value(height);
  const fadeAnim = new Animated.Value(0);
  
  useEffect(() => {
    if (visible) {
      // Animate modal in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Animate modal out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Status Icon */}
          <View style={[
            styles.iconCircle,
            status === 'success' ? styles.successCircle : styles.failureCircle
          ]}>
            <Icon 
              name={status === 'success' ? 'check' : 'close'} 
              size={40} 
              color="#FFFFFF" 
            />
          </View>

          {/* Status Title */}
          <Text style={styles.statusTitle}>
            {status === 'success' ? 'Payment Successful!' : 'Payment Failed!'}
          </Text>

          {/* Amount */}
          <Text style={styles.amountText}>₹{amount.toLocaleString('en-IN')}</Text>

          {status === 'success' && (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>New Wallet Balance</Text>
              <Text style={styles.balanceAmount}>₹{newBalance.toLocaleString('en-IN')}</Text>
            </View>
          )}

          {status === 'failure' && errorMessage && (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          )}

          {/* Transaction ID */}
          <Text style={styles.transactionId}>Transaction ID: {transactionId}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.walletButton}
              onPress={onGoToWallet}
            >
              <Text style={styles.walletButtonText}>Go to Wallet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={onGoToHome}
            >
              <Text style={styles.homeButtonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(98, 0, 238, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successCircle: {
    backgroundColor: '#6200EE',
    shadowColor: '#6200EE',
  },
  failureCircle: {
    backgroundColor: '#FF5252',
    shadowColor: '#FF5252',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 16,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 16,
  },
  balanceContainer: {
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6200EE',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  errorMessage: {
    fontSize: 16,
    color: '#FF5252',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  transactionId: {
    fontSize: 14,
    color: '#6200EE',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  walletButton: {
    flex: 1,
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  walletButtonText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#6200EE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentStatusModal; 