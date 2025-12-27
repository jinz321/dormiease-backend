import React, { useEffect, useState, useRef } from "react";
import {
    View,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import {
    Text,
    TextInput,
    IconButton,
} from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';
import { ModernCard } from '../components/ModernCard';
import { theme } from '../theme/theme';
import * as Animatable from 'react-native-animatable';

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
    const [adminTyping, setAdminTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const loadUser = async () => {
        const json = await AsyncStorage.getItem("user");
        if (!json) return navigation.replace("Login");
        setUser(JSON.parse(json));
    };

    const fetchAdmins = async () => {
        try {
            const res = await axios.get(`${API_BASE}/user/all-admins`);
            setAdminList(res.data);
        } catch (error: any) {
            console.error('Failed to fetch admins:', error);
        }
    };

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

    const loadMessages = async (convId: number) => {
        try {
            const res = await axios.get(`${API_BASE}/messaging/messages/${convId}`);
            setMessages(res.data);
        } catch (error: any) {
            console.error('Failed to load messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim() || !conversationId) return;

        try {
            const res = await axios.post(`${API_BASE}/messaging/send`, {
                conversation_id: conversationId,
                sender_id: user.id,
                content: messageText.trim(),
                is_admin: false,
            });

            setMessageText("");

            if (socketRef.current) {
                socketRef.current.emit('sendMessage', {
                    room: `conversation_${conversationId}`,
                    message: res.data,
                });
            }
        } catch (error: any) {
            console.error('Failed to send message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };

    useEffect(() => {
        loadUser();
        fetchAdmins();
    }, []);

    useEffect(() => {
        const socket = io(BASE_URL, {
            transports: ['websocket'],
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Mobile] Socket connected:', socket.id);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!conversationId || !socketRef.current) return;

        loadMessages(conversationId);
        socketRef.current.emit('joinConversation', `conversation_${conversationId}`);

        const handleNewMessage = (message: any) => {
            setMessages((prev) => [...prev, message]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        };

        const handleDisplayTyping = (data: any) => {
            if (data.isAdmin) setAdminTyping(true);
        };

        const handleHideTyping = (data: any) => {
            if (data.isAdmin) setAdminTyping(false);
        };

        socketRef.current.on('newMessage', handleNewMessage);
        socketRef.current.on('displayTyping', handleDisplayTyping);
        socketRef.current.on('hideTyping', handleHideTyping);

        return () => {
            socketRef.current?.off('newMessage', handleNewMessage);
            socketRef.current?.off('displayTyping', handleDisplayTyping);
            socketRef.current?.off('hideTyping', handleHideTyping);
        };
    }, [conversationId]);

    const renderMessage = ({ item }: any) => {
        const isUser = !item.is_admin;

        return (
            <Animatable.View
                animation={isUser ? "fadeInRight" : "fadeInLeft"}
                duration={300}
                style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.adminMessageContainer]}
            >
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.adminBubble]}>
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.adminText]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.adminTimestamp]}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </Animatable.View>
        );
    };

    if (!selectedAdmin) {
        return (
            <GradientBackground colors={theme.gradients.primary}>
                <View style={styles.container}>
                    <Animatable.View animation="fadeInDown" style={styles.header}>
                        <Text style={styles.headerTitle}>Messages</Text>
                        <Text style={styles.headerSubtitle}>Chat with admin</Text>
                    </Animatable.View>

                    {adminList.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={80} color={theme.colors.text.white} opacity={0.5} />
                            <Text style={styles.emptyText}>No admins available</Text>
                        </View>
                    ) : (
                        <View style={styles.adminListContainer}>
                            {adminList.map((admin, index) => (
                                <Animatable.View key={admin.id} animation="fadeInUp" delay={index * 100}>
                                    <TouchableOpacity onPress={() => openConversation(admin)}>
                                        <ModernCard style={styles.adminCard} shadow="medium">
                                            <View style={styles.adminCardContent}>
                                                <View style={styles.adminAvatar}>
                                                    <Ionicons name="person" size={24} color={theme.colors.primary} />
                                                </View>
                                                <View style={styles.adminInfo}>
                                                    <Text style={styles.adminName}>{admin.name}</Text>
                                                    <Text style={styles.adminRole}>Administrator</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={24} color={theme.colors.text.light} />
                                            </View>
                                        </ModernCard>
                                    </TouchableOpacity>
                                </Animatable.View>
                            ))}
                        </View>
                    )}
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground colors={theme.gradients.primary}>
            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <View style={styles.chatHeader}>
                    <TouchableOpacity onPress={() => setSelectedAdmin(null)} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text.white} />
                    </TouchableOpacity>
                    <View style={styles.chatHeaderInfo}>
                        <Text style={styles.chatHeaderName}>{selectedAdmin.name}</Text>
                        {adminTyping && <Text style={styles.typingIndicator}>typing...</Text>}
                    </View>
                </View>

                <View style={styles.messagesContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item, index) => `${item.id || index}`}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        value={messageText}
                        onChangeText={setMessageText}
                        placeholder="Type a message..."
                        style={styles.input}
                        mode="outlined"
                        multiline
                        maxLength={500}
                    />
                    <IconButton
                        icon="send"
                        size={24}
                        iconColor={theme.colors.accent}
                        onPress={sendMessage}
                        disabled={!messageText.trim()}
                        style={styles.sendButton}
                    />
                </View>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: theme.spacing.xl,
        paddingTop: theme.spacing.xxxl,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text.white,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.text.white,
        opacity: 0.8,
        marginTop: theme.spacing.xs,
    },
    adminListContainer: {
        padding: theme.spacing.lg,
    },
    adminCard: {
        marginBottom: theme.spacing.md,
    },
    adminCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    adminInfo: {
        flex: 1,
    },
    adminName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    adminRole: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.text.white,
        marginTop: theme.spacing.lg,
    },
    chatContainer: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xxxl,
    },
    backButton: {
        marginRight: theme.spacing.md,
    },
    chatHeaderInfo: {
        flex: 1,
    },
    chatHeaderName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.white,
    },
    typingIndicator: {
        fontSize: 12,
        color: theme.colors.text.white,
        opacity: 0.7,
        fontStyle: 'italic',
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    messagesList: {
        padding: theme.spacing.lg,
    },
    messageContainer: {
        marginBottom: theme.spacing.md,
        maxWidth: '80%',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
    },
    adminMessageContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.large,
    },
    userBubble: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    adminBubble: {
        backgroundColor: theme.colors.background,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: theme.colors.text.white,
    },
    adminText: {
        color: theme.colors.text.primary,
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
    },
    userTimestamp: {
        color: theme.colors.text.white,
        opacity: 0.7,
        textAlign: 'right',
    },
    adminTimestamp: {
        color: theme.colors.text.light,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: theme.colors.background,
    },
    input: {
        flex: 1,
        marginRight: theme.spacing.sm,
        backgroundColor: 'white',
    },
    sendButton: {
        margin: 0,
    },
});
