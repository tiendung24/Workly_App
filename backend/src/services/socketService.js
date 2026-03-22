let io;
const userSockets = new Map(); // Map to store userId -> socket.id

const initSocket = (socketIoInstance) => {
    io = socketIoInstance;
    io.on('connection', (socket) => {
        console.log(`🔌 New socket connected: ${socket.id}`);

        socket.on('register', (userId) => {
            if (userId) {
                userSockets.set(userId.toString(), socket.id);
                console.log(`User ${userId} registered with socket ${socket.id}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
            // Remove from userSockets map
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`User ${userId} unregistered.`);
                    break;
                }
            }
        });
    });
};

const emitNotification = (userId, notification) => {
    try {
        if (!io) {
            console.warn('Socket.io is not initialized.');
            return;
        }

        const socketId = userSockets.get(userId.toString());
        if (socketId) {
            io.to(socketId).emit('notification', notification);
            console.log(`🔔 Emitted notification to user ${userId}`);
        } else {
            console.log(`🔕 User ${userId} is not currently connected to receive notification.`);
        }
    } catch (error) {
        console.error('Error emitting notification:', error);
    }
};

module.exports = {
    initSocket,
    emitNotification,
};
