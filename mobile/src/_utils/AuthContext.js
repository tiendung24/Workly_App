import React, { createContext, useState, useEffect } from 'react';
import { authService } from './authService';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import socketService from './socket';
import Toast from 'react-native-toast-message';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Provide a function to manually trigger count refresh
  const fetchUnreadCount = async () => {
      if (!userToken) return;
      try {
          const res = await api.get('/notifications/unread-count');
          if (res.success) {
             setUnreadNotifications(res.count);
          }
      } catch (err) {
         console.log('Error fetching unread count:', err);
      }
  };

  // Check token on app load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await authService.getToken();
        const cachedUser = await authService.getUser(); // authService returns object or null
        
        if (token && cachedUser) {
          let userObj = cachedUser;

          try {
            // Verify profile on load
            const freshProfileRes = await authService.getMe();
            if (freshProfileRes && freshProfileRes.user) {
                userObj = { ...userObj, ...freshProfileRes.user };
                await AsyncStorage.setItem('userInfo', JSON.stringify(userObj));
            }
            setUserToken(token);
            setUserInfo(userObj);
            
            socketService.connect(userObj.id); // Connect socket after user info is set
            fetchUnreadCount(); // Fetch count on init
          } catch (e) {
            console.log("Cannot fetch fresh profile, error:", e);
            if (e.status === 401 || e.status === 403 || e.status === 404) {
              console.log("Token expired or invalid, logging out");
              await authService.logout();
              setUserToken(null);
              setUserInfo(null);
            } else {
              // Network error or server down, fallback to cached
              console.log("Using cached profile due to network/server error");
              setUserToken(token);
              setUserInfo(userObj);
              socketService.connect(userObj.id);
              fetchUnreadCount();
            }
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUserToken(response.token);
      setUserInfo(response.user);
      socketService.connect(response.user.id);
      fetchUnreadCount();
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setUserToken(response.token);
      setUserInfo(response.user);
      socketService.connect(response.user.id);
      fetchUnreadCount();
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUserToken(null);
      setUserInfo(null);
      socketService.disconnect(); // Disconnect socket on logout
      setUnreadNotifications(0); // Reset unread notifications on logout
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Socket listener effect
  useEffect(() => {
    const handleNotification = (notification) => {
      setUnreadNotifications(prev => prev + 1);
      Toast.show({
        type: 'info',
        text1: notification.title,
        text2: notification.message,
        position: 'top',
        visibilityTime: 4000
      });
    };

    if (userToken) {
       socketService.onNotification(handleNotification);
    }

    return () => {
       socketService.offNotification(handleNotification);
    };
  }, [userToken]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      login, 
      register, 
      logout, 
      userToken, 
      userInfo, 
      isLoading,
      unreadNotifications, 
      setUnreadNotifications 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
