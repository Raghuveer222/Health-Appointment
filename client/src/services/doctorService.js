import API from './api';

export const getDoctors = async (params = {}) => {
  const response = await API.get('/doctors', { params });
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await API.get(`/doctors/${id}`);
  return response.data;
};

export const getDoctorAvailability = async (id, dateStr) => {
  const response = await API.get(`/doctors/${id}/availability`, {
    params: { date: dateStr },
  });
  return response.data;
};

export const updateDoctorProfile = async (data) => {
  const response = await API.put('/doctors/profile', data);
  return response.data;
};
