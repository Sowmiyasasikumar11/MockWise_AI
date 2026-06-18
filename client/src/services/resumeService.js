import api from './api';

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const analyzeResume = async (parsedText, filename) => {
  const response = await api.post('/resume/analyze', { parsedText, filename });
  return response.data;
};

export const getResumeHistory = async () => {
  const response = await api.get('/resume/history');
  return response.data;
};
