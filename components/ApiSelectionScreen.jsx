import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { NotificationContext } from '../contexts/NotificationContext';

const { width } = Dimensions.get('window');

const ApiSelectionScreen = ({ navigation }) => {
  const { addScreenCompletionNotification, addNotification } = useContext(NotificationContext);

  const handleApiSelection = (apiType) => {
    if (apiType === 'Bajaj') {
      // Add notification about Bajaj selection
      addNotification({
        id: Date.now(),
        message: `Selected Bajaj for FasTag allocation`,
        time: 'Just now',
        read: false
      });
      
      // Navigate to ValidateCustomer for Bajaj API
      navigation.navigate('ValidateCustomer');
      addScreenCompletionNotification('ValidateCustomer');
    } else if (apiType === 'IDFC') {
      // For IDFC, show coming soon message
      addNotification({
        id: Date.now(),
        message: 'IDFC integration coming soon!',
        time: 'Just now',
        read: false
      });
    }
  };

  const ApiCard = ({ title, icon, onPress, isComingSoon = false }) => (
    <TouchableOpacity 
      style={[styles.apiCard, isComingSoon && styles.comingSoonCard]} 
      onPress={onPress}
      disabled={isComingSoon}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, isComingSoon && styles.comingSoonIcon]}>
          <Text style={[styles.icon, isComingSoon && styles.comingSoonIconText]}>{icon}</Text>
        </View>
        <Text style={[styles.cardTitle, isComingSoon && styles.comingSoonText]}>{title}</Text>
        {/* {isComingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
          </View>
        )} */}
      </View>
      
      <TouchableOpacity 
        style={[styles.selectButton, isComingSoon && styles.comingSoonButton]}
        onPress={onPress}
        disabled={isComingSoon}
      >
        <Text style={[styles.selectButtonText, isComingSoon && styles.comingSoonButtonText]}>
          {isComingSoon ? 'Coming Soon' : 'Select'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6200EE" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Provider</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Choose Your Provider</Text>
          <Text style={styles.infoText}>
            Select the provider you want to use for FasTag allocation.
          </Text>
        </View>

        {/* API Selection Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.cardsRow}>
            <View style={styles.cardWrapper}>
              <ApiCard
                title="Bajaj"
                icon="🏢"
                onPress={() => handleApiSelection('Bajaj')}
              />
            </View>
            
            <View style={styles.cardWrapper}>
              <ApiCard
                title="IDFC"
                icon="🏦"
                onPress={() => navigation.navigate('')}
                isComingSoon={true}
              />
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#6200EE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#6200EE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: (width - 48) / 2, // 48 = 16px padding on each side + 16px gap
  },
  apiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    height: 160, // Fixed height for consistency
  },
  comingSoonCard: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  cardContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  comingSoonIcon: {
    backgroundColor: '#E0E0E0',
  },
  icon: {
    fontSize: 28,
  },
  comingSoonIconText: {
    opacity: 0.6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 6,
  },
  comingSoonText: {
    color: '#666666',
  },
  selectButton: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  comingSoonButton: {
    backgroundColor: '#E0E0E0',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comingSoonButtonText: {
    color: '#666666',
  },
});

export default ApiSelectionScreen; 