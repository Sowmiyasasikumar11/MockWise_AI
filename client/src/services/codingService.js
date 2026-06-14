import api from './api';

export const generateQuestion = async (category, difficulty) => {
  const response = await api.post('/coding/generate', { category, difficulty });
  return response.data;
};

export const getAIHint = async (question, code, language, hintLevel) => {
  const response = await api.post('/coding/hint', { question, code, language, hintLevel });
  return response.data;
};

export const submitSolution = async (category, difficulty, language, question, code, isPassed) => {
  const response = await api.post('/coding/submit', { category, difficulty, language, question, code, isPassed });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/coding/history');
  return response.data;
};

export const runCode = async (question, code, language) => {
  const response = await api.post('/coding/run', { question, code, language });
  return response.data;
};
