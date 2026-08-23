import API from './api';

export const bookAppointment = async (data) => {
  const response = await API.post('/appointments', data);
  return response.data;
};

export const getAppointments = async (params = {}) => {
  const response = await API.get('/appointments', { params });
  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await API.get(`/appointments/${id}`);
  return response.data;
};

export const rescheduleAppointment = async (id, data) => {
  const response = await API.patch(`/appointments/${id}/reschedule`, data);
  return response.data;
};

export const cancelAppointment = async (id, data = {}) => {
  const response = await API.patch(`/appointments/${id}/cancel`, data);
  return response.data;
};

export const completeConsultation = async (id, data) => {
  const response = await API.post(`/appointments/${id}/consultation`, data);
  return response.data;
};

export const getPostVisitSummary = async (id) => {
  const response = await API.get(`/appointments/${id}/summary`);
  return response.data;
};
