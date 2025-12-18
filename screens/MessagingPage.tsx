import React, { useEffect, useState, useRef } from "react";
import {
    View,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StyleSheet
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import {
    Text,
    Card,
    Avatar,
    TextInput,
    IconButton,
    useTheme,
    Surface,
    Title,
    Divider
} from "react-native-paper";

import { API_URL, BASE_URL } from '../config';

const API_BASE = API_URL;

export default function MessagingPage({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [adminList, setAdminList] = useState<any[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageText, setMessageText] = useState("");
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [adminTyping, setAdminTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const theme = useTheme();

    // -----------------------------------------
    // Load logged in user
    // -----------------------------------------
    const loadUser = async () => {
        const json = await AsyncStorage.getItem("user");
        if (!json) return navigation.replace("Login");
        setUser(JSON.parse(json));
    };

    // -----------------------------------------
    // Fetch admin list from API
    // -----------------------------------------
    const fetchAdmins = async () => {
        try {
            const res = await axios.get(`${API_BASE}/user/all-admins`);
            setAdminList(res.data); // expects: [{id, name}, ...]
        } catch (error: any) {
            console.error('Failed to fetch admins:', error);
            // Silently fail - show "No admins found" instead of blocking alert
        }
    };

    // -----------------------------------------
    // Start or get conversation
    // -----------------------------------------
    const openConversation = async (admin: any) => {
        try {
            setSelectedAdmin(admin);

            const res = await axios.post(`${API_BASE}/messaging/user/conversations/${user.id}`, {
                admin_id: admin.id,
            });

            setConversationId(res.data.id);
            loadMessages(res.data.id);
        } catch (error: any) {
            console.error('Failed to open conversation:', error);
            Alert.alert('Error', 'Failed to start conversation');
            setSelectedAdmin(null);
        }
    };

    // -----------------------------------------
    // Load messages with real-time updates
    // -----------------------------------------
    const loadMessages = async (convId: number) => {
        try {
            const res = await axios.get(`${API_BASE}/messaging/messages/${convId}`);
            setMessages(res.data); // show newest at bottom
        } catch (error: any) {
            console.error('Failed to load messages:', error);
        }
    };

    // -----------------------------------------
    // Send message
    // -----------------------------------------
    const sendMessage = async () => {
        if (!messageText.trim() || !conversationId) return;

        try {
            await axios.post(`${API_BASE}/messaging/send`, {
                conversation_id: conversationId,
                content: messageText,
                sender_user_id: user.id
            });

            setMessageText("");
            setIsTyping(false);
            if (socketRef.current) {
                socketRef.current.emit('stopTyping', { conversationId: conversationId.toString(), userId: user.id });
            }
        } catch (error: any) {
            console.error('Failed to send message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const handleTyping = (text: string) => {
        setMessageText(text);

        if (!socketRef.current || !conversationId) return;

        if (!isTyping) {
            setIsTyping(true);
            socketRef.current.emit('typing', { conversationId: conversationId.toString(), userId: user.id, isAdmin: false });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (socketRef.current) {
                socketRef.current.emit('stopTyping', { conversationId: conversationId.toString(), userId: user.id });
            }
        }, 1500);
    };

    // -----------------------------------------
    // Load on mount
    // -----------------------------------------
    useEffect(() => {
        loadUser();
        fetchAdmins();

        // Initialize Socket.io connection
        const socket = io(BASE_URL, {
            transports: ['websocket'],
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Mobile] Socket connected:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('[Mobile] Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('[Mobile] Socket connection error:', error);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    // -----------------------------------------
    // Real-time message updates via WebSocket
    // -----------------------------------------
    useEffect(() => {
        if (!conversationId || !socketRef.current) return;

        // Initial load
        loadMessages(conversationId);

        // Join this conversation room (with 'conversation_' prefix to match backend)
        socketRef.current.emit('joinConversation', `conversation_${conversationId}`);
        console.log(`Joined conversation_${conversationId}`);

        // Listen for new messages
        const handleNewMessage = (message: any) => {
            console.log('[Mobile] ✅ Received new message:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        const handleDisplayTyping = (data: any) => {
            if (data.isAdmin) {
                setAdminTyping(true);
            }
        };

        const handleHideTyping = (data: any) => {
            setAdminTyping(false);
        };

        socketRef.current.on('newMessage', handleNewMessage);
        socketRef.current.on('displayTyping', handleDisplayTyping);
        socketRef.current.on('hideTyping', handleHideTyping);

        // Cleanup when conversation changes or unmounts
        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveConversation', `conversation_${conversationId}`);
                socketRef.current.off('newMessage', handleNewMessage);
                socketRef.current.off('displayTyping', handleDisplayTyping);
                socketRef.current.off('hideTyping', handleHideTyping);
                console.log(`Left conversation_${conversationId}`);
            }
        };
    }, [conversationId]);

    // -----------------------------------------
    // Render each admin in the list
    // -----------------------------------------
    const renderAdminItem = ({ item }: any) => (
        <Card style={styles.card} onPress={() => openConversation(item)} mode="elevated">
            <Card.Title
                title={item.name}
                subtitle="Support Agent"
                left={(props) => <Avatar.Text {...props} label={item.name.charAt(0).toUpperCase()} style={{ backgroundColor: theme.colors.primary }} />}
                right={(props) => <IconButton {...props} icon="message-text" />}
            />
        </Card>
    );

    // -----------------------------------------
    // Render chat bubble
    // -----------------------------------------
    const renderMessage = ({ item }: any) => {
        const isMine = user ? item.sender_user_id === user.id : false;

        return (
            <Surface
                style={[
                    styles.bubble,
                    isMine ? { backgroundColor: theme.colors.primary, alignSelf: "flex-end", borderBottomRightRadius: 4 }
                        : { backgroundColor: "white", alignSelf: "flex-start", borderBottomLeftRadius: 4 }
                ]}
                elevation={1}
            >
                {!isMine && (
                    <Text variant="labelSmall" style={{ color: '#64748b', marginBottom: 2 }}>
                        {selectedAdmin ? selectedAdmin.name : 'Admin'}
                    </Text>
                )}
                <Text style={{ color: isMine ? 'white' : '#1e293b', fontSize: 16 }}>
                    {item.content}
                </Text>
                <Text style={{ color: isMine ? 'rgba(255,255,255,0.7)' : '#94a3b8', fontSize: 10, alignSelf: 'flex-end', marginTop: 4 }}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </Surface>
        );
    };

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------
    return (
        <View style={{ flex: 1, backgroundColor: "#f4f6f9" }}>
            {/* ------------------------- */}
            {/* Step 1: Admin List        */}
            {/* ------------------------- */}
            {!selectedAdmin && (
                <View style={{ flex: 1, padding: 16 }}>
                    <Title style={styles.sectionTitle}>Select Support Agent</Title>

                    <FlatList
                        data={adminList}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderAdminItem}
                        ListEmptyComponent={
                            <Text style={{ marginTop: 20, textAlign: "center", color: '#94a3b8' }}>
                                No admins found.
                            </Text>
                        }
                    />
                </View>
            )}

            {/* ------------------------- */}
            {/* Step 2: Chat Messages     */}
            {/* ------------------------- */}
            {selectedAdmin && (
                <View style={{ flex: 1 }}>
                    {/* Header */}
                    <Surface style={styles.chatHeader} elevation={2}>
                        <IconButton icon="arrow-left" onPress={() => {
                            setSelectedAdmin(null);
                            setConversationId(null);
                            setMessages([]);
                            setAdminTyping(false);
                        }}
                        />
                        <Avatar.Text size={40} label={selectedAdmin.name.charAt(0).toUpperCase()} style={{ backgroundColor: theme.colors.primary }} />
                        <View style={{ marginLeft: 10 }}>
                            <Title style={{ fontSize: 18 }}>{selectedAdmin.name}</Title>
                            <Text variant="labelSmall" style={{ color: adminTyping ? '#22c55e' : '#64748b' }}>
                                {adminTyping ? 'Typing...' : 'Online'}
                            </Text>
                        </View>
                    </Surface>

                    {/* Messages */}
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderMessage}
                        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                    />

                    {/* Input */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <Surface style={styles.inputBar} elevation={4}>
                            <TextInput
                                mode="outlined"
                                value={messageText}
                                onChangeText={handleTyping}
                                placeholder="Type a message..."
                                style={styles.input}
                                outlineStyle={{ borderRadius: 24 }}
                                dense
                                right={<TextInput.Icon icon="send" onPress={sendMessage} disabled={!messageText.trim()} color={theme.colors.primary} />}
                            />
                        </Surface>
                    </KeyboardAvoidingView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: '#1e293b'
    },
    card: {
        marginBottom: 10,
        backgroundColor: "white",
    },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        backgroundColor: "white",
    },
    bubble: {
        padding: 12,
        marginVertical: 4,
        borderRadius: 16,
        maxWidth: "80%"
    },
    inputBar: {
        padding: 12,
        backgroundColor: "white",
    },
    input: {
        backgroundColor: "white",
        fontSize: 16
    }
});
