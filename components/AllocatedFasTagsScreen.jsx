import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import FastagManager from '../utils/FastagManager';

const AllocatedFasTagsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [allocatedTags, setAllocatedTags] = useState([]);
  const { userInfo, userProfile } = useAuth();
  
  useEffect(() => {
    fetchAllocatedTags();
  }, []);
  
  const fetchAllocatedTags = async () => {
    setLoading(true);
    try {
      // Get user BC_Id from profile
      const bcId = userProfile?.bcId || userProfile?.BC_Id;
      
      if (!bcId) {
        Alert.alert("Error", "BC ID not found. Please contact support.");
        setLoading(false);
        return;
      }
      
      // Query Firestore for all allocated FastTags for this user
      const fastagRef = collection(db, "fastags");
      const q = query(fastagRef, where('assignedTo', '==', bcId));
      const querySnapshot = await getDocs(q);
      
      const tags = [];
      querySnapshot.forEach((doc) => {
        tags.push({
          id: doc.id,
          ...doc.data(),
          usedStyle: doc.data().status === 'active' ? styles.usedTag : {}
        });
      });
      
      // Sort by status first (available first), then by serial number
      tags.sort((a, b) => {
        if (a.status === 'available' && b.status !== 'available') return -1;
        if (a.status !== 'available' && b.status === 'available') return 1;
        return a.serialNo.localeCompare(b.serialNo);
      });
      
      setAllocatedTags(tags);
    } catch (error) {
      console.error("Error fetching allocated tags:", error);
      Alert.alert("Error", "Failed to load your allocated tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectTag = (tag) => {
    if (tag.status === 'active') {
      Alert.alert("Tag Used", "This tag has already been activated.");
      return;
    }
    
    // Navigate to ManualActivation with the selected tag
    navigation.navigate('ManualActivation', {
      serialNo: tag.serialNo,
      preSelectedTag: true
    });
  };
  
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.tagItem, item.usedStyle]}
      onPress={() => handleSelectTag(item)}
      disabled={item.status === 'active'}
    >
      <View style={styles.tagInfo}>
        <Text style={styles.serialNo}>{item.serialNo}</Text>
        <Text style={styles.tagStatus}>
          Status: {item.status === 'available' ? 'Available' : 'Used'}
        </Text>
        {item.activatedAt && (
          <Text style={styles.tagDate}>
            Activated: {new Date(item.activatedAt.seconds * 1000).toLocaleDateString()}
          </Text>
        )}
      </View>
      
      {item.status === 'available' && (
        <View style={styles.useButton}>
          <Text style={styles.useButtonText}>Select</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Allocated FasTags</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Your FasTag Inventory</Text>
        <Text style={styles.infoText}>
          Below are the FasTags allocated to you by the administrator. Select an available tag to proceed with manual activation.
        </Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333333" />
          <Text style={styles.loadingText}>Loading your allocated tags...</Text>
        </View>
      ) : allocatedTags.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No FasTags allocated to you yet.</Text>
          <Text style={styles.emptySubtext}>Contact your administrator to get FasTags allocated.</Text>
        </View>
      ) : (
        <FlatList
          data={allocatedTags}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.countText}>
                {allocatedTags.filter(t => t.status === 'available').length} available tags
              </Text>
              <TouchableOpacity onPress={fetchAllocatedTags} style={styles.refreshButton}>
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  infoCard: {
    backgroundColor: '#333333',
    padding: 16,
    margin: 16,
    borderRadius: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#777777',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  countText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    color: '#666666',
    fontSize: 14,
  },
  tagItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  usedTag: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDDDDD',
    opacity: 0.8,
  },
  tagInfo: {
    flex: 1,
  },
  serialNo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  tagStatus: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  tagDate: {
    fontSize: 12,
    color: '#999999',
  },
  useButton: {
    backgroundColor: '#333333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default AllocatedFasTagsScreen; 