import API from './api';

export const connectCalendar = async () => {
  const response = await API.get('/calendar/google/connect');
  return response.data;
};

export const disconnectCalendar = async () => {
  const response = await API.delete('/calendar/google/disconnect');
  return response.data;
};

export const getCalendarStatus = async () => {
  const response = await API.get('/calendar/status');
  return response.data;
};
