import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { uploadDocument } from '../api.js';

const DocumentUploadScreen = () => {
  const [requestId, setRequestId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [imageType, setImageType] = useState('');
  const [image, setImage] = useState('');

  const handleUploadDocument = async () => {
    try {
      const response = await uploadDocument(requestId, sessionId, imageType, image);
      alert('Document Uploaded Successfully!');
    } catch (error) {
      alert('Error uploading document');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Document</Text>
      <TextInput
        style={styles.input}
        placeholder="Request ID"
        value={requestId}
        onChangeText={setRequestId}
      />
      <TextInput
        style={styles.input}
        placeholder="Session ID"
        value={sessionId}
        onChangeText={setSessionId}
      />
      <TextInput
        style={styles.input}
        placeholder="Image Type"
        value={imageType}
        onChangeText={setImageType}
      />
      <TextInput
        style={styles.input}
        placeholder="Base64 Image"
        value={image}
        onChangeText={setImage}
      />
      <Button title="Upload Document" onPress={handleUploadDocument} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default DocumentUploadScreen;
