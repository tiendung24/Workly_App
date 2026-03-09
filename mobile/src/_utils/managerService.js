import { apiGet, apiPatch } from './api';

export const managerService = {
  getRequests: async () => {
    return await apiGet('/manager/requests');
  },

  approveRequest: async (type, id, status) => {
    return await apiPatch(`/manager/approve/${type}/${id}`, { status });
  }
};
