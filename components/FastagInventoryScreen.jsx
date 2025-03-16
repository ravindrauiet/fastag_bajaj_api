import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

// Dummy data for inventory
const dummyInventory = [
  { id: '1', tagId: 'FT123456789', status: 'Active', customerName: 'John Doe', activationDate: '12/03/2024' },
  { id: '2', tagId: 'FT987654321', status: 'Inactive', customerName: 'Jane Smith', activationDate: '-' },
  { id: '3', tagId: 'FT456123789', status: 'Active', customerName: 'Robert Johnson', activationDate: '10/03/2024' },
  { id: '4', tagId: 'FT789456123', status: 'Pending', customerName: 'Alice Brown', activationDate: '-' },
  { id: '5', tagId: 'FT321654987', status: 'Active', customerName: 'Michael Wilson', activationDate: '05/03/2024' },
];

const FastagInventoryScreen = ({ navigation }) => {
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
      <Text style={styles.customerName}>Customer: {item.customerName}</Text>
      <Text style={styles.activationDate}>Activation: {item.activationDate}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>FASTag Inventory</Text>
        <Text style={styles.subtitle}>Total: {dummyInventory.length} tags</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{dummyInventory.filter(item => item.status === 'Active').length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{dummyInventory.filter(item => item.status === 'Inactive').length}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{dummyInventory.filter(item => item.status === 'Pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>All Tags</Text>
        <FlatList
          data={dummyInventory}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('BarcodeScanner')}
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
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  item: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    color: '#333333',
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
    color: '#666666',
    marginBottom: 4,
  },
  activationDate: {
    fontSize: 14,
    color: '#666666',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
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