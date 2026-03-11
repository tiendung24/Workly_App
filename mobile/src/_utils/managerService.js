import { apiGet, apiPatch } from './api';

export const managerService = {
  getRequests: async () => {
    return await apiGet('/manager/requests');
  },

  approveRequest: async (type, id, status) => {
    return await apiPatch(`/manager/approve/${type}/${id}`, { status });
  },

  getTeamMembers: async () => {
    return await apiGet('/manager/team');
  },

  getTeamSchedule: async (year, month) => {
    return await apiGet(`/manager/team/schedule?year=${year}&month=${month}`);
  },

  getTeamAttendance: async (year, month) => {
    return await apiGet(`/manager/team/attendance?year=${year}&month=${month}`);
  }
};
