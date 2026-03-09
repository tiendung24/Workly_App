import { apiPost, apiGet } from './api';

export const attendanceService = {
  checkIn: async () => {
    return await apiPost('/attendance/check-in', {});
  },

  checkOut: async () => {
    return await apiPost('/attendance/check-out', {});
  },

  getTodayStatus: async () => {
    return await apiGet('/attendance/today');
  },

  getMonthly: async (year, month) => {
    return await apiGet(`/attendance/monthly?year=${year}&month=${month}`);
  }
};
