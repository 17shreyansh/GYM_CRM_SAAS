import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const uploadGymFiles = async (gymId, files, category, token, gymName) => {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file.originFileObj || file);
  });
  formData.append('category', category);
  if (gymName) formData.append('gymName', gymName);

  const response = await axios.post(
    `${API_BASE}/files/gym/${gymId}/upload`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  return response.data;
};

export const deleteGymFile = async (gymId, fileUrl, category, token) => {
  const response = await axios.delete(
    `${API_BASE}/files/gym/${gymId}/delete`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
      data: { fileUrl, category }
    }
  );
  
  return response.data;
};