import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, HelperText, ActivityIndicator, List } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../utils/apiClient';

const AddRoomPage = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [maxSize, setMaxSize] = useState('');
    const [hostelId, setHostelId] = useState('');
    const [loading, setLoading] = useState(false);
    const [hostels, setHostels] = useState<any[]>([]);
    const [loadingHostels, setLoadingHostels] = useState(false);
    const [showHostelList, setShowHostelList] = useState(false);
    const [selectedHostelName, setSelectedHostelName] = useState('');

    useEffect(() => {
        fetchHostels();
    }, []);

    const fetchHostels = async () => {
        setLoadingHostels(true);
        try {
            const response = await apiClient.get('/hostels/all');
            setHostels(response.data);
        } catch (error) {
            console.error("Failed to fetch hostels", error);
        } finally {
            setLoadingHostels(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!name || !maxSize) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            console.log("Sending room creation request...");
            const payload = {
                name,
                maxSize: parseInt(maxSize),
                hostelId: hostelId || null
            };

            const response = await apiClient.post('/rooms/create', payload);
            console.log("Room created:", response.data);

            Alert.alert("Success", "Room created successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error("Create room failed:", error);
            // Error handling is already done in apiClient interceptor, 
            // but we can add specific handling here if needed.
        } finally {
            setLoading(false);
        }
    };

    const selectHostel = (id: string, name: string) => {
        setHostelId(id);
        setSelectedHostelName(name);
        setShowHostelList(false);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FF6B35', '#F4A261']}
                style={styles.header}
            >
                <Title style={styles.headerTitle}>Add New Room</Title>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>

                    <View style={styles.inputContainer}>
                        <TextInput
                            label="Room Name / Number"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g. A-101"
                        />
                        <HelperText type="info">
                            Enter the unique identifier for this room.
                        </HelperText>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            label="Max Capacity"
                            value={maxSize}
                            onChangeText={setMaxSize}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            placeholder="e.g. 4"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            label="Select Hostel (Optional)"
                            value={selectedHostelName}
                            mode="outlined"
                            style={styles.input}
                            right={<TextInput.Icon icon="chevron-down" onPress={() => setShowHostelList(!showHostelList)} />}
                            onFocus={() => setShowHostelList(true)}
                            showSoftInputOnFocus={false}
                        />
                        {showHostelList && (
                            <View style={styles.hostelList}>
                                {loadingHostels ? (
                                    <ActivityIndicator animating={true} color="#FF6B35" />
                                ) : (
                                    hostels.map((hostel) => (
                                        <List.Item
                                            key={hostel.id}
                                            title={hostel.name}
                                            onPress={() => selectHostel(hostel.id, hostel.name)}
                                            style={styles.hostelItem}
                                        />
                                    ))
                                )}
                            </View>
                        )}
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleCreateRoom}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                    >
                        Create Room
                    </Button>

                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        elevation: 4,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: 'white',
    },
    button: {
        marginTop: 24,
        backgroundColor: '#FF6B35',
        paddingVertical: 6,
        borderRadius: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    hostelList: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        marginTop: 4,
        maxHeight: 200,
    },
    hostelItem: {
        padding: 0,
    }
});

export default AddRoomPage;
