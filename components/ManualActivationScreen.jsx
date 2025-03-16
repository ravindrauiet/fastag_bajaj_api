import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Animated,
  Alert
} from 'react-native';

const ManualActivationScreen = ({ navigation, route }) => {
  const [fastagId, setFastagId] = useState('');
  
  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // If scanned data is passed, set it as the initial value
    if (route.params?.scannedData) {
      setFastagId(route.params.scannedData);
    }
    
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [route.params?.scannedData]);

  const handleActivate = () => {
    if (!fastagId.trim()) {
      Alert.alert('Error', 'Please enter a valid FASTag ID');
      return;
    }
    
    // Navigate to VehicleKYC screen with the fastag ID
    navigation.navigate('VehicleKYCScreen', { fastagId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Activation</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Activate Your FasTag</Text>
            <Text style={styles.infoText}>
              Please enter your FASTag ID to proceed with the activation process.
              The ID can be found on the back of your FasTag.
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>FASTag ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter FASTag ID"
              keyboardType="numeric"
              value={fastagId}
              onChangeText={setFastagId}
              placeholderTextColor="#999999"
            />
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleActivate}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Activate Now</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              If you're having trouble finding your FASTag ID, please check the back of your FasTag
              or contact customer support for assistance.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#333333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#333333',
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpSection: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  helpText: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ManualActivationScreen;