import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Button from "@mui/material/Button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { API_BASE_URL } from "@/config/api";

export default function MessagingWidget() {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'chats' | 'contacts'>('chats'); // 'chats' or 'contacts'
    const [messages, setMessages] = useState<{ id: string; content: string; sender_admin_id: string | null; created_at?: string }[]>([]);
    const [conversations, setConversations] = useState<any[]>([]); // List of active conversations
    const [selectedConv, setSelectedConv] = useState<string | null>(null);
    const [messageText, setMessageText] = useState("");
    const [allUsers, setAllUsers] = useState<{ id: string; name: string; email?: string }[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [adminId, setAdminId] = useState<string | null>(null);
    const [adminName, setAdminName] = useState<string>("");

    useEffect(() => {
        const storedAdmin = localStorage.getItem("admin");
        console.log("[MessagingWidget] Checking admin in localStorage:", storedAdmin);
        if (storedAdmin) {
            const parsed = JSON.parse(storedAdmin);
            console.log("[MessagingWidget] Admin parsed:", parsed);
            setAdminId(parsed.id);
            setAdminName(parsed.name || "Admin");
        } else {
            console.warn("[MessagingWidget] No admin found in localStorage!");
        }
    }, []);

    // Fetch all users (contacts)
    const fetchAllUsers = async () => {
        try {
            console.log("[MessagingWidget] Fetching all users...");
            const res = await axios.get(`${API_BASE_URL}/admin/all-users`);
            console.log("[MessagingWidget] Users fetched:", res.data.length, "users");
            setAllUsers(res.data);
        } catch (error) {
            console.error("[MessagingWidget] Failed to fetch users", error);
        }
    };

    // Fetch active conversations
    const fetchConversations = async () => {
        if (!adminId) {
            console.warn("[MessagingWidget] Cannot fetch conversations - no adminId");
            return;
        }
        try {
            console.log("[MessagingWidget] Fetching conversations for admin:", adminId);
            const res = await axios.get(`${API_BASE_URL}/messaging/admin/conversations/${adminId}`);
            console.log("[MessagingWidget] Conversations fetched:", res.data.length, "conversations");
            setConversations(res.data);
        } catch (error) {
            console.error("[MessagingWidget] Failed to fetch conversations", error);
        }
    };

    // Fetch messages for a conversation
    const fetchMessages = async (conversation_id: string) => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/messaging/messages/${conversation_id}`
            );
            setMessages(res.data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    // Send message (admin side)
    const sendMessage = async () => {
        if (!messageText || !selectedConv) return;
        if (!adminId) return;

        try {
            await axios.post(`${API_BASE_URL}/messaging/message/send`, {
                conversation_id: selectedConv,
                content: messageText,
                sender_admin_id: adminId
            });

            setMessageText("");
            fetchMessages(selectedConv);
            fetchConversations(); // Update list to show new last message
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    useEffect(() => {
        if (open) {
            fetchAllUsers();
            if (adminId) fetchConversations();
        }
    }, [open, adminId]);

    // Initialize Socket.io
    useEffect(() => {
        const socket = io(API_BASE_URL.replace('/api', ''), {
            transports: ['websocket'],
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Admin Socket connected:', socket.id);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Join conversation room and listen for messages
    useEffect(() => {
        if (!selectedConv || !socketRef.current) return;

        // Join room
        socketRef.current.emit('joinConversation', `conversation_${selectedConv}`);
        console.log(`Admin joined conversation_${selectedConv}`);

        // Listen for new messages
        const handleNewMessage = (message: any) => {
            console.log('Admin received new message:', message);
            setMessages((prev) => [...prev, message]);
            fetchConversations(); // Update preview in real-time
        };

        // Listen for typing
        const handleDisplayTyping = (data: any) => {
            if (!data.isAdmin && `conversation_${data.conversationId}` === `conversation_${selectedConv}`) {
                setIsTyping(true);
            }
        };

        const handleHideTyping = (data: any) => {
            if (!data.isAdmin && `conversation_${data.conversationId}` === `conversation_${selectedConv}`) {
                setIsTyping(false);
            }
        };

        socketRef.current.on('newMessage', handleNewMessage);
        socketRef.current.on('displayTyping', handleDisplayTyping);
        socketRef.current.on('hideTyping', handleHideTyping);

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveConversation', `conversation_${selectedConv}`);
                socketRef.current.off('newMessage', handleNewMessage);
                socketRef.current.off('displayTyping', handleDisplayTyping);
                socketRef.current.off('hideTyping', handleHideTyping);
                console.log(`Admin left conversation_${selectedConv}`);
            }
        };
    }, [selectedConv]);

    // Handle typing input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setMessageText(text);

        if (!selectedConv || !socketRef.current || !adminId) return;

        // Emit typing event
        socketRef.current.emit('typing', {
            conversationId: selectedConv,
            userId: adminId,
            isAdmin: true
        });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            if (socketRef.current) {
                socketRef.current.emit('stopTyping', {
                    conversationId: selectedConv,
                    userId: adminId
                });
            }
        }, 1500);
    };

    // Helper to get user name
    const getUserName = (userId: string) => {
        const user = allUsers.find(u => u.id === userId);
        return user ? user.name : "Unknown User";
    };

    return (
        <>
            {/* Floating Chat Button */}
            <div
                className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-xl cursor-pointer hover:bg-primary/90 z-50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center w-14 h-14"
                onClick={() => setOpen(!open)}
            >
                <div className="text-2xl">💬</div>
            </div>

            {/* Chat Window */}
            {open && (
                <Card className="fixed bottom-24 right-6 w-96 h-[600px] bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden rounded-xl animate-in fade-in slide-in-from-bottom-10 duration-200">
                    {/* Header */}
                    <div className="p-4 bg-primary text-white font-semibold flex justify-between items-center shadow-md shrink-0">
                        {selectedConv ? (
                            // Chat View Header
                            <div className="flex items-center">
                                <button
                                    onClick={() => {
                                        setSelectedConv(null);
                                        setMessages([]);
                                        fetchConversations(); // refresh list on exit
                                    }}
                                    className="mr-3 font-bold text-xl hover:text-blue-100 transition-colors"
                                >
                                    ←
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">
                                        {conversations.find(c => c.id === selectedConv)
                                            ? getUserName(conversations.find(c => c.id === selectedConv).user_id)
                                            : 'Chat'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            // Main List Header
                            <div className="flex items-center justify-between w-full">
                                <span className="text-lg font-bold">{view === 'chats' ? (adminName ? `Chats (${adminName})` : 'Chats') : 'New Message'}</span>
                                {view === 'chats' && (
                                    <button
                                        onClick={() => setView('contacts')}
                                        className="text-xs bg-white text-primary hover:bg-red-50 px-3 py-1.5 rounded-full font-semibold transition-colors shadow-sm"
                                    >
                                        + New Chat
                                    </button>
                                )}
                                {view === 'contacts' && (
                                    <button
                                        onClick={() => setView('chats')}
                                        className="text-xs text-blue-100 hover:text-white px-2 py-1 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}
                        <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 ml-4">✕</button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">

                        {/* VIEW 1: Active Conversations List */}
                        {!selectedConv && view === 'chats' && (
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                        <div className="text-4xl mb-4">📭</div>
                                        <p>No active chats yet.</p>
                                        <p className="text-sm mt-2">Start a new conversation with a student!</p>
                                    </div>
                                ) : (
                                    conversations.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className="p-4 bg-white border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex flex-col transition-colors group"
                                            onClick={() => {
                                                setSelectedConv(conv.id);
                                                fetchMessages(conv.id);
                                            }}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-gray-800 text-sm">{getUserName(conv.user_id)}</span>
                                                {conv.updated_at && (
                                                    <span className="text-[10px] text-gray-400 group-hover:text-gray-500">
                                                        {new Date(conv.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-xs text-gray-500 truncate max-w-[200px] group-hover:text-gray-700">
                                                    {conv.last_message || "Start chatting..."}
                                                </div>
                                                {conv.updated_at && (
                                                    <div className="text-[10px] text-gray-300 group-hover:text-gray-400 ml-2">
                                                        {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* VIEW 2: All Contacts List */}
                        {!selectedConv && view === 'contacts' && (
                            <div className="flex-1 overflow-y-auto bg-white">
                                <div className="p-3 bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wider sticky top-0 border-b">Select a student</div>
                                {allUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-center transition-colors"
                                        onClick={async () => {
                                            console.log("[MessagingWidget] User clicked:", user.name, "ID:", user.id);
                                            if (!adminId) {
                                                console.error("[MessagingWidget] No adminId - cannot start chat");
                                                alert("Please log in as admin first");
                                                return;
                                            }
                                            try {
                                                console.log("[MessagingWidget] Starting conversation with user:", user.id, "admin:", adminId);
                                                const conv = await axios.post(
                                                    `${API_BASE_URL}/messaging/conversation/start`,
                                                    { admin_id: adminId, user_id: user.id }
                                                );
                                                console.log("[MessagingWidget] Conversation created:", conv.data);
                                                setSelectedConv(conv.data.id);
                                                fetchMessages(conv.data.id);
                                                setView('chats'); // Reset view for next time
                                            } catch (err: any) {
                                                console.error("[MessagingWidget] Error starting chat", err);
                                                console.error("[MessagingWidget] Error response:", err.response?.data);
                                                alert(`Failed to start chat: ${err.response?.data?.message || err.message}`);
                                            }
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-gray-800">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.email || 'Student ID: ' + user.id.substr(0, 6)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* VIEW 3: Chat Window (Messages) */}
                        {selectedConv && (
                            <div className="flex-1 flex flex-col h-full bg-gray-50/50">
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.map((msg) => {
                                        const isMe = !!msg.sender_admin_id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] p-2.5 rounded-lg shadow-sm relative text-sm ${isMe
                                                        ? "bg-primary/20 text-gray-800 rounded-tr-none"
                                                        : "bg-white text-gray-800 rounded-tl-none"
                                                        }`}
                                                >
                                                    {isMe && (
                                                        <div className="text-[10px] text-green-700 mb-0.5 font-medium flex justify-end">
                                                            {msg.sender_admin_id === adminId ? 'You' : `Admin`}
                                                        </div>
                                                    )}
                                                    <div className="break-words">{msg.content}</div>
                                                    <div className="text-[9px] text-gray-400 text-right mt-1 opacity-70">
                                                        {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={el => el?.scrollIntoView({ behavior: "smooth" })} />
                                </div>

                                {/* Message Input */}
                                <div className="p-3 bg-white border-t flex flex-col gap-2 shrink-0">
                                    {isTyping && (
                                        <div className="text-xs text-blue-500 italic px-2 animate-pulse">
                                            User is typing...
                                        </div>
                                    )}
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            className="flex-1 h-10 rounded-full border-gray-300 focus:ring-1 focus:ring-blue-500"
                                            placeholder="Type a message..."
                                            value={messageText}
                                            onChange={handleInputChange}
                                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={sendMessage}
                                            className="bg-primary hover:bg-primary/90 text-white rounded-full h-10 w-10 min-w-10 p-0 flex items-center justify-center shadow-md"
                                        >
                                            ➤
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </>
    );
}