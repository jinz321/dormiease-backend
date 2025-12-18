// NewMaintenancePage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';

import { API_URL } from '../config';

const API_BASE_URL = API_URL;

export default function NewMaintenancePage({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !details) {
      Alert.alert('Validation Error', 'Title and details are required');
      return;
    }

    setLoading(true);
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      if (!user) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      await axios.post(
        `${API_BASE_URL}/maintenance/user/submit-maintenance`,
        {
          studentId: user.studentId,  // ✅ Fixed: Use studentId (camelCase) from backend
          title,
          details,
        }
      );

      Alert.alert('Success', 'Maintenance request submitted');
      navigation.goBack();

    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to submit maintenance request'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>New Request</Title>

      <TextInput
        mode="outlined"
        label="Title"
        placeholder="Brief summary (e.g., Leaky Tap)"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        mode="outlined"
        label="Details"
        placeholder="Describe the issue in detail..."
        value={details}
        onChangeText={setDetails}
        style={styles.input}
        multiline
        numberOfLines={4}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={styles.button}
        contentStyle={{ paddingVertical: 6 }}
      >
        Submit Request
      </Button>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b'
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#FF6B35'
  },
});
