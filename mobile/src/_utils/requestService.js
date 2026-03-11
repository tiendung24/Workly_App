import { apiGet, apiPost } from './api';

export const overtimeService = {
  getRequests: async () => {
    return await apiGet('/overtime/requests');
  },

  createRequest: async (data) => {
    return await apiPost('/overtime/request', data);
  }
};

export const correctionService = {
  getRequests: async () => {
    return await apiGet('/correction/requests');
  },

  createRequest: async (data) => {
    return await apiPost('/correction/request', data);
  }
};
