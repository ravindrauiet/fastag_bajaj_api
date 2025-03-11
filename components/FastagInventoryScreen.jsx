import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FASTag Inventory</Text>
        <Text style={styles.subtitle}>Total: {dummyInventory.length} tags</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={() => navigation.navigate('BarcodeScanner')}
      >
        <Text style={styles.scanButtonText}>Scan New Tag</Text>
      </TouchableOpacity>
      
      <FlatList
        data={dummyInventory}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeStatus: {
    backgroundColor: '#e6f7e6',
    color: '#2e7d32',
  },
  inactiveStatus: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  pendingStatus: {
    backgroundColor: '#fff8e1',
    color: '#f57f17',
  },
  customerName: {
    fontSize: 14,
    marginBottom: 4,
  },
  activationDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default FastagInventoryScreen; 