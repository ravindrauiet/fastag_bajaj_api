import React, { useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Image
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';

const PaymentFailureScreen = ({ navigation, route }) => {
  // Get transaction details from route params
  const { 
    amount, 
    source, 
    errorCode = 'ERR_PAYMENT_FAILED',
    errorMessage = 'Transaction could not be completed due to a payment processing error.'
  } = route.params || {};
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);
  
  // Get notification context
  const { addNotification } = useContext(NotificationContext);
  
  // Format date
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  // Format time
  const formattedTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Run animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
    
    // Add notification about failed payment
    addNotification({
      id: Date.now(),
      message: `Payment of ₹${amount} failed`,
      time: 'Just now',
      read: false
    });
  }, []);
  
  // Determine title based on source
  const getTitle = () => {
    switch (source) {
      case 'wallet_recharge':
        return 'Wallet Recharge Failed';
      case 'fastag_recharge':
        return 'FasTag Recharge Failed';
      default:
        return 'Payment Failed';
    }
  };
  
  // Retry payment
  const handleRetryPayment = () => {
    // Navigate back to the payment screen
    navigation.goBack();
  };
  
  // Go back to source
  const handleCancel = () => {
    switch (source) {
      case 'wallet_recharge':
        navigation.navigate('Wallet');
        break;
      case 'fastag_recharge':
        navigation.navigate('HomeScreen');
        break;
      default:
        navigation.navigate('HomeScreen');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View 
          style={[
            styles.contentContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Failure Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.failureIconCircle}>
              <Text style={styles.failureIcon}>✕</Text>
            </View>
          </View>
          
          {/* Failure Message */}
          <Text style={styles.failureTitle}>{getTitle()}</Text>
          <Text style={styles.failureMessage}>
            {errorMessage}
          </Text>
          
          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>₹{amount.toLocaleString('en-IN')}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Error Code</Text>
              <Text style={styles.detailValue}>{errorCode}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formattedTime}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Failed</Text>
              </View>
            </View>
          </View>
          
          {/* Troubleshooting Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Troubleshooting Tips</Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Check your internet connection</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Verify your payment method details</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Ensure you have sufficient funds</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Try a different payment method</Text>
            </View>
          </View>
          
          {/* Support */}
          <Text style={styles.supportText}>
            Need help? Contact our support team at support@tmsquare.com
          </Text>
        </Animated.View>
      </ScrollView>
      
      {/* Bottom Buttons */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetryPayment}
        >
          <Text style={styles.retryButtonText}>Retry Payment</Text>
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
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  failureIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failureIcon: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  failureTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  failureMessage: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53935',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#FB8C00',
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  supportText: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentFailureScreen; 