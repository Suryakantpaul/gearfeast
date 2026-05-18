import axiosInstance from './axiosInstance';

export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axiosInstance.post('/auth/login', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data;
};