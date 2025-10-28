import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with cookie support
const fileApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

export const uploadGymFiles = async (gymId, files, category, gymName) => {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file.originFileObj || file);
  });
  formData.append('category', category);
  if (gymName) formData.append('gymName', gymName);

  const response = await fileApi.post(
    `/files/gym/${gymId}/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  return response.data;
};

export const deleteGymFile = async (gymId, fileUrl, category) => {
  const response = await fileApi.delete(
    `/files/gym/${gymId}/delete`,
    {
      data: { fileUrl, category }
    }
  );
  
  return response.data;
};