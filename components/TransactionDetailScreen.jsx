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

  // Helper to check if a value exists and is not null or undefined
  const hasValue = (value) => value !== null && value !== undefined;
  
  // Format the date if it's in string format
  const formatDateString = (dateString) => {
    if (!dateString) return '';
    
    try {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-IN', options);
    } catch (error) {
      return dateString;
    }
  };
  
  // Format a regular date object
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('en-IN', options);
    } catch (error) {
      return date.toString();
    }
  };
  
  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    
    try {
      const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      };
      return date.toLocaleTimeString('en-IN', options);
    } catch (error) {
      return date.toString();
    }
  };
  
  // Helper to format full transaction date
  const getFullDate = () => {
    try {
      if (transaction.date && transaction.time) {
        return `${transaction.date} at ${transaction.time}`;
      } else {
        const date = new Date(`${transaction.date} ${transaction.time}`);
        return formatDateString(date);
      }
    } catch (error) {
      return `${transaction.date || ''} ${transaction.time || ''}`;
    }
  };
  
  // Get status color based on transaction status
  const getStatusColor = (status) => {
    if (!status) return '#FB8C00';
    
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus === 'completed' || lowercaseStatus === 'success' || lowercaseStatus === 'approved') {
      return '#2E7D32'; // Green
    } else if (lowercaseStatus === 'pending' || lowercaseStatus === 'processing') {
      return '#FB8C00'; // Orange
    } else if (lowercaseStatus === 'failed' || lowercaseStatus === 'declined' || lowercaseStatus === 'rejected') {
      return '#C62828'; // Red
    } else {
      return '#757575'; // Gray for other statuses
    }
  };

  // Empty state component
  const renderEmptyState = () => (
    <View style={styles.container}>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transaction details available</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Check if the transaction is a FasTag registration
  const isFasTagRegistration = transaction && 
    (transaction.purpose === 'FasTag Registration' || 
     transaction.description === 'FasTag Registration' ||
     (transaction.details && transaction.details.serialNo));
  
  // Render FasTag details section if this is a FasTag registration
  const renderFasTagDetails = () => {
    if (!isFasTagRegistration) return null;
    
    return (
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>FasTag Details</Text>
        
        {transaction.details && transaction.details.serialNo && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Serial Number</Text>
            <Text style={styles.detailValue}>{transaction.details.serialNo}</Text>
          </View>
        )}
        
        {transaction.details && transaction.details.vehicleNo && (
          <>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle Number</Text>
              <Text style={styles.detailValue}>{transaction.details.vehicleNo}</Text>
            </View>
          </>
        )}
        
        {transaction.details && transaction.details.name && (
          <>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer Name</Text>
              <Text style={styles.detailValue}>{transaction.details.name}</Text>
            </View>
          </>
        )}
      </View>
    );
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
              { backgroundColor: getStatusColor(transaction.status) }
            ]} />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(transaction.status) }
            ]}>
              {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'Status Unknown'}
            </Text>
          </View>
        </View>
        
        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Transaction Details</Text>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{transaction.transactionId || transaction.id || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{getFullDate()}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {transaction.type === 'credit' ? 'Credit (Money In)' : 'Debit (Money Out)'}
              </Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{transaction.description || 'N/A'}</Text>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{transaction.paymentMethod || 'N/A'}</Text>
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
                  { backgroundColor: getStatusColor(transaction.status) }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(transaction.status) }
                ]}>
                  {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'Status Unknown'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* FasTag Details (if applicable) */}
        {renderFasTagDetails()}
        
        {/* Amount Details */}
        <View style={styles.amountDetailsContainer}>
          <Text style={styles.amountDetailsTitle}>Amount Details</Text>
          
          <View style={styles.amountDetailsCard}>
            <View style={styles.amountDetailsRow}>
              <Text style={styles.amountDetailsLabel}>Amount</Text>
              <Text style={styles.amountDetailsValue}>₹{transaction.amount.toLocaleString('en-IN')}</Text>
            </View>
            
            {hasValue(transaction.previousBalance) && (
              <View style={styles.amountDetailsRow}>
                <Text style={styles.amountDetailsLabel}>Previous Balance</Text>
                <Text style={styles.amountDetailsValue}>₹{transaction.previousBalance.toLocaleString('en-IN')}</Text>
              </View>
            )}
            
            {hasValue(transaction.newBalance) && (
              <View style={styles.amountDetailsRow}>
                <Text style={styles.amountDetailsLabel}>New Balance</Text>
                <Text style={styles.amountDetailsValue}>₹{transaction.newBalance.toLocaleString('en-IN')}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Additional Details */}
        {transaction.details && Object.keys(transaction.details).length > 0 && (
          <View style={styles.additionalDetailsContainer}>
            <Text style={styles.additionalDetailsTitle}>Additional Details</Text>
            
            {Object.entries(transaction.details).map(([key, value]) => {
              // Skip null or undefined values
              if (value === null || value === undefined) return null;
              
              return (
                <View style={styles.additionalDetailsRow} key={key}>
                  <Text style={styles.additionalDetailsLabel}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</Text>
                  <Text style={styles.additionalDetailsValue}>{value.toString()}</Text>
                </View>
              );
            })}
          </View>
        )}
        
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
  amountDetailsContainer: {
    marginBottom: 30,
  },
  amountDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  amountDetailsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
  },
  amountDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  amountDetailsLabel: {
    fontSize: 14,
    color: '#666666',
  },
  amountDetailsValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    maxWidth: '60%',
    textAlign: 'right',
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
  additionalDetailsContainer: {
    marginBottom: 30,
  },
  additionalDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  additionalDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  additionalDetailsLabel: {
    fontSize: 14,
    color: '#666666',
  },
  additionalDetailsValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    maxWidth: '60%',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default TransactionDetailScreen; 