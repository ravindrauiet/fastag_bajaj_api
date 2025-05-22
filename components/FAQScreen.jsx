import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';

const FAQScreen = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState(null);
  
  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };
  
  const faqs = [
    {
      id: 1,
      category: 'FasTag Basics',
      questions: [
        {
          id: 'b1',
          question: 'What is a FasTag?',
          answer: 'FasTag is an electronic toll collection system in India, operated by the National Highway Authority of India (NHAI). It uses Radio Frequency Identification (RFID) technology to enable direct toll payments from a linked account while the vehicle is in motion.'
        },
        {
          id: 'b2',
          question: 'Is FasTag mandatory?',
          answer: 'Yes, as per government mandate, all vehicles in India must have a FasTag for toll payments on national highways. Vehicles without FasTag may be charged twice the normal toll fee.'
        },
        {
          id: 'b3',
          question: 'How long is a FasTag valid?',
          answer: 'A FasTag is typically valid for 5 years from the date of issuance, provided it is in active use and properly maintained. The physical condition of the tag affects its readability and performance.'
        }
      ]
    },
    {
      id: 2,
      category: 'Registration & Activation',
      questions: [
        {
          id: 'r1',
          question: 'How do I register for a FasTag?',
          answer: 'You can register for a FasTag through our app by providing your vehicle details (registration number, chassis number, etc.), personal information, and completing the KYC process by uploading the required documents.'
        },
        {
          id: 'r2',
          question: 'What documents are required for FasTag registration?',
          answer: 'You need to provide vehicle registration certificate (RC), a valid ID proof (Aadhar card, driving license, etc.), and address proof. For commercial vehicles, additional permits may be required.'
        },
        {
          id: 'r3',
          question: 'How long does it take to activate a new FasTag?',
          answer: 'Once you complete the registration and KYC process, your FasTag is typically activated within 24-48 hours, subject to verification of the submitted documents.'
        }
      ]
    },
    {
      id: 3,
      category: 'Payment & Recharge',
      questions: [
        {
          id: 'p1',
          question: 'What payment methods can I use to recharge my FasTag?',
          answer: 'You can recharge your FasTag using various payment methods including credit/debit cards, net banking, UPI (BHIM, Google Pay, PhonePe, etc.), and digital wallets. Our app supports all major payment gateways for secure transactions.'
        },
        {
          id: 'p2',
          question: 'Is there a minimum recharge amount?',
          answer: 'Yes, the minimum recharge amount is typically ₹200. However, we recommend maintaining a minimum balance of ₹400 to ensure smooth passage through toll plazas.'
        },
        {
          id: 'p3',
          question: 'How do I check my FasTag balance?',
          answer: 'You can check your FasTag balance through our app on the dashboard or in the wallet section. The app provides real-time balance updates and transaction history.'
        },
        {
          id: 'p4',
          question: 'What happens if my FasTag has insufficient balance?',
          answer: 'If your FasTag has insufficient balance, you may be denied passage through the toll plaza or may need to pay the toll fee in cash. Some toll plazas may allow passage but your account will be marked with a negative balance that must be cleared in your next recharge.'
        }
      ]
    },
    {
      id: 4,
      category: 'Transaction & Security',
      questions: [
        {
          id: 't1',
          question: 'Are my payment details secure?',
          answer: 'Yes, all payment transactions are processed through secure, PCI DSS compliant payment gateways. We use industry-standard encryption protocols to protect your payment information and do not store complete card details on our servers.'
        },
        {
          id: 't2',
          question: 'What should I do if I notice an unauthorized transaction?',
          answer: 'If you notice any unauthorized transaction, please contact our customer support immediately. You should also report it to your bank or payment service provider. We recommend enabling transaction notifications to monitor activity in real-time.'
        },
        {
          id: 't3',
          question: 'How do I get a receipt for my FasTag recharge?',
          answer: 'Digital receipts for all recharges are automatically generated and can be accessed in the transaction history section of the app. You can also download or share these receipts via email.'
        }
      ]
    },
    {
      id: 5,
      category: 'Technical Issues',
      questions: [
        {
          id: 'tech1',
          question: 'What if my payment is deducted but FasTag is not recharged?',
          answer: 'If your payment is deducted but your FasTag balance is not updated, please check the transaction status in the app. If the status shows "pending," please wait for 2-4 hours as it may be processing. If the status shows "failed" but the amount was deducted, it will typically be refunded to your source account within 5-7 working days. If the issue persists, please contact our customer support with your transaction ID.'
        },
        {
          id: 'tech2',
          question: 'Why is my FasTag not being detected at toll plazas?',
          answer: 'Your FasTag may not be detected if it\'s improperly affixed to the windshield, damaged, or if there are multiple tags in the vehicle. Ensure that the tag is correctly placed on the windshield, free from any obstructions, and that old/inactive tags are removed.'
        },
        {
          id: 'tech3',
          question: 'What happens if I\'m charged incorrectly at a toll plaza?',
          answer: 'If you believe you\'ve been charged incorrectly, you can raise a dispute through the app\'s "Dispute Transaction" feature. Provide the toll plaza details, date, time, and amount charged. Our team will investigate and process any refunds if applicable within 7-14 working days.'
        }
      ]
    }
  ];
  
  const CategoryAccordion = ({ category }) => {
    const isExpanded = expandedId === category.id;
    
    return (
      <View style={styles.categoryContainer}>
        <TouchableOpacity 
          style={[styles.categoryHeader, isExpanded && styles.categoryHeaderActive]} 
          onPress={() => toggleExpand(category.id)}
        >
          <Text style={styles.categoryTitle}>{category.category}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.questionsContainer}>
            {category.questions.map(item => (
              <View key={item.id} style={styles.questionItem}>
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.introText}>
            Find answers to commonly asked questions about FasTag registration, recharge, and usage.
          </Text>
          
          {/* FAQ Search - Placeholder for future enhancement */}
          {/* <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQs..."
              placeholderTextColor="#999"
            />
          </View> */}
          
          {/* FAQ Categories */}
          {faqs.map(category => (
            <CategoryAccordion key={category.id} category={category} />
          ))}
          
          {/* Still Have Questions Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Still have questions?</Text>
            <Text style={styles.contactText}>
              If you couldn't find the answer to your question, please contact our support team.
            </Text>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => navigation.navigate('ContactSupport')}
            >
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
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
    backgroundColor: '#00ACC1',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  introText: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
    color: '#333333',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  categoryHeaderActive: {
    backgroundColor: '#00ACC1',
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  expandIcon: {
    fontSize: 24,
    color: '#555555',
    fontWeight: 'bold',
  },
  questionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  questionItem: {
    marginTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#E8F4F8',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  contactButton: {
    backgroundColor: '#00ACC1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default FAQScreen; 