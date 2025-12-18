// LoginPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, Title, Surface } from 'react-native-paper';

import { API_URL } from '../config';

const API_BASE_URL = API_URL;

export default function LoginPage({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/user/signin`,
        { email, password }
      );

      const data = res.data;

      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      Alert.alert('Login successful');
      navigation.replace('Main');

    } catch (err: any) {
      Alert.alert(
        'Login Failed',
        err.response?.data?.message || 'Unable to login'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      if (user) {
        navigation.replace('Main');
      }
    };

    getUser();
  }, []);

  return (
    <View style={styles.gradientBackground}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Title style={styles.title}>Welcome Back</Title>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            theme={{ colors: { background: 'white' } }}
          />

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            theme={{ colors: { background: 'white' } }}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
            contentStyle={{ paddingVertical: 6 }}
          >
            Login
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.replace('Signup')}
            style={styles.link}
            labelStyle={{ color: 'white' }}
          >
            Don't have an account? Sign up
          </Button>
        </View>
      </View>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    backgroundColor: '#FF6B35', // UniKL Orange background
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  content: {
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#FF6B35' // UniKL Orange
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#64748b',
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    elevation: 4,
  },
  link: {
    marginTop: 16,
  },
});
