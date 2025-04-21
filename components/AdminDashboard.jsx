import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar
} from 'react-native';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = ({ navigation }) => {
  const { isAdmin, logout, userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newRegistrations: 0,
    totalSubmissions: 0,
    pendingApprovals: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [permissionError, setPermissionError] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      console.log("Not admin, redirecting to HomeScreen");
      navigation.replace('HomeScreen');
    } else {
      console.log("Admin user confirmed, showing dashboard");
      // Load dashboard data
      loadDashboardData();
    }
  }, [isAdmin, navigation]);

  // Load all dashboard data
  const loadDashboardData = () => {
    // Set loading state
    setLoading(true);
    
    // Set default values in case of permissions errors
    setStats({
      totalUsers: 0,
      newRegistrations: 0,
      totalSubmissions: 0,
      pendingApprovals: 0
    });
    
    // Initialize empty arrays for UI
    setRecentUsers([]);
    setRecentSubmissions([]);
    
    // Track active listeners to clean up
    const listeners = [];
    
    try {
      // Load user count
      try {
        const usersRef = collection(db, 'users');
        const unsubscribeUsers = onSnapshot(
          usersRef, 
          (querySnapshot) => {
            setStats(prevStats => ({
              ...prevStats,
              totalUsers: querySnapshot.size
            }));
          },
          (error) => {
            console.log("Permission error for users collection:", error.message);
            if (error.code === 'permission-denied') {
              setPermissionError(true);
            }
          }
        );
        listeners.push(unsubscribeUsers);
      } catch (error) {
        console.error("Error setting up users listener:", error.message);
      }
  
      // Load recent users
      try {
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const unsubscribeRecentUsers = onSnapshot(
          recentUsersQuery, 
          (querySnapshot) => {
            const users = [];
            querySnapshot.forEach(doc => {
              const data = doc.data();
              users.push({
                id: doc.id,
                displayName: data.displayName || 'Unknown User',
                email: data.email || 'No Email',
                createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
              });
            });
            setRecentUsers(users);
          },
          (error) => {
            console.log("Permission error for recent users:", error.message);
            if (error.code === 'permission-denied') {
              setPermissionError(true);
            }
            // Keep empty array
          }
        );
        listeners.push(unsubscribeRecentUsers);
      } catch (error) {
        console.error("Error setting up recent users listener:", error.message);
      }
  
      // Load submissions count
      try {
        const submissionsRef = collection(db, 'formSubmissions');
        const unsubscribeSubmissions = onSnapshot(
          submissionsRef, 
          (querySnapshot) => {
            setStats(prevStats => ({
              ...prevStats,
              totalSubmissions: querySnapshot.size
            }));
          },
          (error) => {
            console.log("Permission error for submissions collection:", error.message);
            if (error.code === 'permission-denied') {
              setPermissionError(true);
            }
          }
        );
        listeners.push(unsubscribeSubmissions);
      } catch (error) {
        console.error("Error setting up submissions listener:", error.message);
      }
      
      // Load recent submissions
      try {
        const recentSubmissionsQuery = query(
          collection(db, 'formSubmissions'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const unsubscribeRecentSubmissions = onSnapshot(
          recentSubmissionsQuery, 
          (querySnapshot) => {
            const submissions = [];
            querySnapshot.forEach(doc => {
              const data = doc.data();
              submissions.push({
                id: doc.id,
                formType: data.formType || 'Unknown Form',
                userName: data.userName || 'Unknown User',
                userEmail: data.userEmail || 'No Email',
                createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
              });
            });
            setRecentSubmissions(submissions);
          },
          (error) => {
            console.log("Permission error for recent submissions:", error.message);
            if (error.code === 'permission-denied') {
              setPermissionError(true);
            }
            // Keep empty array
          }
        );
        listeners.push(unsubscribeRecentSubmissions);
      } catch (error) {
        console.error("Error setting up recent submissions listener:", error.message);
      }
      
      // Load pending approvals count
      try {
        const pendingApprovalsQuery = query(
          collection(db, 'formSubmissions'),
          where('status', '==', 'pending')
        );
        
        const unsubscribePendingApprovals = onSnapshot(
          pendingApprovalsQuery, 
          (querySnapshot) => {
            setStats(prevStats => ({
              ...prevStats,
              pendingApprovals: querySnapshot.size
            }));
          },
          (error) => {
            console.log("Permission error for pending approvals:", error.message);
            if (error.code === 'permission-denied') {
              setPermissionError(true);
            }
          }
        );
        listeners.push(unsubscribePendingApprovals);
      } catch (error) {
        console.error("Error setting up pending approvals listener:", error.message);
      }
      
      // New registrations in the last 7 days
      try {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const newRegistrationsQuery = query(
          collection(db, 'users'),
          where('createdAt', '>=', lastWeek)
        );
        
        const unsubscribeNewRegistrations = onSnapshot(
          newRegistrationsQuery, 
          (querySnapshot) => {
            setStats(prevStats => ({
              ...prevStats,
              newRegistrations: querySnapshot.size
            }));
          },
          (error) => {
            console.log("Permission error for new registrations:", error.message);
            if (error.code === 'permission-denied') {
              setPermissionError(true);
            }
          }
        );
        listeners.push(unsubscribeNewRegistrations);
      } catch (error) {
        console.error("Error setting up new registrations listener:", error.message);
      }
      
    } catch (masterError) {
      console.error("Critical error in loadDashboardData:", masterError);
    } finally {
      // Ensure loading state finishes even if there are errors
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
    
    // Return cleanup function for all listeners
    return () => {
      console.log("Cleaning up dashboard listeners");
      listeners.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (e) {
          console.error("Error unsubscribing:", e);
        }
      });
    };
  };

  // Handle navigation to view all items of a particular type
  const viewAll = (type) => {
    console.log(`View all ${type}`);
    
    switch (type) {
      case 'users':
        // Navigate to users screen (could be implemented later)
        alert('User management will be implemented in future updates');
        break;
        
      case 'submissions':
        // Navigate to all form submissions
        navigation.navigate('FormSubmissionsScreen');
        break;
        
      case 'newUsers':
        // Navigate to users with filter for recent users
        alert('New users view will be implemented in future updates');
        break;
        
      case 'pendingApprovals':
        // Navigate to submissions with filter for pending status
        navigation.navigate('FormSubmissionsScreen', { 
          formType: null, 
          statusFilter: 'pending'
        });
        break;
        
      default:
        alert(`Navigate to view all ${type} - to be implemented`);
    }
  };

  // Handle profile navigation
  const goToProfile = () => {
    navigation.navigate('ProfileScreen');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Add this PermissionErrorCard component
  const PermissionErrorCard = () => (
    <View style={styles.errorCard}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Firebase Permission Error</Text>
      <Text style={styles.errorMessage}>
        Your admin account doesn't have sufficient permissions to access some data. 
        Please check your Firebase security rules or contact the system administrator.
      </Text>
      <TouchableOpacity 
        style={styles.errorButton}
        onPress={() => loadDashboardData()}
      >
        <Text style={styles.errorButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // If still loading data
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333333" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </SafeAreaView>
    );
  }

  // Then, in the render section after the loading check and before the main content:
  if (permissionError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Admin Header/Welcome Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerTopSection}>
              <View>
                <Text style={styles.welcomeText}>Admin Dashboard</Text>
                <Text style={styles.adminEmail}>{userInfo?.email || 'admin@gmail.com'}</Text>
              </View>
              <TouchableOpacity onPress={goToProfile}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>A</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          <PermissionErrorCard />
          
          {/* Quick Actions Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('ProfileScreen')}
              >
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>👤</Text>
                </View>
                <Text style={styles.actionText}>Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleLogout}
              >
                <View style={[styles.actionIconContainer, {backgroundColor: '#FFEBEE'}]}>
                  <Text style={styles.actionIcon}>🚪</Text>
                </View>
                <Text style={styles.actionText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Space for bottom navigation */}
          <View style={{ height: 80 }} />
        </ScrollView>
        
        {/* Bottom Navigation */}
        <View style={styles.bottomNavContainer}>
          <View style={styles.bottomNav}>
            <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
              <View style={[styles.navIconContainer, styles.activeNavIcon]}>
                <Text style={styles.navIcon}>📊</Text>
              </View>
              <Text style={[styles.navLabel, styles.activeNavLabel]}>Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={goToProfile}
            >
              <View style={styles.navIconContainer}>
                <Text style={styles.navIcon}>👤</Text>
              </View>
              <Text style={styles.navLabel}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Admin Header/Welcome Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopSection}>
            <View>
              <Text style={styles.welcomeText}>Admin Dashboard</Text>
              <Text style={styles.adminEmail}>{userInfo?.email || 'admin@gmail.com'}</Text>
            </View>
            <TouchableOpacity onPress={goToProfile}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>A</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dashboard Overview</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={[styles.statsCard, {backgroundColor: '#E3F2FD'}]} 
              onPress={() => viewAll('users')}
            >
              <Text style={styles.statsNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statsLabel}>Total Users</Text>
              <Text style={styles.statsIcon}>👥</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statsCard, {backgroundColor: '#FFF8E1'}]}
              onPress={() => viewAll('submissions')}
            >
              <Text style={styles.statsNumber}>{stats.totalSubmissions}</Text>
              <Text style={styles.statsLabel}>Submissions</Text>
              <Text style={styles.statsIcon}>📋</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statsCard, {backgroundColor: '#E8F5E9'}]}
              onPress={() => viewAll('newUsers')}
            >
              <Text style={styles.statsNumber}>{stats.newRegistrations}</Text>
              <Text style={styles.statsLabel}>New Registrations</Text>
              <Text style={styles.statsIcon}>✅</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statsCard, {backgroundColor: '#FFEBEE'}]}
              onPress={() => viewAll('pendingApprovals')}
            >
              <Text style={styles.statsNumber}>{stats.pendingApprovals}</Text>
              <Text style={styles.statsLabel}>Pending Approvals</Text>
              <Text style={styles.statsIcon}>⏳</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Users Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Users</Text>
            <TouchableOpacity onPress={() => viewAll('users')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentUsers.length > 0 ? (
            <View style={styles.listContainer}>
              {recentUsers.map((user, index) => (
                <TouchableOpacity 
                  key={user.id} 
                  style={styles.listItem}
                  onPress={() => alert(`User details for: ${user.displayName}`)}
                >
                  <View style={styles.listItemIconContainer}>
                    <Text style={styles.listItemIcon}>👤</Text>
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{user.displayName}</Text>
                    <Text style={styles.listItemSubtitle}>{user.email}</Text>
                  </View>
                  <Text style={styles.listItemDate}>{user.createdAt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          )}
        </View>

        {/* Recent Form Submissions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Submissions</Text>
            <TouchableOpacity onPress={() => viewAll('submissions')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentSubmissions.length > 0 ? (
            <View style={styles.listContainer}>
              {recentSubmissions.map((submission, index) => (
                <TouchableOpacity 
                  key={submission.id} 
                  style={styles.listItem}
                  onPress={() => alert(`Submission details for: ${submission.formType}`)}
                >
                  <View style={[
                    styles.listItemIconContainer,
                    {backgroundColor: getFormTypeColor(submission.formType)}
                  ]}>
                    <Text style={styles.listItemIcon}>{getFormTypeIcon(submission.formType)}</Text>
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{formatFormType(submission.formType)}</Text>
                    <Text style={styles.listItemSubtitle}>{submission.userName}</Text>
                  </View>
                  <Text style={styles.listItemDate}>{submission.createdAt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No submissions found</Text>
            </View>
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ProfileScreen')}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>👤</Text>
              </View>
              <Text style={styles.actionText}>Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLogout}
            >
              <View style={[styles.actionIconContainer, {backgroundColor: '#FFEBEE'}]}>
                <Text style={styles.actionIcon}>🚪</Text>
              </View>
              <Text style={styles.actionText}>Logout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('BarcodeScanner')}
            >
              <View style={[styles.actionIconContainer, {backgroundColor: '#E0F7FA'}]}>
                <Text style={styles.actionIcon}>📷</Text>
              </View>
              <Text style={styles.actionText}>Scanner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('DocumentUpload')}
            >
              <View style={[styles.actionIconContainer, {backgroundColor: '#F3E5F5'}]}>
                <Text style={styles.actionIcon}>📄</Text>
              </View>
              <Text style={styles.actionText}>Documents</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Space for bottom navigation */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
            <View style={[styles.navIconContainer, styles.activeNavIcon]}>
              <Text style={styles.navIcon}>📊</Text>
            </View>
            <Text style={[styles.navLabel, styles.activeNavLabel]}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => viewAll('users')}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>👥</Text>
            </View>
            <Text style={styles.navLabel}>Users</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => viewAll('submissions')}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>📋</Text>
            </View>
            <Text style={styles.navLabel}>Forms</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => viewAll('pendingApprovals')}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>⏳</Text>
            </View>
            <Text style={styles.navLabel}>Pending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={goToProfile}
          >
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>👤</Text>
            </View>
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Helper functions for form type display
const formatFormType = (formType) => {
  if (!formType) return 'Unknown Form';
  return formType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getFormTypeIcon = (formType) => {
  const iconMap = {
    'vehicle-details': '🚗',
    'user-details': '👤',
    'payment-info': '💰',
    'fastag-registrations': '📋',
    'kyc-documents': '📄'
  };
  return iconMap[formType] || '📝';
};

const getFormTypeColor = (formType) => {
  const colorMap = {
    'vehicle-details': '#E3F2FD',
    'user-details': '#E8F5E9',
    'payment-info': '#FFF8E1',
    'fastag-registrations': '#F3E5F5',
    'kyc-documents': '#FFEBEE'
  };
  return colorMap[formType] || '#F5F5F5';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#777777',
  },
  // Header Card
  headerCard: {
    backgroundColor: '#333333',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    marginBottom: 8,
  },
  headerTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  adminEmail: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 4,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  // Section Container
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#555555',
  },
  statsIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 24,
    opacity: 0.5,
  },
  // List Items
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemIcon: {
    fontSize: 20,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#777777',
  },
  listItemDate: {
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    padding: 24,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#777777',
    fontSize: 16,
  },
  // Quick Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    alignItems: 'center',
    width: '23%',
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333333',
  },
  // Bottom Navigation
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    width: '92%',
    height: 75,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    paddingHorizontal: 15,
    position: 'relative',
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingTop: 5,
    flex: 1,
  },
  activeNavItem: {
    // Add any active styles here
  },
  navIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 5,
  },
  activeNavIcon: {
    backgroundColor: 'rgba(51, 51, 51, 0.1)',
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#777777',
  },
  activeNavLabel: {
    color: '#333333',
    fontWeight: '600',
  },
  // Error Card
  errorCard: {
    padding: 24,
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
    alignSelf: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#555555',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AdminDashboard; 