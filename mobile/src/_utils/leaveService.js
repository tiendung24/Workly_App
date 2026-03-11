import { apiGet, apiPost } from './api';

export const leaveService = {
  getBalance: async () => {
    return await apiGet('/leave/balance');
  },

  getRequests: async () => {
    return await apiGet('/leave/requests');
  },

  createRequest: async (data) => {
    return await apiPost('/leave/request', data);
  },

  getLeaveTypes: async () => {
    return await apiGet('/leave/types');
  }
};
