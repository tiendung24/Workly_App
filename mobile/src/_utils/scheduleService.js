import { apiGet } from './api';

export const scheduleService = {
  getMonthly: async (year, month) => {
    return await apiGet(`/schedule/monthly?year=${year}&month=${month}`);
  }
};
