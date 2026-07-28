import { apiPost, apiGet } from './api';

export const attendanceService = {
  checkIn: async (payload = {}) => {
    return await apiPost('/attendance/check-in', payload);
  },

  checkOut: async (payload = {}) => {
    return await apiPost('/attendance/check-out', payload);
  },

  getTodayStatus: async () => {
    return await apiGet('/attendance/today');
  },

  getMonthly: async (year, month) => {
    return await apiGet(`/attendance/monthly?year=${year}&month=${month}`);
  }
};
