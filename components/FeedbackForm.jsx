import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FeedbackForm = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState('feedback'); // 'feedback' or 'issue'

  const validateForm = () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject for your feedback');
      return false;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please provide some details in your message');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call to submit feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      Alert.alert(
        'Thank you!',
        `Your ${feedbackType === 'feedback' ? 'feedback' : 'issue report'} has been submitted successfully. We appreciate your input.`,
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again later.');
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Your Opinion Matters</Text>
            <Text style={styles.headerSubtitle}>
              Help us improve your FasTag experience by sharing your thoughts or reporting issues
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  feedbackType === 'feedback' && styles.activeTypeButton
                ]}
                onPress={() => setFeedbackType('feedback')}
              >
                <Text 
                  style={[
                    styles.typeButtonText,
                    feedbackType === 'feedback' && styles.activeTypeButtonText
                  ]}
                >
                  Feedback
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  feedbackType === 'issue' && styles.activeTypeButton
                ]}
                onPress={() => setFeedbackType('issue')}
              >
                <Text 
                  style={[
                    styles.typeButtonText,
                    feedbackType === 'issue' && styles.activeTypeButtonText
                  ]}
                >
                  Report Issue
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder={feedbackType === 'feedback' ? "What's this feedback about?" : "What issue are you facing?"}
              placeholderTextColor="#999"
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
            />
            
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={styles.textarea}
              placeholder={feedbackType === 'feedback' ? "Share your thoughts with us..." : "Please provide details about the issue..."}
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {feedbackType === 'feedback' ? 'Submit Feedback' : 'Report Issue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              Your feedback helps us improve our service. We may contact you for additional details if needed.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTypeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  typeButtonText: {
    fontWeight: '600',
    color: '#777777',
  },
  activeTypeButtonText: {
    color: '#00ACC1',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textarea: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#00ACC1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noteContainer: {
    marginTop: 16,
    marginBottom: 30,
  },
  noteText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FeedbackForm; 