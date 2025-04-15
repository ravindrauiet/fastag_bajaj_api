import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Share
} from 'react-native';

const TransactionDetailScreen = ({ navigation, route }) => {
  // Get transaction from route params
  const { transaction } = route.params || {};
  
  // If transaction is missing, show error state
  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction details not available</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Generate reference number if not available
  const referenceNumber = transaction.referenceNumber || `REF${Math.floor(Math.random() * 10000000)}`;
  
  // Handle share transaction
  const handleShareTransaction = async () => {
    try {
      const shareMessage = `
Transaction Details
------------------
Type: ${transaction.type === 'credit' ? 'Credit' : 'Debit'}
Amount: ₹${transaction.amount.toLocaleString('en-IN')}
Description: ${transaction.description}
Date & Time: ${transaction.date} ${transaction.time}
Payment Method: ${transaction.paymentMethod}
Reference Number: ${referenceNumber}
Status: ${transaction.status}
      `;
      
      await Share.share({
        message: shareMessage.trim(),
        title: 'Transaction Details'
      });
    } catch (error) {
      console.error('Error sharing transaction:', error);
    }
  };
  
  // Handle downloading receipt (just a placeholder action)
  const handleDownloadReceipt = () => {
    // In a real app, this would trigger the generation and download of a PDF receipt
    alert('Receipt download feature will be implemented by backend team.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Transaction Header */}
        <View style={styles.transactionHeader}>
          <View style={[
            styles.transactionIconContainer,
            { backgroundColor: transaction.type === 'credit' ? '#E8F5E9' : '#FFEBEE' }
          ]}>
            <Text style={styles.transactionIconText}>
              {transaction.type === 'credit' ? '↓' : '↑'}
            </Text>
          </View>
          
          <Text style={styles.transactionTitle}>
            {transaction.type === 'credit' ? 'Amount Received' : 'Amount Paid'}
          </Text>
          
          <Text style={[
            styles.transactionAmount,
            { color: transaction.type === 'credit' ? '#2E7D32' : '#C62828' }
          ]}>
            {transaction.type === 'credit' ? '+' : '-'} ₹{transaction.amount.toLocaleString('en-IN')}
          </Text>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: transaction.status === 'Completed' ? '#4CAF50' : '#FB8C00' }
            ]} />
            <Text style={[
              styles.statusText,
              { color: transaction.status === 'Completed' ? '#4CAF50' : '#FB8C00' }
            ]}>
              {transaction.status}
            </Text>
          </View>
        </View>
        
        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Transaction Details</Text>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{transaction.description}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{transaction.date}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{transaction.time}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference Number</Text>
              <Text style={styles.detailValue}>{referenceNumber}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: transaction.status === 'Completed' ? '#4CAF50' : '#FB8C00' }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: transaction.status === 'Completed' ? '#4CAF50' : '#FB8C00' }
                ]}>
                  {transaction.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShareTransaction}
          >
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDownloadReceipt}
          >
            <Text style={styles.actionButtonIcon}>📄</Text>
            <Text style={styles.actionButtonText}>Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Support', { referenceNumber })}
          >
            <Text style={styles.actionButtonIcon}>❓</Text>
            <Text style={styles.actionButtonText}>Help</Text>
          </TouchableOpacity>
        </View>
        
        {/* Additional Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {transaction.type === 'credit' 
              ? 'Amount has been credited to your wallet balance.' 
              : 'Amount has been debited from your wallet balance.'}
          </Text>
          <Text style={styles.infoText}>
            For any issues related to this transaction, please contact customer support.
          </Text>
        </View>
        
        {/* Similar Transactions Button */}
        {transaction.type === 'debit' && transaction.description.includes('FasTag') && (
          <TouchableOpacity 
            style={styles.similarTransactionsButton}
            onPress={() => navigation.navigate('TransactionHistory', { 
              filterType: 'debit',
              searchQuery: 'FasTag'
            })}
          >
            <Text style={styles.similarTransactionsText}>View Similar Transactions</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    paddingBottom: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  transactionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  transactionIconText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  transactionTitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 30,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  detailsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
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
    fontWeight: '500',
    color: '#333333',
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 8,
  },
  similarTransactionsButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  similarTransactionsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TransactionDetailScreen; 