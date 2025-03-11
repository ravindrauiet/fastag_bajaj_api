import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { replaceFastag } from '../api.js';

const FasTagReplacementScreen = () => {
  const [tagReplaceReq, setTagReplaceReq] = useState({
    mobileNo: '',
    walletId: '',
    vehicleNo: '',
    // Add other necessary fields
  });

  const handleReplaceFastag = async () => {
    try {
      const response = await replaceFastag(tagReplaceReq);
      alert('FasTag Replaced Successfully!');
    } catch (error) {
      alert('Error replacing FasTag');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FasTag Replacement</Text>
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={tagReplaceReq.mobileNo}
        onChangeText={(text) => setTagReplaceReq({ ...tagReplaceReq, mobileNo: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Wallet ID"
        value={tagReplaceReq.walletId}
        onChangeText={(text) => setTagReplaceReq({ ...tagReplaceReq, walletId: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Number"
        value={tagReplaceReq.vehicleNo}
        onChangeText={(text) => setTagReplaceReq({ ...tagReplaceReq, vehicleNo: text })}
      />
      {/* Add more input fields as needed */}
      <Button title="Replace FasTag" onPress={handleReplaceFastag} />
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

export default FasTagReplacementScreen;