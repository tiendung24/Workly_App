import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Modal, Dimensions, Platform
} from 'react-native';
import api from '../_utils/api';
import { AuthContext } from '../_utils/AuthContext';
import { COLORS } from '../_styles/theme';
import moment from 'moment';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import socketService from '../_utils/socket';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NotificationModal({ visible, onClose }) {
    const { setUnreadNotifications } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications?limit=50');
            if (res.data) {
                setNotifications(res.data);
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
        if (visible) {
            setLoading(true);
            fetchNotifications();
        }
    }, [visible]);

    useEffect(() => {
        const handleNewNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
        };

        if (visible) {
            socketService.onNotification(handleNewNotification);
        }

        return () => {
            socketService.offNotification(handleNewNotification);
        };
    }, [visible]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (id, currentStatus) => {
        if (currentStatus) return;
        try {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadNotifications(prev => Math.max(0, prev - 1));
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking as read:', error);
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadNotifications(0);
            await api.put('/notifications/read-all');
        } catch (error) {
            console.error('Error marking all as read:', error);
            fetchNotifications();
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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
            onPress={() => markAsRead(item.id, item.is_read)}
        >
            <View style={styles.iconContainer}>
                <Icon name={getNotificationIcon(item.type)} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.time}>{moment(item.created_at).fromNow()}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={onClose} />

                {/* Dropdown panel from top-right */}
                <View style={styles.dropdownContainer}>
                    {/* Arrow pointer */}
                    <View style={styles.arrow} />

                    {/* Header */}
                    <View style={styles.headerRow}>
                        <View style={styles.headerLeft}>
                            <Icon name="notifications" size={20} color={COLORS.primary} />
                            <Text style={styles.headerTitle}>Notifications</Text>
                        </View>
                        <View style={styles.headerActions}>
                            {notifications.some(n => !n.is_read) && (
                                <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
                                    <Icon name="done-all" size={14} color={COLORS.primary} />
                                    <Text style={styles.markAllText}>Mark all as read</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Icon name="close" size={20} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        </View>
                    ) : notifications.length === 0 ? (
                        <View style={styles.center}>
                            <Icon name="notifications-none" size={40} color="#ddd" />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderItem}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            showsVerticalScrollIndicator={false}
                            style={styles.list}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    overlayBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    arrow: {
        position: 'absolute',
        top: -8,
        right: 20,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#fff',
    },
    dropdownContainer: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 50 : 90,
        right: 10,
        left: 10,
        maxHeight: SCREEN_HEIGHT * 0.6,
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginLeft: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    markAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: `${COLORS.primary}15`,
        marginRight: 8,
    },
    markAllText: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 3,
    },
    closeBtn: {
        padding: 2,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 36,
    },
    list: {
        maxHeight: SCREEN_HEIGHT * 0.5,
    },
    notificationCard: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        alignItems: 'flex-start',
    },
    unreadCard: {
        backgroundColor: '#f0f7ff',
    },
    iconContainer: {
        marginRight: 10,
        padding: 6,
        backgroundColor: `${COLORS.primary}12`,
        borderRadius: 16,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: '#444',
        marginBottom: 2,
    },
    unreadText: {
        color: '#000',
        fontWeight: 'bold',
    },
    message: {
        fontSize: 12,
        color: '#777',
        lineHeight: 17,
        marginBottom: 3,
    },
    time: {
        fontSize: 10,
        color: '#aaa',
    },
    unreadDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginTop: 5,
        marginLeft: 4,
    },
    emptyText: {
        marginTop: 8,
        fontSize: 13,
        color: '#bbb',
    },
});
