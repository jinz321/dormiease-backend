// SignupPage.tsx
import axios from 'axios';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { TextInput, Button, Text, Title, HelperText } from 'react-native-paper';

import { API_URL } from '../config';

const API_BASE_URL = API_URL;

export default function SignupPage({ navigation }: any) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !studentId || !email || !password) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting signup with:', { name, studentId, email });
      console.log('API URL:', `${API_BASE_URL}/user/signup`);

      const response = await axios.post(
        `${API_BASE_URL}/user/signup`,
        {
          name,
          studentId,
          email,
          password,
        },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Signup response:', response.data);
      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('Login');

    } catch (err: any) {
      console.error('Signup error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code
      });

      let errorMessage = 'Unable to sign up';

      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection.';
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check if the API server is running.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Create Account</Title>
        <Text style={styles.subtitle}>Join DormiEase today</Text>

        <TextInput
          mode="outlined"
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
        />

        <TextInput
          mode="outlined"
          label="Student ID"
          value={studentId}
          onChangeText={setStudentId}
          keyboardType="numeric"
          style={styles.input}
          left={<TextInput.Icon icon="card-account-details" />}
        />

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
        />

        <Button
          mode="contained"
          onPress={handleSignup}
          loading={loading}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          Sign Up
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.replace('Login')}
          style={styles.link}
        >
          Already have an account? Log in
        </Button>
      </View>
    </ScrollView>
  );
}

// styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1e293b'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#64748b'
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#FF6B35'
  },
  link: {
    marginTop: 16,
  },
});
