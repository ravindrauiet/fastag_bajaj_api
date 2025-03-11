import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const NETCFastagScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>NETC FASTag Services</Text>
        <Text style={styles.description}>
          Manage all your NETC FASTag related services from one place. Activate new tags, check balance, and more.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('BarcodeScanner')}
        >
          <Text style={styles.cardTitle}>Activate New FASTag</Text>
          <Text style={styles.cardDescription}>Scan or manually enter your FASTag ID to activate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Check Balance</Text>
          <Text style={styles.cardDescription}>View your current FASTag balance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Recharge</Text>
          <Text style={styles.cardDescription}>Add funds to your FASTag</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('FasTagReplacement')}
        >
          <Text style={styles.cardTitle}>Replace FASTag</Text>
          <Text style={styles.cardDescription}>Replace your damaged or lost FASTag</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#007AFF',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default NETCFastagScreen; 