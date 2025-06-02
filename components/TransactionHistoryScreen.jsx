import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, getDoc, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Transaction types for filtering
const TRANSACTION_TYPES = [
  { label: 'All', value: 'all' },
  { label: 'Credit', value: 'credit' },
  { label: 'Debit', value: 'debit' }
];

const TransactionHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const auth = getAuth();

  // Load transaction data
  useEffect(() => {
    loadTransactions();
  }, []);

  // Apply filters when filter or search changes
  useEffect(() => {
    applyFilters();
  }, [activeFilter, searchQuery, transactions]);

  // Format date to DD MMM YYYY
  const formatDate = (date) => {
    if (!date) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(date);
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    
    return `${day} ${month} ${year}`;
  };
  
  // Format time to HH:MM AM/PM
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    return `${hours}:${minutes} ${ampm}`;
  };

  // Load transactions from Firebase
  const loadTransactions = async () => {
    setLoading(true);
    
    try {
      // Check Firebase connection and auth status
      console.log('=========== FIREBASE CONNECTION DIAGNOSTIC ===========');
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('ERROR: No user is signed in. Authentication required to fetch transactions.');
        setLoading(false);
        return;
      }
      
      console.log('User authenticated:', currentUser.uid);
      const userId = currentUser.uid;
      let allTransactions = [];
      
      // Verify Firebase configuration
      console.log('Checking database connection...');
      try {
        // Try a simple test query to ensure Firebase is working
        const testQuery = query(
          collection(db, 'transactions'), 
          limit(1)
        );
        const testSnapshot = await getDocs(testQuery);
        console.log('Database connection successful. Test query returned:', testSnapshot.size, 'documents');
      } catch (error) {
        console.error('DATABASE CONNECTION ERROR:', error);
        console.log('This may indicate a problem with Firebase configuration or network connectivity');
      }
      
      // Get transactions from transactions collection - WITHOUT filtering by userId first
      console.log('=========== CHECKING ALL TRANSACTIONS ===========');
      try {
        // First, get ALL transactions (limited to 20 for performance)
        const allTransactionsRef = collection(db, 'transactions');
        const allTransactionsQuery = query(allTransactionsRef, limit(20));
        const allTransactionsSnapshot = await getDocs(allTransactionsQuery);
        
        console.log(`Found ${allTransactionsSnapshot.size} total transactions in database (limited to 20)`);
        
        // Check the userId field in these transactions
        let foundUserIds = new Set();
        allTransactionsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId) {
            foundUserIds.add(data.userId);
          }
          
          // Log the first few transactions for debugging
          console.log(`Transaction ${doc.id}:`, {
            userId: data.userId || 'MISSING',
            amount: data.amount || 'MISSING',
            type: data.type || 'MISSING',
            timestamp: data.timestamp ? 'EXISTS' : 'MISSING'
          });
        });
        
        console.log('User IDs found in transactions:', Array.from(foundUserIds));
        console.log('Current user ID:', userId);
        
        if (!foundUserIds.has(userId)) {
          console.log('IMPORTANT: Current user ID not found in any transactions!');
          console.log('This may indicate that the transactions are stored with a different userId');
        }
      } catch (error) {
        console.error('Error checking all transactions:', error);
      }
      
      // Get transactions from transactions collection
      console.log('=========== TRANSACTIONS COLLECTION QUERY ===========');
      try {
        const transactionsRef = collection(db, 'transactions');
        
        // Check if the collection exists
        try {
          const emptyQuery = query(transactionsRef, limit(1));
          const emptySnapshot = await getDocs(emptyQuery);
          console.log('Transactions collection exists:', emptySnapshot.size > 0 ? 'Yes' : 'No (empty)');
        } catch (error) {
          console.error('Error checking transactions collection:', error);
        }
        
        console.log('Querying transactions for user:', userId);
        const transactionsQuery = query(
          transactionsRef,
          where('userId', '==', userId)
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        console.log('Transaction query results:', transactionsSnapshot.size, 'documents');
        
        if (transactionsSnapshot.empty) {
          console.log('No transactions found for this user. This may be because:');
          console.log('1. The user has no transactions');
          console.log('2. The userId field in transactions might be different from auth.currentUser.uid');
          console.log('3. There might be a missing index in Firestore');
          
          // Let's try alternate user ID formats
          console.log('Trying alternate user ID formats...');
          
          // Some databases store user IDs in different formats
          const alternateUserIds = [
            userId.toLowerCase(), 
            userId.toUpperCase(),
            `user_${userId}`,
            userId.replace(/-/g, '')
          ];
          
          for (const altUserId of alternateUserIds) {
            console.log(`Trying alternate userId: ${altUserId}`);
            const altQuery = query(
              transactionsRef,
              where('userId', '==', altUserId)
            );
            
            const altSnapshot = await getDocs(altQuery);
            if (altSnapshot.size > 0) {
              console.log(`Found ${altSnapshot.size} transactions with alternate userId: ${altUserId}`);
              
              // Process these transactions
              altSnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`Found transaction with alternate userId: ${doc.id}`);
                
                // Add to our transactions list using the same processing logic
                let timestamp;
                if (data.timestamp) {
                  timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                } else if (data.createdAt) {
                  timestamp = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                } else if (data.date) {
                  timestamp = data.date?.toDate ? data.date.toDate() : new Date(data.date);
                } else if (data.updatedAt) {
                  timestamp = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
                } else {
                  timestamp = new Date();
                }
                
                // Check for required fields
                if (!data.amount) {
                  console.log(`Transaction ${doc.id} has no amount field, using default of 0`);
                }
                
                // Determine transaction type
                let transactionType;
                if (data.type === 'credit') {
                  transactionType = 'credit';
                } else if (data.type === 'recharge') {
                  transactionType = 'credit';
                } else if (data.purpose && data.purpose.toLowerCase().includes('recharge')) {
                  transactionType = 'credit';
                } else {
                  transactionType = 'debit';
                }
                
                let details = data.details || {};
                
                allTransactions.push({
                  id: doc.id,
                  transactionId: data.transactionId || doc.id,
                  type: transactionType,
                  amount: data.amount || 0,
                  date: formatDate(timestamp),
                  time: formatTime(timestamp),
                  description: data.purpose || data.description || 'Transaction',
                  status: data.status || 'Pending',
                  paymentMethod: data.method || data.paymentMethod || 'Wallet',
                  previousBalance: data.previousBalance,
                  newBalance: data.newBalance,
                  details: details
                });
              });
            }
          }
        }
        
        // Process transactions for the main user ID
        transactionsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`Processing transaction: ${doc.id}`);
          
          // Handle missing amount field
          if (!data.amount) {
            console.log(`Transaction ${doc.id} has no amount field, using default of 0`);
          }
          
          // Handle various timestamp field names
          let timestamp;
          if (data.timestamp) {
            timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          } else if (data.createdAt) {
            timestamp = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          } else if (data.date) {
            timestamp = data.date?.toDate ? data.date.toDate() : new Date(data.date);
          } else if (data.updatedAt) {
            timestamp = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
          } else {
            timestamp = new Date(); // Fallback to current date if no timestamp found
          }
          
          // Determine transaction type based on data
          let transactionType;
          if (data.type === 'credit') {
            transactionType = 'credit';
          } else if (data.type === 'recharge') {
            transactionType = 'credit'; // Consider recharge as credit
          } else if (data.purpose && data.purpose.toLowerCase().includes('recharge')) {
            transactionType = 'credit'; // Purpose contains recharge
          } else {
            transactionType = 'debit'; // Default to debit for other transactions
          }
          
          let details = data.details || {};
          
          allTransactions.push({
            id: doc.id,
            transactionId: data.transactionId || doc.id,
            type: transactionType,
            amount: data.amount || 0,
            date: formatDate(timestamp),
            time: formatTime(timestamp),
            description: data.purpose || data.description || 'Transaction',
            status: data.status || 'Pending',
            paymentMethod: data.method || data.paymentMethod || 'Wallet',
            previousBalance: data.previousBalance,
            newBalance: data.newBalance,
            details: details
          });
        });
        
        console.log(`Processed ${allTransactions.length} transactions from transactions collection`);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        
        // Check if the error is related to missing index
        if (error.toString().includes('The query requires an index')) {
          console.log('ERROR: This query requires a Firestore index. Follow the link in the error message to create it.');
          console.log('After creating the index, it may take a few minutes to become active.');
        }
      }
      
      // Get wallet top-ups
      console.log('=========== WALLET TOP-UPS COLLECTION QUERY ===========');
      try {
        const topupsRef = collection(db, 'wallet_topups');
        
        // Check if the collection exists
        try {
          const emptyQuery = query(topupsRef, limit(1));
          const emptySnapshot = await getDocs(emptyQuery);
          console.log('wallet_topups collection exists:', emptySnapshot.size > 0 ? 'Yes' : 'No (empty)');
        } catch (error) {
          console.error('Error checking wallet_topups collection:', error);
        }
        
        console.log('Querying wallet_topups for user:', userId);
        const topupsQuery = query(
          topupsRef,
          where('userId', '==', userId)
        );
        
        const topupsSnapshot = await getDocs(topupsQuery);
        console.log('Wallet top-ups query results:', topupsSnapshot.size, 'documents');
        
        if (topupsSnapshot.empty) {
          console.log('No wallet top-ups found for this user. This may be because:');
          console.log('1. The user has no wallet top-ups');
          console.log('2. The userId field in wallet_topups might be different from auth.currentUser.uid');
          console.log('3. There might be a missing index in Firestore');
          
          // Similar to transactions, try alternate user ID formats
          console.log('Trying alternate user ID formats for wallet_topups...');
          
          const alternateUserIds = [
            userId.toLowerCase(), 
            userId.toUpperCase(),
            `user_${userId}`,
            userId.replace(/-/g, '')
          ];
          
          for (const altUserId of alternateUserIds) {
            console.log(`Trying alternate userId: ${altUserId}`);
            const altQuery = query(
              topupsRef,
              where('userId', '==', altUserId)
            );
            
            const altSnapshot = await getDocs(altQuery);
            if (altSnapshot.size > 0) {
              console.log(`Found ${altSnapshot.size} wallet top-ups with alternate userId: ${altUserId}`);
              
              // Process these wallet top-ups using the existing processing logic
              // Process these transactions
              altSnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`Found wallet top-up with alternate userId: ${doc.id}`);
                
                // Process with same logic as regular top-ups
                // Handle timestamp for wallet top-ups
                let timestamp;
                if (data.timestamp) {
                  timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                } else if (data.createdAt) {
                  timestamp = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                } else if (data.date) {
                  timestamp = data.date?.toDate ? data.date.toDate() : new Date(data.date);
                } else if (data.updatedAt) {
                  timestamp = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
                } else {
                  timestamp = new Date(); // Fallback to current date if no timestamp found
                }
                
                // Check for required fields
                if (!data.amount) {
                  console.log(`Wallet top-up ${doc.id} has no amount field, using default of 0`);
                }
                
                // Note: For wallet_topups, we always consider them as credit transactions
                // The "type" field may be "recharge" or other value, but these are always credits
                allTransactions.push({
                  id: doc.id,
                  transactionId: data.transactionId || doc.id,
                  type: 'credit', // Always credit for wallet top-ups, regardless of type field
                  amount: data.amount || 0,
                  date: formatDate(timestamp),
                  time: formatTime(timestamp),
                  description: data.description || 'Wallet Recharge',
                  status: data.status === 'approved' ? 'Completed' : 
                         data.status === 'success' ? 'Completed' :
                         data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Pending',
                  paymentMethod: data.method || data.paymentMethod || 'UPI',
                  previousBalance: data.previousBalance,
                  newBalance: data.newBalance,
                  details: {
                    collection: data.collection || 'wallet_topups',
                    relatedDocId: data.relatedDocId || null,
                    method: data.method || null,
                    userName: data.userName || null,
                    ...data.details || {}
                  }
                });
              });
            }
          }
        }
        
        // Process wallet top-ups
        topupsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`Processing wallet top-up: ${doc.id}`);
          
          // Handle missing amount field
          if (!data.amount) {
            console.log(`Wallet top-up ${doc.id} has no amount field, using default of 0`);
          }
          
          // Handle timestamp for wallet top-ups
          let timestamp;
          if (data.timestamp) {
            timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          } else if (data.createdAt) {
            timestamp = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          } else if (data.date) {
            timestamp = data.date?.toDate ? data.date.toDate() : new Date(data.date);
          } else if (data.updatedAt) {
            timestamp = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
          } else {
            timestamp = new Date(); // Fallback to current date if no timestamp found
          }
          
          // Check for required fields
          if (!data.amount) {
            console.log(`Wallet top-up ${doc.id} has no amount field, using default of 0`);
          }
          
          // Note: For wallet_topups, we always consider them as credit transactions
          // The "type" field may be "recharge" or other value, but these are always credits
          allTransactions.push({
            id: doc.id,
            transactionId: data.transactionId || doc.id,
            type: 'credit', // Always credit for wallet top-ups, regardless of type field
            amount: data.amount || 0,
            date: formatDate(timestamp),
            time: formatTime(timestamp),
            description: data.description || 'Wallet Recharge',
            status: data.status === 'approved' ? 'Completed' : 
                   data.status === 'success' ? 'Completed' :
                   data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Pending',
            paymentMethod: data.method || data.paymentMethod || 'UPI',
            previousBalance: data.previousBalance,
            newBalance: data.newBalance,
            details: {
              collection: data.collection || 'wallet_topups',
              relatedDocId: data.relatedDocId || null,
              method: data.method || null,
              userName: data.userName || null,
              ...data.details || {}
            }
          });
        });
        
        console.log(`Added ${topupsSnapshot.size} wallet top-ups to transactions list`);
      } catch (error) {
        console.error('Error fetching wallet top-ups:', error);
        
        // Check if the error is related to missing index
        if (error.toString().includes('The query requires an index')) {
          console.log('ERROR: This query requires a Firestore index. Follow the link in the error message to create it.');
          console.log('After creating the index, it may take a few minutes to become active.');
        }
      }
      
      // Final summary
      console.log('=========== RESULTS SUMMARY ===========');
      if (allTransactions.length === 0) {
        console.log('No transactions found. Common causes:');
        console.log('1. This user has no transactions in the database');
        console.log('2. The userId field in the database might not match the currently logged-in user');
        console.log('3. Required Firestore indexes might be missing');
        console.log('4. There might be permission issues in Firestore security rules');
      } else {
        console.log(`Total transactions found: ${allTransactions.length}`);
        console.log('Transaction types breakdown:');
        const creditCount = allTransactions.filter(t => t.type === 'credit').length;
        const debitCount = allTransactions.filter(t => t.type === 'debit').length;
        console.log(`- Credit transactions: ${creditCount}`);
        console.log(`- Debit transactions: ${debitCount}`);
      }
      
      // Sort by date in JavaScript instead of Firestore
      allTransactions.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;  // Sort in descending order (newest first)
      });
      
      console.log('First few transactions after sorting:');
      allTransactions.slice(0, 3).forEach((t, i) => {
        console.log(`${i+1}.`, {
          id: t.id,
          type: t.type,
          amount: t.amount,
          date: t.date,
          time: t.time,
          description: t.description
        });
      });
      
      setTransactions(allTransactions);
      
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh transaction list
  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  // Apply active filter and search
  const applyFilters = () => {
    let result = [...transactions];
    
    // Apply type filter
    if (activeFilter !== 'all') {
      result = result.filter(item => item.type === activeFilter);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.date && item.date.toLowerCase().includes(query)) ||
        (item.time && item.time.toLowerCase().includes(query)) ||
        (item.paymentMethod && item.paymentMethod.toLowerCase().includes(query)) ||
        (item.status && item.status.toLowerCase().includes(query)) ||
        (item.amount && item.amount.toString().includes(query)) ||
        (item.details && item.details.userName && item.details.userName.toLowerCase().includes(query))
      );
    }
    
    console.log(`Applied filters: ${activeFilter} filter, search: "${searchQuery}". Results: ${result.length} transactions`);
    setFilteredTransactions(result);
  };

  // Set active filter
  const handleFilterChange = (filterValue) => {
    setActiveFilter(filterValue);
  };

  // Handle search input change
  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  // View transaction details
  const handleTransactionPress = (transaction) => {
    navigation.navigate('TransactionDetail', { transaction });
  };

  // Transaction item renderer
  const renderTransactionItem = ({ item }) => {
    console.log('Rendering transaction item:', item.id, item.type, item.amount, item.description);
    const isCredit = item.type === 'credit';
    
    // Determine if this is a FasTag registration
    const isFasTagRegistration = 
      item.description.includes('FasTag Registration') || 
      (item.details && item.details.serialNo);
    
    // Determine collection source
    const isWalletTopup = item.details && item.details.collection === 'wallet_topups';
    
    return (
      <TouchableOpacity 
        style={[
          styles.transactionItem,
          isFasTagRegistration && styles.fastagTransactionItem
        ]}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={styles.transactionIconContainer}>
          <View style={[
            styles.transactionIcon, 
            { backgroundColor: isCredit ? '#E8F5E9' : '#FFEBEE' },
            isFasTagRegistration && { backgroundColor: '#E3F2FD' }
          ]}>
            <Text style={styles.transactionIconText}>
              {isFasTagRegistration ? '🚗' : isCredit ? '↓' : '↑'}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={[
            styles.transactionDescription,
            isFasTagRegistration && styles.fastagTransactionDescription
          ]}>
            {item.description}
          </Text>
          <Text style={styles.transactionDateTime}>{item.date} • {item.time}</Text>
          
          <View style={styles.transactionDetailRow}>
            {/* Show transaction type */}
            <Text style={styles.transactionDetailText}>
              {isFasTagRegistration 
                ? `VRN: ${item.details?.vehicleNo || 'N/A'}`
                : isWalletTopup ? 'Wallet Top-up' : 'Transaction'
              }
            </Text>
            
            {/* Show payment method */}
            <Text style={styles.transactionPaymentMethod}>{item.paymentMethod}</Text>
          </View>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText, 
            { color: isCredit ? '#2E7D32' : '#C62828' }
          ]}>
            {isCredit ? '+' : '-'} ₹{item.amount.toLocaleString('en-IN')}
          </Text>
          <Text style={[
            styles.statusText,
            { color: item.status === 'Completed' || item.status === 'completed' || item.status === 'Success' || item.status === 'success' ? '#2E7D32' : 
                    item.status === 'Pending' || item.status === 'pending' ? '#FB8C00' : '#C62828' }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state component
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>No transactions found</Text>
      {searchQuery || activeFilter !== 'all' ? (
        <Text style={styles.emptyStateSubtitle}>
          Try changing your filters or search term
        </Text>
      ) : (
        <>
          <Text style={styles.emptyStateSubtitle}>
            We couldn't find any transactions linked to your account.
          </Text>
          <View style={styles.troubleshootingContainer}>
            <Text style={styles.troubleshootingTitle}>Possible reasons:</Text>
            <Text style={styles.troubleshootingItem}>• You haven't made any transactions yet</Text>
            <Text style={styles.troubleshootingItem}>• There might be a connection issue</Text>
            <Text style={styles.troubleshootingItem}>• Your account might not be linked correctly</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>Try Again</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999999"
          />
          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        {TRANSACTION_TYPES.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              activeFilter === filter.value && styles.activeFilterButton
            ]}
            onPress={() => handleFilterChange(filter.value)}
          >
            <Text style={[
              styles.filterButtonText,
              activeFilter === filter.value && styles.activeFilterButtonText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Transaction List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333333" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  searchIcon: {
    fontSize: 16,
    color: '#6200EE',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#6200EE',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#6200EE',
    fontWeight: 'bold',
  },
  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#EDE7F6',
  },
  activeFilterButton: {
    backgroundColor: '#6200EE',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6200EE',
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  transactionIconContainer: {
    marginRight: 16,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE7F6',
  },
  transactionIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6200EE',
    marginBottom: 4,
  },
  transactionDateTime: {
    fontSize: 12,
    color: '#6200EE',
    marginBottom: 2,
  },
  transactionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDetailText: {
    fontSize: 12,
    color: '#6200EE',
    marginRight: 8,
  },
  transactionPaymentMethod: {
    fontSize: 12,
    color: '#6200EE',
  },
  transactionAmount: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6200EE',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6200EE',
    textAlign: 'center',
  },
  troubleshootingContainer: {
    marginBottom: 20,
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  troubleshootingItem: {
    fontSize: 14,
    color: '#6200EE',
    marginBottom: 4,
  },
  refreshButton: {
    padding: 16,
    backgroundColor: '#6200EE',
    borderRadius: 10,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fastagTransactionItem: {
    backgroundColor: '#EDE7F6',
  },
  fastagTransactionDescription: {
    fontWeight: 'bold',
  },
});

export default TransactionHistoryScreen; 