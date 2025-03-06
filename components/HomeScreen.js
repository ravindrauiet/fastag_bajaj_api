// import React from 'react';
// import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';

// const HomeScreen = ({ navigation }) => {
//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
//           <Text style={styles.menuIcon}>☰</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Home</Text>
//         <View style={styles.headerIcons}>
//           <Text style={styles.icon}>🔔</Text>
//           <Text style={styles.icon}>💬</Text>
//         </View>
//       </View>

//       {/* Image */}
//       <Image
//         style={styles.image}
//         source={{ uri: 'https://via.placeholder.com/300' }} // Replace with actual image URL
//       />

//       {/* Activation Status */}
//       <View style={styles.statusContainer}>
//         <Text style={styles.statusText}>Activation Status</Text>
//         <Text>Today: 0</Text>
//         <Text>Previous Day: 0</Text>
//       </View>

//       {/* Buttons */}
//       <View style={styles.buttonContainer}>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>NETC Fastag</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>RC Details</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Bottom Button */}
//       <TouchableOpacity style={styles.bottomButton}>
//         <Text style={styles.bottomButtonText}>+</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#F5F5F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   menuIcon: {
//     fontSize: 24,
//   },
//   headerText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   headerIcons: {
//     flexDirection: 'row',
//   },
//   icon: {
//     marginLeft: 10,
//     fontSize: 24,
//   },
//   image: {
//     width: '100%',
//     height: 150,
//     borderRadius: 10,
//     marginBottom: 16,
//   },
//   statusContainer: {
//     backgroundColor: '#FFFFFF',
//     padding: 16,
//     borderRadius: 10,
//     marginBottom: 16,
//   },
//   statusText: {
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   button: {
//     backgroundColor: '#007BFF',
//     padding: 16,
//     borderRadius: 10,
//     width: '48%',
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },
//   bottomButton: {
//     backgroundColor: '#007BFF',
//     padding: 16,
//     borderRadius: 50,
//     alignItems: 'center',
//     alignSelf: 'center',
//     width: 60,
//     height: 60,
//     justifyContent: 'center',
//   },
//   bottomButtonText: {
//     color: '#FFFFFF',
//     fontSize: 24,
//   },
// });

// export default HomeScreen;



import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const HomeScreen = ({ openMenu }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Home</Text>
        <View style={styles.headerIcons}>
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.icon}>💬</Text>
        </View>
      </View>

      {/* Image */}
      <Image
        style={styles.image}
        source={{ uri: 'https://via.placeholder.com/300' }} // Replace with actual image URL
      />

      {/* Activation Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Activation Status</Text>
        <Text>Today: 0</Text>
        <Text>Previous Day: 0</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>NETC Fastag</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>RC Details</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Button */}
      <TouchableOpacity style={styles.bottomButton}>
        <Text style={styles.bottomButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuIcon: {
    fontSize: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 10,
    fontSize: 24,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  statusText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    alignSelf: 'center',
    width: 60,
    height: 60,
    justifyContent: 'center',
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
});

export default HomeScreen;
