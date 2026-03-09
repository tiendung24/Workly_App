import api from './api';

export const adminService = {
  // Departments
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),

  // Positions
  getPositions: () => api.get('/admin/positions'),
  createPosition: (data) => api.post('/admin/positions', data),
  updatePosition: (id, data) => api.put(`/admin/positions/${id}`, data),
  deletePosition: (id) => api.delete(`/admin/positions/${id}`),

  // Shifts
  getShifts: () => api.get('/admin/shifts'),
  createShift: (data) => api.post('/admin/shifts', data),
  updateShift: (id, data) => api.put(`/admin/shifts/${id}`, data),
  deleteShift: (id) => api.delete(`/admin/shifts/${id}`),

  // Leave Types
  getLeaveTypes: () => api.get('/admin/leaves'),
  createLeaveType: (data) => api.post('/admin/leaves', data),
  updateLeaveType: (id, data) => api.put(`/admin/leaves/${id}`, data),
  deleteLeaveType: (id) => api.delete(`/admin/leaves/${id}`),

  // Users
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Timesheet
  getTimesheet: (year, month) => api.get(`/admin/timesheet?year=${year}&month=${month}`),
};
