import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Title, Text, Avatar, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

import { API_URL } from '../config';

const API_BASE_URL = API_URL;

export default function ProfilePage({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                const userData = JSON.parse(userJson);
                setUser(userData);
                setName(userData.name);
                setEmail(userData.email);
                if (userData.profile_image) {
                    setImage(userData.profile_image);
                }
            }
        };
        loadUser();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setImage(base64Img);
        }
    };

    const handleUpdate = async () => {
        if (!name || !email) {
            Alert.alert('Validation Error', 'Name and Email are required');
            return;
        }

        setLoading(true);
        try {
            const payload: any = {
                userId: user.id,
                name,
                email,
            };

            if (password) {
                payload.password = password;
            }

            if (image) {
                payload.profile_image = image;
                console.log('Profile: Sending photo, length:', image.length);
            } else {
                console.log('Profile: No photo selected');
            }

            console.log('Profile: Updating with payload keys:', Object.keys(payload));
            const res = await axios.post(`${API_BASE_URL}/user/update-profile`, payload);

            const updatedUser = res.data.user;
            console.log('Profile: Response user has photo?', !!updatedUser.profile_image);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setPassword('');

            Alert.alert('Success', 'Profile updated successfully');

        } catch (error: any) {
            console.error('Profile: Update error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={pickImage}>
                    {image ? (
                        <Avatar.Image
                            size={100}
                            source={{ uri: image }}
                            style={{ backgroundColor: '#1e3a8a' }}
                        />
                    ) : (
                        <Avatar.Text
                            label={name ? name.charAt(0).toUpperCase() : 'U'}
                            size={100}
                            style={{ backgroundColor: '#1e3a8a' }}
                        />
                    )}
                    <View style={styles.editIconBadge}>
                        <Avatar.Icon size={30} icon="camera" style={{ backgroundColor: '#3b82f6' }} />
                    </View>
                </TouchableOpacity>
                <Title style={styles.title}>Edit Profile</Title>
            </View>

            <Card style={styles.card}>
                <Card.Content>
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
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        left={<TextInput.Icon icon="email" />}
                    />

                    <TextInput
                        mode="outlined"
                        label="New Password (Optional)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                        placeholder="Leave blank to keep current"
                        left={<TextInput.Icon icon="lock" />}
                    />

                    <Button
                        mode="contained"
                        onPress={handleUpdate}
                        loading={loading}
                        style={styles.button}
                        contentStyle={{ paddingVertical: 6 }}
                    >
                        Save Changes
                    </Button>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f8fafc',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    title: {
        marginTop: 10,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    button: {
        marginTop: 10,
        backgroundColor: '#FF6B35',
        borderRadius: 8,
    }
});
