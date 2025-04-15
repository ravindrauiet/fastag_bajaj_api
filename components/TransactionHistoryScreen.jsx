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

  // Load transaction data
  useEffect(() => {
    loadTransactions();
  }, []);

  // Apply filters when filter or search changes
  useEffect(() => {
    applyFilters();
  }, [activeFilter, searchQuery, transactions]);

  // Load transactions
  const loadTransactions = () => {
    setLoading(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      // Mock transaction data - in a real app, this would come from an API
      const mockTransactions = [
        {
          id: '1',
          type: 'credit',
          amount: 5000,
          date: '15 Jun 2023',
          time: '10:25 AM',
          description: 'Wallet Recharge',
          status: 'Completed',
          paymentMethod: 'Credit Card'
        },
        {
          id: '2',
          type: 'debit',
          amount: 1200,
          date: '12 Jun 2023',
          time: '03:45 PM',
          description: 'FasTag Recharge - MH01AB1234',
          status: 'Completed',
          paymentMethod: 'Wallet'
        },
        {
          id: '3',
          type: 'debit',
          amount: 850,
          date: '08 Jun 2023',
          time: '11:30 AM',
          description: 'FasTag Recharge - HR05CD5678',
          status: 'Completed',
          paymentMethod: 'Wallet'
        },
        {
          id: '4',
          type: 'credit',
          amount: 10000,
          date: '01 Jun 2023',
          time: '09:15 AM',
          description: 'Wallet Recharge',
          status: 'Completed',
          paymentMethod: 'UPI'
        },
        {
          id: '5',
          type: 'debit',
          amount: 2500,
          date: '25 May 2023',
          time: '02:10 PM',
          description: 'FasTag Recharge - DL01XY9876',
          status: 'Completed',
          paymentMethod: 'Wallet'
        },
        {
          id: '6',
          type: 'credit',
          amount: 15000,
          date: '18 May 2023',
          time: '11:45 AM',
          description: 'Wallet Recharge',
          status: 'Completed',
          paymentMethod: 'Net Banking'
        },
        {
          id: '7',
          type: 'debit',
          amount: 3000,
          date: '10 May 2023',
          time: '04:30 PM',
          description: 'FasTag Recharge - KA03AB4321',
          status: 'Completed',
          paymentMethod: 'Wallet'
        },
        {
          id: '8',
          type: 'credit',
          amount: 8000,
          date: '05 May 2023',
          time: '10:00 AM',
          description: 'Wallet Recharge',
          status: 'Completed',
          paymentMethod: 'Credit Card'
        },
        {
          id: '9',
          type: 'debit',
          amount: 1800,
          date: '28 Apr 2023',
          time: '01:15 PM',
          description: 'FasTag Recharge - TN07CD9087',
          status: 'Completed',
          paymentMethod: 'Wallet'
        },
        {
          id: '10',
          type: 'credit',
          amount: 20000,
          date: '15 Apr 2023',
          time: '09:30 AM',
          description: 'Wallet Recharge',
          status: 'Completed',
          paymentMethod: 'UPI'
        }
      ];
      
      setTransactions(mockTransactions);
      setLoading(false);
      setRefreshing(false);
    }, 1500);
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
        item.description.toLowerCase().includes(query) ||
        item.date.toLowerCase().includes(query) ||
        item.paymentMethod.toLowerCase().includes(query) ||
        item.amount.toString().includes(query)
      );
    }
    
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
  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => handleTransactionPress(item)}
    >
      <View style={styles.transactionIconContainer}>
        <View style={[
          styles.transactionIcon, 
          { backgroundColor: item.type === 'credit' ? '#E8F5E9' : '#FFEBEE' }
        ]}>
          <Text style={styles.transactionIconText}>
            {item.type === 'credit' ? '↓' : '↑'}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDateTime}>{item.date} • {item.time}</Text>
        <Text style={styles.transactionPaymentMethod}>{item.paymentMethod}</Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText, 
          { color: item.type === 'credit' ? '#2E7D32' : '#C62828' }
        ]}>
          {item.type === 'credit' ? '+' : '-'} ₹{item.amount.toLocaleString('en-IN')}
        </Text>
        <Text style={[
          styles.statusText,
          { color: item.status === 'Completed' ? '#2E7D32' : '#FB8C00' }
        ]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Empty state component
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>No transactions found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery || activeFilter !== 'all' 
          ? 'Try changing your filters or search term' 
          : 'Your transaction history will appear here'}
      </Text>
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
    backgroundColor: '#F5F6F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    color: '#999999',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999999',
    fontWeight: 'bold',
  },
  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F5F5F5',
  },
  activeFilterButton: {
    backgroundColor: '#333333',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666666',
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
    color: '#666666',
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
    borderBottomColor: '#F0F0F0',
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
  },
  transactionIconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  transactionDateTime: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 2,
  },
  transactionPaymentMethod: {
    fontSize: 12,
    color: '#999999',
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
    color: '#333333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },
});

export default TransactionHistoryScreen; 