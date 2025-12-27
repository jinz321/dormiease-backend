// LoginPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import UniklLogo from '../components/UniklLogo';
import {
  View,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Image
              source={require('../assets/images/unikl-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
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
              labelStyle={{ color: '#fff', fontWeight: '600' }}
            >
              Don't have an account? Sign up
            </Button>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

// styles
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 107, 53, 0.15)', // Subtle UniKL orange tint
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  content: {
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Glassmorphism - semi-transparent
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
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
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
    fontSize: 36,
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
    marginBottom: 32,
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
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 4,
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
