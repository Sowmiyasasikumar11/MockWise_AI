import api from './api';

export const generateHRInterview = async (role, experience, numQuestions) => {
  const response = await api.post('/hr/generate', { role, experience, numQuestions });
  return response.data;
};

export const getHRHistory = async () => {
  const response = await api.get('/hr/history');
  return response.data;
};
