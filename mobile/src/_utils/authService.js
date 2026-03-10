import { apiPost, apiGet } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (email, password) => {
    const response = await apiPost('/auth/login', { email, password });
    if (response.token) {
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
    }
    return response;
  },

  register: async (userData) => {
    const response = await apiPost('/auth/register', userData);
    if (response.token) {
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
    }
    return response;
  },

  forgotPassword: async (email) => {
    return await apiPost('/auth/forgot-password', { email });
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
  },

  getMe: async () => {
    const response = await apiGet('/auth/me');
    if (response.user) {
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
    }
    return response;
  },
  
  getToken: async () => {
    return await AsyncStorage.getItem('userToken');
  },

  getUser: async () => {
    const userStr = await AsyncStorage.getItem('userInfo');
    return userStr ? JSON.parse(userStr) : null;
  }
};
