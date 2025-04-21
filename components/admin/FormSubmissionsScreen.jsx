import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TextInput,
  FlatList
} from 'react-native';
import { getAllSubmissions } from '../../api/formSubmissionsApi';
import { 
  getFormTypeName, 
  getFormTypeColor, 
  getFormTypeIcon, 
  getStatusColor,
  FORM_TYPES
} from '../../utils/FormTracker';

const FormSubmissionsScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get the specific formType from route params if provided
  const initialFormType = route.params?.formType || null;
  
  useEffect(() => {
    if (initialFormType) {
      setSelectedFormType(initialFormType);
    }
    loadSubmissions();
  }, [initialFormType]);
  
  // Load submissions from Firestore
  const loadSubmissions = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const result = await getAllSubmissions(selectedFormType);
      
      if (result.success) {
        console.log(`Loaded ${result.submissions.length} submissions`);
        setSubmissions(result.submissions);
        setFilteredSubmissions(result.submissions);
      } else {
        setErrorMessage('Failed to load submissions: ' + result.error);
        console.error('Error loading submissions:', result.error);
      }
    } catch (error) {
      setErrorMessage('Error: ' + error.message);
      console.error('Exception loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters and search
  useEffect(() => {
    let filtered = submissions;
    
    // Apply form type filter if selected
    if (selectedFormType) {
      filtered = filtered.filter(sub => sub.formType === selectedFormType);
    }
    
    // Apply search query if entered
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        (sub.userName && sub.userName.toLowerCase().includes(query)) ||
        (sub.userEmail && sub.userEmail.toLowerCase().includes(query)) ||
        (sub.mobileNo && sub.mobileNo.includes(query)) ||
        (sub.vehicleNo && sub.vehicleNo.toLowerCase().includes(query)) ||
        (sub.id && sub.id.toLowerCase().includes(query))
      );
    }
    
    setFilteredSubmissions(filtered);
  }, [submissions, selectedFormType, searchQuery]);
  
  // Handle view submission details
  const viewSubmissionDetails = (submission) => {
    navigation.navigate('FormSubmissionDetail', { 
      submissionId: submission.id,
      formType: submission.formType
    });
  };
  
  // Render form type filter options
  const renderFormTypeFilters = () => {
    const formTypes = Object.values(FORM_TYPES);
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {/* All option */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedFormType && styles.selectedFilterChip
          ]}
          onPress={() => setSelectedFormType(null)}
        >
          <Text style={[
            styles.filterChipText,
            !selectedFormType && styles.selectedFilterChipText
          ]}>
            All Forms
          </Text>
        </TouchableOpacity>
        
        {/* Form type options */}
        {formTypes.map((formType) => (
          <TouchableOpacity
            key={formType}
            style={[
              styles.filterChip,
              { backgroundColor: getFormTypeColor(formType) },
              selectedFormType === formType && styles.selectedFilterChip
            ]}
            onPress={() => setSelectedFormType(formType)}
          >
            <Text style={styles.filterChipIcon}>{getFormTypeIcon(formType)}</Text>
            <Text style={[
              styles.filterChipText,
              selectedFormType === formType && styles.selectedFilterChipText
            ]}>
              {getFormTypeName(formType)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // Render each submission item
  const renderSubmissionItem = ({ item }) => {
    const formattedDate = item.createdAt ? 
      new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 
      (item.submissionTimestamp || 'Unknown date');
      
    return (
      <TouchableOpacity
        style={styles.submissionCard}
        onPress={() => viewSubmissionDetails(item)}
      >
        <View style={styles.submissionHeader}>
          <View style={[
            styles.formTypeTag,
            { backgroundColor: getFormTypeColor(item.formType) }
          ]}>
            <Text style={styles.formTypeIcon}>{getFormTypeIcon(item.formType)}</Text>
            <Text style={styles.formTypeName}>{getFormTypeName(item.formType)}</Text>
          </View>
          
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.submissionBody}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.userName || 'Unknown User'}</Text>
            <Text style={styles.userEmail}>{item.userEmail || 'No Email'}</Text>
          </View>
          
          <View style={styles.submissionDetails}>
            {item.mobileNo && (
              <Text style={styles.detailText}>Mobile: {item.mobileNo}</Text>
            )}
            {item.vehicleNo && (
              <Text style={styles.detailText}>Vehicle: {item.vehicleNo}</Text>
            )}
            <Text style={styles.detailText}>Step: {item.registrationStep || 'N/A'}</Text>
          </View>
        </View>
        
        <View style={styles.submissionFooter}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.viewMoreText}>View Details →</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form Submissions</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadSubmissions}
        >
          <Text style={styles.refreshButtonText}>↻</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, mobile..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {renderFormTypeFilters()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333333" />
          <Text style={styles.loadingText}>Loading submissions...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadSubmissions}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredSubmissions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 
              'No submissions match your search' : 
              selectedFormType ? 
                `No ${getFormTypeName(selectedFormType)} submissions found` : 
                'No submissions found'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSubmissions}
          renderItem={renderSubmissionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginRight: 8,
  },
  selectedFilterChip: {
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterChipIcon: {
    marginRight: 4,
    fontSize: 16,
  },
  filterChipText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  submissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  formTypeIcon: {
    marginRight: 4,
    fontSize: 16,
  },
  formTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  submissionBody: {
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
  submissionDetails: {
    backgroundColor: '#F9F9F9',
    padding: 8,
    borderRadius: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  submissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#666666',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
});

export default FormSubmissionsScreen; 