import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';

const NETCFastagScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📋</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Activate New FASTag</Text>
              <Text style={styles.cardDescription}>Scan or manually enter your FASTag ID to activate</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💰</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Check Balance</Text>
              <Text style={styles.cardDescription}>View your current FASTag balance</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💳</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Recharge</Text>
              <Text style={styles.cardDescription}>Add funds to your FASTag</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('FasTagReplacement')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔄</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Replace FASTag</Text>
              <Text style={styles.cardDescription}>Replace your damaged or lost FASTag</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#6200EE',
  },
  description: {
    fontSize: 16,
    color: '#6200EE',
    marginBottom: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200EE',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EDE7F6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
    color: '#6200EE',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#6200EE',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6200EE',
  },
});

export default NETCFastagScreen; 