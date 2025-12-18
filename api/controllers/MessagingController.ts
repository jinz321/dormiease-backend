import { Request, Response } from "express";
import { db } from "../config/firebase";
import { getIO } from "../config/socket";

export class MessagingController {

    static async startConversation(req: Request, res: Response) {
        try {
            // Support both /conversation/start (body) and /user/conversations/:user_id (params + body)
            const user_id = req.params.user_id || req.body.user_id;
            const admin_id = req.body.admin_id;  // Still accept for backwards compatibility

            if (!user_id) {
                return res.status(400).json({ message: "user_id is required" });
            }

            // Check if conversation already exists for this user (shared among all admins)
            const existing = await db.collection('conversations')
                .where('user_id', '==', user_id)
                .limit(1)
                .get();

            if (!existing.empty) {
                return res.status(200).json({ id: existing.docs[0].id });
            }

            // Create new conversation without tying to specific admin
            const ref = db.collection('conversations').doc();
            await ref.set({
                id: ref.id,
                user_id,
                admin_id: null,  // Shared conversation, not tied to specific admin
                created_at: new Date().toISOString()
            });

            return res.status(201).json({ id: ref.id });
        } catch (error) {
            console.error("Start conversation error:", error);
            return res.status(500).json({ message: "Failed to start conversation" });
        }
    }

    static async sendMessage(req: Request, res: Response) {
        try {
            const { conversation_id, sender_id, sender_user_id, sender_admin_id, text, content } = req.body;

            // Support multiple parameter names for flexibility
            const finalSenderId = sender_id || sender_user_id || sender_admin_id;
            const finalText = text || content;

            if (!conversation_id || !finalSenderId || !finalText) {
                return res.status(400).json({ message: "conversation_id, sender_id and content are required" });
            }

            const ref = db.collection('messages').doc();
            const message = {
                id: ref.id,
                conversation_id,
                sender_id: finalSenderId,
                sender_user_id: sender_user_id || sender_id || null,
                sender_admin_id: sender_admin_id || null,
                text: finalText,
                content: finalText,
                is_read: false,
                created_at: new Date().toISOString(),

                // WhatsApp-like status tracking
                status: 'sent',
                delivered_at: null,
                read_at: null
            };

            await ref.set(message);

            // Update conversation with last message details
            await db.collection('conversations').doc(conversation_id).update({
                last_message: finalText,
                updated_at: new Date().toISOString()
            });

            // Emit real-time event to all clients in this conversation
            try {
                const io = getIO();
                const roomName = `conversation_${conversation_id}`;

                console.log(`[MessagingController] Emitting newMessage to room: ${roomName}`);
                console.log(`[MessagingController] Message data:`, { id: message.id, content: finalText, sender_user_id, sender_admin_id });

                // Check how many clients are in the room
                const room = io.sockets.adapter.rooms.get(roomName);
                console.log(`[MessagingController] Room ${roomName} has ${room?.size || 0} clients`);

                io.to(roomName).emit('newMessage', message);
                console.log(`[MessagingController] ✅ Message emitted successfully`);
            } catch (socketError) {
                console.error('[MessagingController] ❌ Socket.io error:', socketError);
                // Continue even if socket emission fails
            }

            return res.status(201).json(message);
        } catch (error) {
            console.error("Send message error:", error);
            return res.status(500).json({ message: "Failed to send message" });
        }
    }

    static async getAdminConversations(req: Request, res: Response) {
        try {
            // Fetch ALL conversations - shared among all admins
            const snapshot = await db.collection('conversations').get();
            const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort by latest activity (updated_at)
            conversations.sort((a: any, b: any) => {
                const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
                const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
                return dateB - dateA;  // Most recent first
            });

            return res.status(200).json(conversations);
        } catch (error) {
            console.error("Get admin conversations error:", error);
            return res.status(500).json({ message: "Failed to fetch conversations" });
        }
    }

    static async getUserConversations(req: Request, res: Response) {
        try {
            const { user_id } = req.params;
            const snapshot = await db.collection('conversations').where('user_id', '==', user_id).get();
            const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.status(200).json(conversations);
        } catch (error) {
            console.error("Get user conversations error:", error);
            return res.status(500).json({ message: "Failed to fetch conversations" });
        }
    }

    static async getMessages(req: Request, res: Response) {
        try {
            const { conversation_id } = req.params;
            const snapshot = await db.collection('messages')
                .where('conversation_id', '==', conversation_id)
                .get();

            // Manual sort to avoid index
            interface MessageData {
                id: string;
                created_at?: string;
                content?: unknown;
                sender_admin_id?: unknown;
                [key: string]: unknown;
            }
            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    content: data.content || data.text,
                    sender_admin_id: data.sender_admin_id || (data.sender_id === '1' ? '1' : null) // Assuming '1' is admin for now
                } as MessageData;
            }).sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

            return res.status(200).json(messages);
        } catch (error) {
            console.error("Get messages error:", error);
            return res.status(500).json({ message: "Failed to fetch messages" });
        }
    }

    static async markAsRead(req: Request, res: Response) {
        try {
            const { message_id } = req.params;
            await db.collection('messages').doc(message_id).update({ is_read: true });
            return res.status(200).json({ message: "Message marked as read" });
        } catch (error) {
            console.error("Mark as read error:", error);
            return res.status(500).json({ message: "Failed to mark message as read" });
        }
    }
}
