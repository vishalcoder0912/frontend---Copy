import apiClient from './apiClient';

const labService = {
  getAllLabOrders: async (params = {}) => {
    const response = await apiClient.get('/lab', { params });
    return response.data;
  },

  getLabOrder: async (id) => {
    const response = await apiClient.get(`/lab/${id}`);
    return response.data;
  },

  createLabOrder: async (data) => {
    const response = await apiClient.post('/lab', data);
    return response.data;
  },

  updateLabOrder: async (id, data) => {
    const response = await apiClient.put(`/lab/${id}`, data);
    return response.data;
  },

  deleteLabOrder: async (id) => {
    const response = await apiClient.delete(`/lab/${id}`);
    return response.data;
  },

  uploadLabReports: async (labId, files, onProgress) => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post(`/lab/${labId}/report`, formData, {
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
    const response = await apiClient.delete(`/lab/${labId}/file/${fileIndex}`);
    return response.data;
  },

  analyzeLabResult: async (labId, result) => {
    const response = await apiClient.post(`/lab/${labId}/analyze`, { result });
    return response.data;
  },

  getLabStatistics: async () => {
    const response = await apiClient.get('/lab/statistics');
    return response.data;
  },

  downloadReport: async (labId, fileIndex = 0) => {
    const response = await apiClient.get(`/lab/${labId}/download/${fileIndex}`, {
      responseType: 'blob',
      timeout: 120000,
    });
    return response;
  },
};

export default labService;
