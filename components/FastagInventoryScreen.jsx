import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, ScrollView } from 'react-native';
import { db } from '../services/firebase';
import { collection, query, getDocs, where, orderBy, limit, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const FastagInventoryScreen = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalTransactions: 0,
    walletBalance: 0,
    totalAllocatedTags: 0,
    activeTags: 0,
    inactiveTags: 0,
    pendingTags: 0,
    usedTags: 0,
    recentTransactions: [],
    transactionHistory: {
      credit: 0,
      debit: 0
    }
  });

  // Fetch inventory data and analytics from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo || !userInfo.uid) return;
      
      setIsLoading(true);
      try {
        // PART 1: Fetch inventory data
        await fetchInventory();
        
        // PART 2: Fetch analytics data
        await fetchAnalytics();
      } catch (error) {
        console.error('Error fetching inventory and analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up a focus listener to refresh data when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Inventory screen focused, refreshing data');
      fetchData();
    });
    
    return unsubscribe;
  }, [navigation, userInfo]);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      console.log('Fetching FastTag inventory for user:', userInfo.uid);
      
      // Try to fetch from 'fastags' collection first
      let fastagQuery = query(
        collection(db, 'fastags'),
        where('allocatedTo', '==', userInfo.uid)
      );
      
      let querySnapshot = await getDocs(fastagQuery);
      console.log('fastags collection query returned:', querySnapshot.size, 'documents');
      
      // If no results, try looking in the allocatedFasTags collection
      if (querySnapshot.empty) {
        console.log('No results in fastags collection, trying allocatedFasTags collection');
        
        // Get user BC_Id from profile
        const userRef = doc(db, 'users', userInfo.uid);
        const userDoc = await getDoc(userRef);
        const bcId = userDoc.exists() ? (userDoc.data().bcId || userDoc.data().BC_Id) : null;
        
        if (bcId) {
          console.log('Found BC ID:', bcId);
          fastagQuery = query(
            collection(db, 'allocatedFasTags'),
            where('bcId', '==', bcId)
          );
          
          querySnapshot = await getDocs(fastagQuery);
          console.log('allocatedFasTags collection query returned:', querySnapshot.size, 'documents');
        } else {
          console.log('No BC ID found in user profile');
        }
      }
      
      const fastagData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Handle different data structures between collections
        fastagData.push({
          id: doc.id,
          tagId: data.tagId || data.barcode || data.serialNumber || 'Unknown',
          status: data.status || 'Inactive',
          customerName: data.customerName || data.customerDetails?.name || '-',
          activationDate: data.activationDate ? new Date(data.activationDate.seconds * 1000).toLocaleDateString() : '-'
        });
      });
      
      console.log('Processed inventory data:', fastagData.length, 'items');
      setInventory(fastagData);
    } catch (error) {
      console.error('Error fetching fastag inventory:', error);
      setInventory([]);
    }
  };

  // Fetch analytics data from multiple sources
  const fetchAnalytics = async () => {
    const analyticsData = {
      totalTransactions: 0,
      walletBalance: 0,
      totalAllocatedTags: 0,
      activeTags: 0,
      inactiveTags: 0,
      pendingTags: 0,
      usedTags: 0,
      recentTransactions: [],
      transactionHistory: {
        credit: 0,
        debit: 0
      }
    };

    try {
      // 1. Get wallet balance
      const userRef = doc(db, 'users', userInfo.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        analyticsData.walletBalance = userData.wallet || 0;
        console.log('Wallet balance fetched successfully:', analyticsData.walletBalance);
      } else {
        console.log('User document not found in Firestore');
      }

      // 2. Get allocated tags stats
      const bcId = userDoc.exists() ? (userDoc.data().bcId || userDoc.data().BC_Id) : null;
      
      if (bcId) {
        console.log('Found BC ID:', bcId);
        const allocatedTagsQuery = query(
          collection(db, "allocatedFasTags"),
          where('bcId', '==', bcId)
        );
        
        const tagsSnapshot = await getDocs(allocatedTagsQuery);
        console.log('Allocated tags query returned:', tagsSnapshot.size, 'documents');
        
        analyticsData.totalAllocatedTags = tagsSnapshot.size;
        
        tagsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === 'available') analyticsData.activeTags++;
          else if (data.status === 'inactive') analyticsData.inactiveTags++;
          else if (data.status === 'pending_activation') analyticsData.pendingTags++;
          else if (data.status === 'used') analyticsData.usedTags++;
        });
      } else {
        console.log('No BC ID found in user profile');
      }

      // 3. Get transaction stats - FIX: Removed orderBy to avoid index issue
      try {
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', userInfo.uid),
          limit(10) // Increased limit to get more data
        );
        
        const transactionsSnapshot = await getDocs(transactionsQuery);
        console.log('Transactions query returned:', transactionsSnapshot.size, 'documents');
        
        analyticsData.totalTransactions = transactionsSnapshot.size;
        
        const allTransactions = [];
        let creditTotal = 0;
        let debitTotal = 0;
        
        transactionsSnapshot.forEach(doc => {
          const data = doc.data();
          console.log('Processing transaction:', doc.id, data);
          
          // Extract transaction data
          let timestamp = null;
          try {
            if (data.createdAt) {
              timestamp = data.createdAt instanceof Date ? data.createdAt : data.createdAt.toDate();
            } else if (data.timestamp) {
              timestamp = data.timestamp instanceof Date ? data.timestamp : data.timestamp.toDate();
            }
          } catch (err) {
            console.log('Error parsing transaction date:', err);
            timestamp = new Date();
          }
          
          const transType = data.type === 'credit' || data.type === 'recharge' ? 'credit' : 'debit';
          
          if (transType === 'credit') {
            creditTotal += Number(data.amount || 0);
          } else {
            debitTotal += Number(data.amount || 0);
          }
          
          allTransactions.push({
            id: doc.id,
            amount: data.amount || 0,
            type: transType,
            date: timestamp ? formatDate(timestamp) : '-',
            timestamp: timestamp || new Date(),
            description: data.purpose || data.description || 'Transaction'
          });
        });
        
        // Sort manually since we removed orderBy
        allTransactions.sort((a, b) => b.timestamp - a.timestamp);
        
        // Take only the first 3 for recent transactions
        analyticsData.recentTransactions = allTransactions.slice(0, 3);
        analyticsData.transactionHistory.credit = creditTotal;
        analyticsData.transactionHistory.debit = debitTotal;
      } catch (transError) {
        console.error('Error fetching transactions:', transError);
      }
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return '-';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Render inventory item
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => navigation.navigate('ManualActivation', { scannedData: item.tagId })}
    >
      <View style={styles.row}>
        <Text style={styles.tagId}>{item.tagId}</Text>
        <Text style={[
          styles.status, 
          item.status === 'Active' ? styles.activeStatus : 
          item.status === 'Inactive' ? styles.inactiveStatus : 
          styles.pendingStatus
        ]}>
          {item.status}
        </Text>
      </View>
      {/* <Text style={styles.customerName}>Customer: {item.customerName}</Text> */}
      {/* <Text style={styles.activationDate}>Activation: {item.activationDate}</Text> */}
    </TouchableOpacity>
  );

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading inventory and analytics...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        {/* Analytics Dashboard Section */}
        <View style={styles.dashboardContainer}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          
          {/* Wallet Stats */}
          <View style={styles.walletCard}>
            <Text style={styles.walletBalanceLabel}>Wallet Balance</Text>
            <Text style={styles.walletBalanceAmount}>₹ {analytics.walletBalance.toLocaleString('en-IN')}</Text>
            <TouchableOpacity 
              style={styles.viewTransactionsButton}
              onPress={() => navigation.navigate('Wallet', { screen: 'TransactionHistory' })}
            >
              <Text style={styles.viewTransactionsButtonText}>View Transactions</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tag Statistics */}
          <View style={styles.statsRowContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analytics.totalAllocatedTags}</Text>
              <Text style={styles.statLabel}>All Tags</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analytics.activeTags}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analytics.inactiveTags}</Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
          </View>
          
          <View style={styles.statsRowContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analytics.pendingTags}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analytics.usedTags}</Text>
              <Text style={styles.statLabel}>Used</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{analytics.totalTransactions}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
          </View>
          
          {/* Transaction Summary */}
          {analytics.recentTransactions.length > 0 && (
            <View style={styles.transactionSummaryContainer}>
              <View style={styles.transactionSummaryHeader}>
                <Text style={styles.transactionSummaryTitle}>Recent Transactions</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Wallet', { screen: 'TransactionHistory' })}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {analytics.recentTransactions.map((transaction, index) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'credit' || transaction.type === 'recharge' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaction.type === 'credit' || transaction.type === 'recharge' ? '+' : '-'} ₹{transaction.amount}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* Original Inventory Section */}
        <View style={styles.header}>
          <Text style={styles.title}>FASTag Inventory</Text>
          <Text style={styles.subtitle}>Total: {inventory.length} tags</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{inventory.filter(item => item.status === 'available').length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{inventory.filter(item => item.status === 'inactive').length}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{inventory.filter(item => item.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>All Tags</Text>
          {inventory.length > 0 ? (
            <FlatList
              data={inventory}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No FasTags found in your inventory</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Wallet')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6200EE',
  },
  // Dashboard styles
  dashboardContainer: {
    padding: 16,
    backgroundColor: '#EDE7F6',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 16,
  },
  walletCard: {
    backgroundColor: '#6200EE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  walletBalanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  walletBalanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  viewTransactionsButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  viewTransactionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6200EE',
  },
  transactionSummaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  transactionSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  viewAllText: {
    color: '#6200EE',
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    color: '#6200EE',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6200EE',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#E53935',
  },
  // Original inventory styles
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6200EE',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200EE',
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#E8F5E9',
    color: '#388E3C',
  },
  inactiveStatus: {
    backgroundColor: '#FFEBEE',
    color: '#D32F2F',
  },
  pendingStatus: {
    backgroundColor: '#FFF8E1',
    color: '#FFA000',
  },
  customerName: {
    fontSize: 14,
    color: '#6200EE',
    marginBottom: 4,
  },
  activationDate: {
    fontSize: 14,
    color: '#6200EE',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6200EE',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
});

export default FastagInventoryScreen; 