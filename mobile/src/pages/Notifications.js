import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../_utils/api';
import { AuthContext } from '../_utils/AuthContext';
import { COLORS } from '../_styles/theme';
import moment from 'moment';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import socketService from '../_utils/socket';

export default function Notifications({ navigation }) {
    const { userToken, setUnreadNotifications } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications?limit=50'); // fetch a decent chunk
            if (res.data) {
                setNotifications(res.data);
                
                // Recalculate unread badge whenever we fetch
                const unreadCount = res.data.filter(n => !n.is_read).length;
                setUnreadNotifications(unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleNewNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
        };

        socketService.onNotification(handleNewNotification);

        return () => {
            socketService.offNotification(handleNewNotification);
        };
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (id, currentStatus) => {
        if (currentStatus) return; // already read

        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadNotifications(prev => Math.max(0, prev - 1));

            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking as read:', error);
            // Revert on failure
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
         try {
             // Optimistic
             setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
             setUnreadNotifications(0);

             await api.put('/notifications/read-all');
         } catch (error) {
             console.error('Error marking all as read:', error);
             fetchNotifications(); // reload
         }
    };

    const getNotificationIcon = (type) => {
        if (type.includes('LEAVE_TYPE')) return 'playlist-add';
        if (type.includes('LEAVE')) return 'event';
        if (type.includes('OVERTIME')) return 'schedule';
        if (type.includes('CORRECTION')) return 'history';
        if (type.includes('LATE_CHECK_IN')) return 'alarm';
        if (type.includes('EARLY_CHECK_OUT')) return 'exit-to-app';
        if (type.includes('ACCOUNT_CREATED')) return 'person-add';
        if (type.includes('ACCOUNT_UPDATED')) return 'manage-accounts';
        if (type.includes('ACCOUNT_DEACTIVATED')) return 'person-off';
        if (type.includes('SHIFT_UPDATED')) return 'update';
        return 'notifications';
    };

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity 
                style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
                onPress={() => markAsRead(item.id, item.is_read)}
            >
                <View style={styles.iconContainer}>
                     <Icon 
                        name={getNotificationIcon(item.type)} 
                        size={24} 
                        color={COLORS.primary} 
                     />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.time}>{moment(item.created_at).fromNow()}</Text>
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>All Notifications</Text>
                {notifications.some(n => !n.is_read) && (
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={styles.markAllText}>Mark as read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {notifications.length === 0 ? (
                <View style={styles.center}>
                    <Icon name="notifications-none" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No notifications yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    center: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    markAllText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '500'
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        alignItems: 'flex-start'
    },
    unreadCard: {
        backgroundColor: '#f0f7ff',
    },
    iconContainer: {
        marginRight: 12,
        padding: 8,
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        borderRadius: 20,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#444',
        marginBottom: 4,
    },
    unreadText: {
        color: '#000',
        fontWeight: 'bold',
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 6,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginTop: 6,
        marginLeft: 8,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 15,
        color: '#888'
    }
});
