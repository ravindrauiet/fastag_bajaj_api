import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal
} from 'react-native';
import FormLogger from '../utils/FormLogger';
import { FORM_TYPES } from '../utils/FormTracker';

const DebugConsole = ({ visible, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [detailsVisible, setDetailsVisible] = useState(false);

  // Load logs when component mounts or visibility changes
  useEffect(() => {
    if (visible) {
      loadLogs();
    }
  }, [visible]);

  // Load logs from Firestore
  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const allLogs = await FormLogger.getAllFormLogs(50);
      console.log(`Loaded ${allLogs.length} logs`);
      setLogs(allLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle log item press
  const handleLogPress = (log) => {
    setSelectedLog(log);
    setDetailsVisible(true);
  };

  // Filter logs based on active tab
  const filteredLogs = logs.filter(log => {
    if (activeTab === 'all') return true;
    if (activeTab === 'errors') return log.status === 'error';
    return log.formType === activeTab;
  });

  // Render log item
  const renderLogItem = (log, index) => {
    const isError = log.status === 'error';
    return (
      <TouchableOpacity
        key={log.id || index}
        style={[
          styles.logItem,
          isError ? styles.errorLogItem : null
        ]}
        onPress={() => handleLogPress(log)}
      >
        <View style={styles.logHeader}>
          <Text style={styles.logType}>{formatFormType(log.formType)}</Text>
          <Text style={[
            styles.logStatus,
            { color: getStatusColor(log.status) }
          ]}>
            {log.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.logAction}>{log.action || 'Unknown Action'}</Text>
        <Text style={styles.logTimestamp}>
          {new Date(log.timestamp).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render log details modal
  const renderLogDetails = () => {
    if (!selectedLog) return null;

    return (
      <Modal
        visible={detailsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Form Type:</Text>
                <Text style={styles.detailValue}>{formatFormType(selectedLog.formType)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Action:</Text>
                <Text style={styles.detailValue}>{selectedLog.action}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[
                  styles.detailValue,
                  { color: getStatusColor(selectedLog.status) }
                ]}>
                  {selectedLog.status.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>User:</Text>
                <Text style={styles.detailValue}>{selectedLog.userEmail}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Timestamp:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </Text>
              </View>
              
              {selectedLog.error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>Error:</Text>
                  <Text style={styles.errorMessage}>{selectedLog.error.message}</Text>
                  {selectedLog.error.code && (
                    <Text style={styles.errorCode}>Code: {selectedLog.error.code}</Text>
                  )}
                  {selectedLog.error.stack && (
                    <Text style={styles.errorStack}>{selectedLog.error.stack}</Text>
                  )}
                </View>
              )}
              
              <View style={styles.formDataContainer}>
                <Text style={styles.formDataTitle}>Form Data:</Text>
                <Text style={styles.formDataJson}>
                  {JSON.stringify(selectedLog.formData, null, 2)}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Console</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' ? styles.activeTab : null]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' ? styles.activeTabText : null]}>
                All Logs
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'errors' ? styles.activeTab : null]}
              onPress={() => setActiveTab('errors')}
            >
              <Text style={[styles.tabText, activeTab === 'errors' ? styles.activeTabText : null]}>
                Errors
              </Text>
            </TouchableOpacity>
            
            {Object.values(FORM_TYPES).map((formType) => (
              <TouchableOpacity
                key={formType}
                style={[styles.tab, activeTab === formType ? styles.activeTab : null]}
                onPress={() => setActiveTab(formType)}
              >
                <Text style={[styles.tabText, activeTab === formType ? styles.activeTabText : null]}>
                  {formatFormType(formType)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={loadLogs}>
            <Text style={styles.toolbarButtonText}>Refresh</Text>
          </TouchableOpacity>
          
          <Text style={styles.logCount}>
            {filteredLogs.length} logs
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#333333" />
            <Text style={styles.loadingText}>Loading logs...</Text>
          </View>
        ) : (
          <ScrollView style={styles.logsList}>
            {filteredLogs.length > 0 ? (
              filteredLogs.map(renderLogItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No logs found</Text>
              </View>
            )}
          </ScrollView>
        )}

        {renderLogDetails()}
      </SafeAreaView>
    </Modal>
  );
};

// Helper functions
const formatFormType = (formType) => {
  if (!formType) return 'Unknown';
  return formType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'success':
      return '#4CAF50';
    case 'error':
      return '#F44336';
    case 'pending':
      return '#FF9800';
    case 'started':
      return '#2196F3';
    default:
      return '#757575';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#333333',
  },
  tabText: {
    fontSize: 14,
    color: '#333333',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  toolbarButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toolbarButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logCount: {
    fontSize: 14,
    color: '#757575',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  logsList: {
    flex: 1,
    padding: 16,
  },
  logItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#333333',
  },
  errorLogItem: {
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  logStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logAction: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#757575',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#555555',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  errorCode: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  errorStack: {
    fontSize: 10,
    color: '#757575',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  formDataContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  formDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  formDataJson: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'monospace',
  },
});

export default DebugConsole; 