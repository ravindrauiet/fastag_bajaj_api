import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';

const TermsConditionsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.lastUpdated}>Last Updated: June, 2023</Text>
          
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraphText}>
            By accessing and using the FasTag mobile application ("App"), you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, you must not use this application.
          </Text>
          
          <Text style={styles.sectionTitle}>2. FasTag Services</Text>
          <Text style={styles.paragraphText}>
            The App provides a platform for users to register, manage, and recharge their FasTag devices. The FasTag is an electronic toll collection system operated by the National Highway Authority of India (NHAI) and banks authorized by NHAI.
          </Text>
          
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraphText}>
            3.1 You must provide accurate, complete, and updated information during the registration process.
          </Text>
          <Text style={styles.paragraphText}>
            3.2 You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Text>
          <Text style={styles.paragraphText}>
            3.3 You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
          </Text>
          
          <Text style={styles.sectionTitle}>4. FasTag Registration</Text>
          <Text style={styles.paragraphText}>
            4.1 For FasTag registration, you must provide valid vehicle and personal details as required by the regulatory authorities.
          </Text>
          <Text style={styles.paragraphText}>
            4.2 You are responsible for ensuring the accuracy of the information provided during registration.
          </Text>
          <Text style={styles.paragraphText}>
            4.3 Registration is subject to verification and approval by relevant authorities and service providers.
          </Text>
          
          <Text style={styles.sectionTitle}>5. Payment Terms</Text>
          <Text style={styles.paragraphText}>
            5.1 All transactions made through the App are processed via secure payment gateways.
          </Text>
          <Text style={styles.paragraphText}>
            5.2 The App supports various payment methods including credit/debit cards, net banking, UPI, and wallet services.
          </Text>
          <Text style={styles.paragraphText}>
            5.3 All payments are subject to applicable taxes, fees, and charges as per government regulations.
          </Text>
          <Text style={styles.paragraphText}>
            5.4 Refunds for unsuccessful transactions will be processed as per the payment gateway and bank policies.
          </Text>
          <Text style={styles.paragraphText}>
            5.5 We reserve the right to change our fee structure upon reasonable notice.
          </Text>
          
          <View style={styles.highlightedSection}>
            <Text style={styles.highlightedTitle}>6. Payment Gateway Specific Terms</Text>
            <Text style={styles.highlightedText}>
              6.1 All payment information is encrypted using industry-standard protocols.
            </Text>
            <Text style={styles.highlightedText}>
              6.2 We do not store your complete credit/debit card information on our servers.
            </Text>
            <Text style={styles.highlightedText}>
              6.3 Transactions are processed through PCI DSS compliant payment gateways.
            </Text>
            <Text style={styles.highlightedText}>
              6.4 By making a payment, you authorize us to charge the payment method you have provided.
            </Text>
            <Text style={styles.highlightedText}>
              6.5 In case of payment disputes, our records of transactions shall be conclusive evidence of the transaction.
            </Text>
            <Text style={styles.highlightedText}>
              6.6 We comply with all applicable regulations including those issued by the Reserve Bank of India for payment processing.
            </Text>
          </View>
          
          <Text style={styles.sectionTitle}>7. Wallet Services</Text>
          <Text style={styles.paragraphText}>
            7.1 The wallet feature allows you to add funds for future FasTag recharges.
          </Text>
          <Text style={styles.paragraphText}>
            7.2 Wallet balance is non-transferable and can only be used for services offered within the App.
          </Text>
          <Text style={styles.paragraphText}>
            7.3 Unused wallet balance is subject to applicable regulations regarding prepaid payment instruments.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Privacy Policy</Text>
          <Text style={styles.paragraphText}>
            Your use of the App is also governed by our Privacy Policy, which outlines how we collect, use, store, and protect your personal information.
          </Text>
          
          <Text style={styles.sectionTitle}>9. Intellectual Property</Text>
          <Text style={styles.paragraphText}>
            All content, design, graphics, compilation, magnetic translation, digital conversion, and other matters related to the App are protected under applicable copyrights, trademarks, and other proprietary rights.
          </Text>
          
          <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
          <Text style={styles.paragraphText}>
            10.1 The App is provided on an "as is" and "as available" basis without warranties of any kind.
          </Text>
          <Text style={styles.paragraphText}>
            10.2 We shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from your use of the App.
          </Text>
          <Text style={styles.paragraphText}>
            10.3 We are not responsible for any delays or failures in the processing of transactions due to system failures, internet connectivity issues, or force majeure events.
          </Text>
          
          <Text style={styles.sectionTitle}>11. Indemnification</Text>
          <Text style={styles.paragraphText}>
            You agree to indemnify and hold us harmless from any claims, damages, liabilities, costs, and expenses arising from your violation of these Terms or your use of the App.
          </Text>
          
          <Text style={styles.sectionTitle}>12. Modifications to Terms</Text>
          <Text style={styles.paragraphText}>
            We reserve the right to modify these Terms at any time. Continued use of the App after any such changes constitutes your acceptance of the new Terms.
          </Text>
          
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraphText}>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in India.
          </Text>
          
          <Text style={styles.sectionTitle}>14. Contact Information</Text>
          <Text style={styles.paragraphText}>
            If you have any questions about these Terms, please contact us at support@tmsquare.co.in.
          </Text>
          
          <Text style={styles.acknowledgement}>
            By using our App, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </Text>
        </View>
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
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6200EE',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginTop: 24,
    marginBottom: 10,
  },
  paragraphText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 12,
  },
  highlightedSection: {
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  highlightedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 12,
  },
  highlightedText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 10,
  },
  acknowledgement: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200EE',
    marginTop: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});

export default TermsConditionsScreen; 