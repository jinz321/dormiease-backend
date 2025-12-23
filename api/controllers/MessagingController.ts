import { Request, Response } from "express";
import { db } from "../config/firebase";
import { getIO } from "../config/socket";
import { parsePaginationParams, createPaginatedResponse } from "../utils/types";

export class MessagingController {

    /**
     * Start or get existing conversation
     * @route POST /api/conversations/start
     */
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

    /**
     * Send a message in a conversation
     * @route POST /api/messages
     */
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

    /**
 * Get all conversations for admin view (filtered by admin_id for privacy)
 * @route GET /api/admin/conversations/:admin_id
 */
    static async getAdminConversations(req: Request, res: Response) {
        try {
            const adminId = req.params.admin_id;

            if (!adminId) {
                return res.status(400).json({ message: "Admin ID is required" });
            }

            // Fetch ONLY conversations for this specific admin (privacy)
            const snapshot = await db.collection('conversations')
                .where('admin_id', '==', adminId)
                .orderBy('updated_at', 'desc')
                .get();

            const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return res.status(200).json(conversations);
        } catch (error) {
            console.error("Get admin conversations error:", error);
            return res.status(500).json({ message: "Failed to fetch conversations" });
        }
    }

    /**
     * Get conversations for a specific user
     * @route GET /api/user/conversations/:user_id
     */
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

    /**
     * Get messages for a conversation with optional pagination
     * @route GET /api/conversations/:conversation_id/messages?limit=50&offset=0
     * @query limit - Number of messages per page (default: 50, max: 100)
     * @query offset - Number of messages to skip (default: 0)
     */
    static async getMessages(req: Request, res: Response) {
        try {
            const { conversation_id } = req.params;
            const { limit, offset } = parsePaginationParams(req.query);
            const usePagination = req.query.limit !== undefined || req.query.offset !== undefined;

            // Get total count
            const countSnapshot = await db.collection('messages')
                .where('conversation_id', '==', conversation_id)
                .count()
                .get();
            const total = countSnapshot.data().count;

            // If no messages, return empty array
            if (total === 0) {
                if (usePagination) {
                    return res.status(200).json(createPaginatedResponse([], 0, limit, offset));
                } else {
                    return res.status(200).json([]);
                }
            }

            // Fetch with orderBy and pagination
            let query = db.collection('messages')
                .where('conversation_id', '==', conversation_id)
                .orderBy('created_at', 'asc');

            if (usePagination) {
                query = query.limit(limit).offset(offset);
            }

            const snapshot = await query.get();
            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    content: data.content || data.text,
                    sender_admin_id: data.sender_admin_id || (data.sender_id === '1' ? '1' : null)
                };
            });

            if (usePagination) {
                return res.status(200).json(createPaginatedResponse(messages, total, limit, offset));
            } else {
                return res.status(200).json(messages);
            }
        } catch (error) {
            console.error("Get messages error:", error);
            return res.status(500).json({ message: "Failed to fetch messages" });
        }
    }

    /**
     * Mark a message as read
     * @route PUT /api/messages/:message_id/read
     */
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
