import api from './api';

export const generateHRInterview = async (role, experience, numQuestions) => {
  const response = await api.post('/hr/generate', { role, experience, numQuestions });
  return response.data;
};

export const getHRHistory = async () => {
  const response = await api.get('/hr/history');
  return response.data;
};

export const submitHRInterview = async (id, answers) => {
  const response = await api.post(`/hr/submit/${id}`, { answers });
  return response.data;
};

export const getHRInterviewById = async (id) => {
  const response = await api.get(`/hr/${id}`);
  return response.data;
};
