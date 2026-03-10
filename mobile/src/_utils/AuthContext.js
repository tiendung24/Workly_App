import React, { createContext, useState, useEffect } from 'react';
import { authService } from './authService';
import { ActivityIndicator, View } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Check token on app load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await authService.getToken();
        const user = await authService.getUser();
        
        if (token && user) {
          setUserToken(token);
          setUserInfo(user);
          // Optional: Verify token with backend by calling getMe()
          try {
             const response = await authService.getMe();
             setUserInfo(response.user);
          } catch (e) {
             console.log("Token invalid or expired, logging out automatically");
             await authService.logout();
             setUserToken(null);
             setUserInfo(null);
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
