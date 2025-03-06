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
           <Text>App Version: 1.0.38</Text>
         </View>
       </DrawerContentScrollView>
     );
   };

   const styles = StyleSheet.create({
     userInfo: {
       padding: 20,
     },
     userName: {
       fontWeight: 'bold',
     },
     userEmail: {
       color: 'gray',
     },
     footer: {
       padding: 20,
       borderTopWidth: 1,
       borderColor: '#ccc',
     },
   });

   export default CustomDrawerContent;