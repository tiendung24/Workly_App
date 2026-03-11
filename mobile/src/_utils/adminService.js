import { apiGet, apiPost, apiPut, apiDelete } from './api';

export const adminService = {
  // Departments
  getDepartments: () => apiGet('/admin/departments'),
  createDepartment: (data) => apiPost('/admin/departments', data),
  updateDepartment: (id, data) => apiPut(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => apiDelete(`/admin/departments/${id}`),

  // Positions
  getPositions: () => apiGet('/admin/positions'),
  createPosition: (data) => apiPost('/admin/positions', data),
  updatePosition: (id, data) => apiPut(`/admin/positions/${id}`, data),
  deletePosition: (id) => apiDelete(`/admin/positions/${id}`),

  // Shifts
  getShifts: () => apiGet('/admin/shifts'),
  createShift: (data) => apiPost('/admin/shifts', data),
  updateShift: (id, data) => apiPut(`/admin/shifts/${id}`, data),
  deleteShift: (id) => apiDelete(`/admin/shifts/${id}`),

  // Leave Types
  getLeaveTypes: () => apiGet('/admin/leaves'),
  createLeaveType: (data) => apiPost('/admin/leaves', data),
  updateLeaveType: (id, data) => apiPut(`/admin/leaves/${id}`, data),
  deleteLeaveType: (id) => apiDelete(`/admin/leaves/${id}`),

  // Users
  getUsers: () => apiGet('/admin/users'),
  createUser: (data) => apiPost('/admin/users', data),
  updateUser: (id, data) => apiPut(`/admin/users/${id}`, data),
  deleteUser: (id) => apiDelete(`/admin/users/${id}`),
  
  // Timesheet
  getTimesheet: (year, month) => apiGet(`/admin/timesheet?year=${year}&month=${month}`),
};
