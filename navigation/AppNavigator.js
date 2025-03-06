// import React from 'react';
//    import { NavigationContainer } from '@react-navigation/native';
//    import { createStackNavigator } from '@react-navigation/stack';
//    import HomeScreen from '../components/HomeScreen';
//    import ValidateCustomerScreen from '../components/ValidateCustomerScreen';
//    // Import other screens as needed

//    const Stack = createStackNavigator();

//    const AppNavigator = () => {
//      return (
//        <NavigationContainer>
//          <Stack.Navigator initialRouteName="Home">
//            <Stack.Screen name="Home" component={HomeScreen} />
//            <Stack.Screen name="Validate Customer" component={ValidateCustomerScreen} />
//            {/* Add other screens here */}
//          </Stack.Navigator>
//        </NavigationContainer>
//      );
//    };

//    export default AppNavigator;

import React, { useState } from 'react';
   import { NavigationContainer } from '@react-navigation/native';
   import { createStackNavigator } from '@react-navigation/stack';
   import { View, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';
   import HomeScreen from '../components/HomeScreen';

   const Stack = createStackNavigator();

   const CustomSideMenu = ({ visible, onClose }) => (
     <Modal transparent={true} visible={visible} animationType="slide">
       <View style={styles.modalOverlay}>
         <View style={styles.sideMenu}>
           <Text style={styles.menuItem}>Home</Text>
           <Text style={styles.menuItem}>NETC Fastag</Text>
           <Text style={styles.menuItem}>Fastag Inventory</Text>
           {/* Add more menu items */}
           <TouchableOpacity onPress={onClose}>
             <Text style={styles.closeButton}>Close</Text>
           </TouchableOpacity>
         </View>
       </View>
     </Modal>
   );

   const AppNavigator = () => {
     const [menuVisible, setMenuVisible] = useState(false);

     return (
       <NavigationContainer>
         <CustomSideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
         <Stack.Navigator>
           <Stack.Screen name="Home">
             {(props) => <HomeScreen {...props} openMenu={() => setMenuVisible(true)} />}
           </Stack.Screen>
         </Stack.Navigator>
       </NavigationContainer>
     );
   };

   const styles = StyleSheet.create({
     modalOverlay: {
       flex: 1,
       backgroundColor: 'rgba(0, 0, 0, 0.5)',
     },
     sideMenu: {
       width: '70%',
       backgroundColor: '#fff',
       padding: 20,
       height: '100%',
     },
     menuItem: {
       fontSize: 18,
       marginVertical: 10,
     },
     closeButton: {
       color: 'blue',
       marginTop: 20,
     },
   });

   export default AppNavigator;