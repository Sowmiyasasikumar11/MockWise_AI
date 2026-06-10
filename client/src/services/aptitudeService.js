import api from './api';

export const getAptitudeCategories = async () => {
  const response = await api.get('/aptitude/categories');
  return response.data;
};

export const generateAptitudeQuestions = async (category, difficulty) => {
  const response = await api.post('/aptitude/generate', { category, difficulty });
  return response.data;
};

export const submitAptitudeTest = async (answers, category, difficulty) => {
  const response = await api.post('/aptitude/submit', { answers, category, difficulty });
  return response.data;
};

export const getAptitudeHistory = async () => {
  const response = await api.get('/aptitude/history');
  return response.data;
};
