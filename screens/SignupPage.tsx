// SignupPage.tsx
import axios from 'axios';
import React, { useState } from 'react';
import UniklLogo from '../components/UniklLogo';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.backgroundImage}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <Image
              source={require('../assets/images/unikl-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
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
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 107, 53, 0.15)', // Subtle UniKL orange tint
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    padding: 32,
    paddingBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Glassmorphism
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 28,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  link: {
    marginTop: 16,
  },
});
