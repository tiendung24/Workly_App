import { apiGet, apiPut } from './api';

export const profileService = {
  getMe: async () => {
    return await apiGet('/profile/me');
  },

  updateMe: async (data) => {
    return await apiPut('/profile/me', data);
  }
};
