import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';

const ContactSupportScreen = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: 1, name: 'FasTag Registration', icon: '🚗' },
    { id: 2, name: 'Payment Issues', icon: '💰' },
    { id: 3, name: 'Wallet Recharge', icon: '💳' },
    { id: 4, name: 'Account Related', icon: '👤' },
    { id: 5, name: 'Technical Support', icon: '🔧' },
  ];

  const handleSendMessage = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a support category');
      return;
    }

    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        'Your support request has been submitted. Our team will get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Contact Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Need Assistance?</Text>
          <Text style={styles.infoText}>
            Our support team is here to help you with any questions or issues related to your FasTag, payments, or account.
          </Text>
          
          <View style={styles.contactMethodsContainer}>
            <View style={styles.contactMethod}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactLabel}>Customer Support</Text>
              <Text style={styles.contactValue}>+91 9826000000</Text>
            </View>
            
            <View style={styles.contactMethod}>
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@tmsquare.co.in</Text>
            </View>
          </View>
        </View>
        
        {/* Support Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Support Category</Text>
          <View style={styles.categoriesContainer}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Support Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit a Request</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter the subject of your request"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue or question in detail"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSendMessage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Send Message</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Payment Support Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Payment Gateway Support</Text>
          <Text style={styles.noticeText}>
            For issues related to payments, please provide:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Transaction ID (if available)</Text>
            <Text style={styles.bulletItem}>• Date and time of the transaction</Text>
            <Text style={styles.bulletItem}>• Payment method used</Text>
            <Text style={styles.bulletItem}>• Error message received (if any)</Text>
          </View>
          <Text style={styles.noticeText}>
            Our payment gateway is secured by industry-standard encryption and complies with all relevant regulations.
          </Text>
        </View>
        
        {/* Bottom space for navigation */}
        <View style={{ height: 30 }} />
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
    backgroundColor: '#6200EE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6200EE',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactMethod: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
    marginHorizontal: 5,
  },
  contactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6200EE',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  selectedCategory: {
    backgroundColor: '#6200EE',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6200EE',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#6200EE',
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  messageInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#6200EE',
    height: 120,
    borderWidth: 1,
    borderColor: '#EDE7F6',
  },
  submitButton: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noticeCard: {
    backgroundColor: '#EDE7F6',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#6200EE',
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletList: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: '#6200EE',
    lineHeight: 22,
  },
});

export default ContactSupportScreen; 