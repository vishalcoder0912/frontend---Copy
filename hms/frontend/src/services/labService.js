import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

const labService = {
  getAllLabOrders: async (params = {}) => {
    const response = await api.get('/lab', { params });
    return response.data;
  },

  getLabOrder: async (id) => {
    const response = await api.get(`/lab/${id}`);
    return response.data;
  },

  createLabOrder: async (data) => {
    const response = await api.post('/lab', data);
    return response.data;
  },

  updateLabOrder: async (id, data) => {
    const response = await api.put(`/lab/${id}`, data);
    return response.data;
  },

  deleteLabOrder: async (id) => {
    const response = await api.delete(`/lab/${id}`);
    return response.data;
  },

  uploadLabReports: async (labId, files, onProgress) => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post(`/lab/${labId}/report`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  deleteLabFile: async (labId, fileIndex) => {
    const response = await api.delete(`/lab/${labId}/file/${fileIndex}`);
    return response.data;
  },

  analyzeLabResult: async (labId, result) => {
    const response = await api.post(`/lab/${labId}/analyze`, { result });
    return response.data;
  },

  getLabStatistics: async () => {
    const response = await api.get('/lab/statistics');
    return response.data;
  },

  downloadReport: async (labId, fileIndex = 0) => {
    const response = await api.get(`/lab/${labId}/download/${fileIndex}`, {
      responseType: 'blob',
      timeout: 120000,
    });
    return response;
  },
};

export default labService;
