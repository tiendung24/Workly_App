import io from 'socket.io-client';
import { API_BASE } from './api';

class SocketService {
    socket = null;

    connect(userId) {
        if (!this.socket) {
            // Assume API_BASE is something like "http://192.168.1.x:3000/api"
            // We want to connect to the base URL
            const baseURL = API_BASE.replace('/api', '');

            this.socket = io(baseURL, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: Infinity,
            });

            this.socket.on('connect', () => {
                console.log('🔗 WebSocket Connected!', this.socket.id);
                // Register user to receive targeted notifications
                if (userId) {
                    this.socket.emit('register', userId);
                }
            });

            this.socket.on('disconnect', () => {
                console.log('🔌 WebSocket Disconnected');
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notification', callback);
        }
    }

    offNotification(callback) {
        if (this.socket) {
            if (callback) {
                this.socket.off('notification', callback);
            } else {
                this.socket.off('notification');
            }
        }
    }
}

const socketService = new SocketService();
export default socketService;
