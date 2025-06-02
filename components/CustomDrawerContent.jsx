import React from 'react';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>Nemichand Nemi...</Text>
        <Text style={styles.userEmail}>Keshukeshu725...</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>App Version: 1.0.38</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  userInfo: {
    padding: 20,
    backgroundColor: '#6200EE',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
  },
  userName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    color: '#EDE7F6',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#EDE7F6',
    backgroundColor: '#FFFFFF',
  },
  footerText: {
    color: '#6200EE',
    fontSize: 14,
  },
});

export default CustomDrawerContent;