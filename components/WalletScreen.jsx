import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Animated,
  ActivityIndicator,
  Image,
  FlatList
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';

// Mock data for recent transactions
const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'recharge',
    amount: 500,
    date: '2023-06-15',
    time: '14:30',
    status: 'success'
  },
  {
    id: '2',
    type: 'payment',
    amount: 88,
    date: '2023-06-14',
    time: '10:15',
    status: 'success',
    to: 'NETC Toll Payment'
  },
  {
    id: '3',
    type: 'recharge',
    amount: 1000,
    date: '2023-06-10',
    time: '09:45',
    status: 'success'
  },
  {
    id: '4',
    type: 'payment',
    amount: 65,
    date: '2023-06-08',
    time: '16:22',
    status: 'success',
    to: 'NETC Toll Payment'
  }
];

const WalletScreen = ({ navigation, route }) => {
  const [walletBalance, setWalletBalance] = useState(1247.50);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [hasBankAccount, setHasBankAccount] = useState(true);
  
  // Animation values
  const balanceScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Handle refresh from route params (when returning from other screens)
  useEffect(() => {
    if (route.params?.refresh) {
      refreshWalletData();
    }
  }, [route.params]);
  
  // Animate components on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshWalletData();
      return () => {};
    }, [])
  );
  
  // Simulate fetching wallet data
  const refreshWalletData = async () => {
    setRefreshing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate data update
      setWalletBalance(prevBalance => {
        // Random small fluctuation for demo
        const change = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 20);
        return prevBalance + change;
      });
      
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Toggle balance visibility with animation
  const toggleBalanceVisibility = () => {
    Animated.sequence([
      Animated.timing(balanceScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(balanceScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    setIsBalanceVisible(!isBalanceVisible);
  };
  
  // Navigate to recharge screen
  const handleRecharge = () => {
    if (!hasBankAccount) {
      navigation.navigate('BankAccountLink');
    } else {
      navigation.navigate('WalletRecharge');
    }
  };
  
  // Navigate to wallet top-up screen (new UPI-based method)
  const handleWalletTopup = () => {
    navigation.navigate('WalletTopup');
  };
  
  // Navigate to transaction history
  const handleViewAllTransactions = () => {
    navigation.navigate('TransactionHistory');
  };
  
  // Navigate to transaction details
  const handleTransactionPress = (transaction) => {
    navigation.navigate('TransactionDetail', { transaction });
  };
  
  // Render transaction item
  const renderTransactionItem = ({ item }) => {
    const isRecharge = item.type === 'recharge';
    const iconName = isRecharge ? 'arrow-down-circle' : 'arrow-up-circle';
    const iconColor = isRecharge ? '#4CAF50' : '#E53935';
    const transactionTitle = isRecharge 
      ? 'Wallet Recharge' 
      : (item.to || 'Payment');
    
    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={[styles.transactionIconContainer, { backgroundColor: isRecharge ? '#E8F5E9' : '#FFEBEE' }]}>
          <FeatherIcon name={iconName} size={24} color={iconColor} />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{transactionTitle}</Text>
          <Text style={styles.transactionDate}>
            {item.date} • {item.time}
          </Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, { color: isRecharge ? '#4CAF50' : '#E53935' }]}>
            {isRecharge ? '+' : '-'} ₹{item.amount}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: item.status === 'success' ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.statusText, { color: item.status === 'success' ? '#4CAF50' : '#E53935' }]}>
              {item.status === 'success' ? 'Success' : 'Failed'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refreshWalletData} 
            colors={['#333333']}
          />
        }
      >
        {/* Wallet Balance Card */}
        <Animated.View 
          style={[
            styles.balanceCard,
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: balanceScale }
              ]
            }
          ]}
        >
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
            <TouchableOpacity 
              onPress={toggleBalanceVisibility}
              style={styles.visibilityToggle}
            >
              <Icon 
                name={isBalanceVisible ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.balanceAmount}>
              {isBalanceVisible 
                ? walletBalance.toFixed(2) 
                : '• • • • •'}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleRecharge}
            >
              <View style={styles.buttonIconContainer}>
                <Icon name="cash-plus" size={22} color="#00ACC1" />
              </View>
              <Text style={styles.actionButtonText}>Recharge</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleWalletTopup}
            >
              <View style={styles.buttonIconContainer}>
                <Icon name="bank-transfer-in" size={22} color="#00ACC1" />
              </View>
              <Text style={styles.actionButtonText}>UPI Top-up</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PaymentGateway')}
            >
              <View style={styles.buttonIconContainer}>
                <Icon name="credit-card-outline" size={22} color="#00ACC1" />
              </View>
              <Text style={styles.actionButtonText}>Pay</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* Recent Transactions */}
        <Animated.View 
          style={[
            styles.transactionsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.transactionsList}
            />
          ) : (
            <View style={styles.emptyTransactions}>
              <Icon name="history" size={48} color="#CCCCCC" />
              <Text style={styles.emptyTransactionsText}>No transactions yet</Text>
            </View>
          )}
        </Animated.View>
        
        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.quickActionsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionGrid}>
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('Support')}
            >
              <View style={styles.quickActionIconContainer}>
                <Icon name="face-agent" size={24} color="#333333" />
              </View>
              <Text style={styles.quickActionText}>Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('TransactionHistory')}
            >
              <View style={styles.quickActionIconContainer}>
                <Icon name="history" size={24} color="#333333" />
              </View>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.quickActionIconContainer}>
                <Icon name="cog-outline" size={24} color="#333333" />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  container: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#333333',
    borderRadius: 20,
    padding: 20,
    margin: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#DDDDDD',
    fontWeight: '500',
  },
  visibilityToggle: {
    padding: 5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 5,
    marginBottom: 3,
  },
  balanceAmount: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconContainer: {
    backgroundColor: '#F0F0F0',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  viewAllButton: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  transactionsList: {
    paddingBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999999',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyTransactions: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTransactionsText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 10,
  },
  quickActionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 15,
    marginBottom: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  quickActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    width: '30%',
  },
  quickActionIconContainer: {
    backgroundColor: '#F0F0F0',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
  },
  spacer: {
    height: 30,
  },
});

export default WalletScreen; 