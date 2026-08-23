import API from './api';

export const getAdminStats = async () => {
  const response = await API.get('/admin/dashboard');
  return response.data;
};

export const createDoctorAccount = async (data) => {
  const response = await API.post('/admin/doctors', data);
  return response.data;
};

export const updateDoctorAccount = async (id, data) => {
  const response = await API.put(`/admin/doctors/${id}`, data);
  return response.data;
};

export const toggleDoctorStatus = async (id, isActive) => {
  const response = await API.patch(`/admin/doctors/${id}/status`, { isActive });
  return response.data;
};

export const setDoctorLeave = async (id, leaveDate) => {
  const response = await API.post(`/admin/doctors/${id}/leave`, { leaveDate });
  return response.data;
};

export const removeDoctorLeave = async (id, leaveDate) => {
  const response = await API.delete(`/admin/doctors/${id}/leave`, { data: { leaveDate } });
  return response.data;
};

export const getUsers = async (role = '') => {
  const response = await API.get('/admin/users', { params: { role } });
  return response.data;
};

export const getAllAppointments = async () => {
  const response = await API.get('/admin/appointments');
  return response.data;
};
