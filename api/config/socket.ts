import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketServer | null = null;

export function initializeSocket(httpServer: HTTPServer) {
    io = new SocketServer(httpServer, {
        cors: {
            origin: "*", // In production, specify your mobile app origin
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join a conversation room
        socket.on('joinConversation', (conversationId: string) => {
            const roomName = conversationId.startsWith('conversation_') ? conversationId : `conversation_${conversationId}`;
            socket.join(roomName);
            console.log(`[Socket.io] Socket ${socket.id} joined room: ${roomName}`);

            // Log all clients in this room
            const room = io?.sockets.adapter.rooms.get(roomName);
            console.log(`[Socket.io] Room ${roomName} now has ${room?.size || 0} clients`);
        });

        // Leave a conversation room
        socket.on('leaveConversation', (conversationId: string) => {
            const roomName = conversationId.startsWith('conversation_') ? conversationId : `conversation_${conversationId}`;
            socket.leave(roomName);
            console.log(`[Socket.io] Socket ${socket.id} left room: ${roomName}`);
        });

        // Typing indicators
        socket.on('typing', (data: { conversationId: string, userId: string, isAdmin: boolean }) => {
            socket.to(`conversation_${data.conversationId}`).emit('displayTyping', data);
        });

        socket.on('stopTyping', (data: { conversationId: string, userId: string }) => {
            socket.to(`conversation_${data.conversationId}`).emit('hideTyping', data);
        });

        // WhatsApp-like message status events
        socket.on('messageDelivered', async (data: { messageId: string, conversationId: string }) => {
            console.log(`[Socket.io] Message ${data.messageId} delivered`);
            // Emit to sender that message was delivered
            socket.to(`conversation_${data.conversationId}`).emit('messageStatusUpdate', {
                messageId: data.messageId,
                status: 'delivered',
                timestamp: new Date().toISOString()
            });
        });

        socket.on('messageRead', async (data: { messageId: string, conversationId: string }) => {
            console.log(`[Socket.io] Message ${data.messageId} read`);
            // Emit to sender that message was read
            socket.to(`conversation_${data.conversationId}`).emit('messageStatusUpdate', {
                messageId: data.messageId,
                status: 'read',
                timestamp: new Date().toISOString()
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

export function getIO(): SocketServer {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocket first.');
    }
    return io;
}
