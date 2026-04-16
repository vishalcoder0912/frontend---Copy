import apiClient from './apiClient';

const BASE_URL = '/api/v1/hospital';

export const admissionsService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/admissions`, { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/admissions/${id}`);
    return response.data;
  },

  create: async (admissionData) => {
    const response = await apiClient.post(`${BASE_URL}/admissions`, admissionData);
    return response.data;
  },

  update: async (id, updateData) => {
    const response = await apiClient.put(`${BASE_URL}/admissions/${id}`, updateData);
    return response.data;
  },

  discharge: async (id, dischargeData = {}) => {
    const response = await apiClient.put(`${BASE_URL}/admissions/${id}`, {
      ...dischargeData,
      status: 'Discharged',
    });
    return response.data;
  },

  transfer: async (id, transferData) => {
    const response = await apiClient.put(`${BASE_URL}/admissions/${id}`, {
      ...transferData,
      status: 'Transfer',
    });
    return response.data;
  },

  getByPatient: async (patientId) => {
    const response = await apiClient.get(`${BASE_URL}/admissions`, {
      params: { patient_id: patientId },
    });
    return response.data;
  },

  getActive: async () => {
    const response = await apiClient.get(`${BASE_URL}/admissions`, {
      params: { status: 'Admitted' },
    });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get(`${BASE_URL}/admissions`);
    const data = response.data?.data?.items || [];
    return {
      total: data.length,
      admitted: data.filter(a => a.status === 'Admitted').length,
      discharged: data.filter(a => a.status === 'Discharged').length,
      transferred: data.filter(a => a.status === 'Transfer').length,
    };
  },
};

export const bedsService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get(`${BASE_URL}/beds`, { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/beds/${id}`);
    return response.data;
  },

  create: async (bedData) => {
    const response = await apiClient.post(`${BASE_URL}/beds`, bedData);
    return response.data;
  },

  update: async (id, updateData) => {
    const response = await apiClient.put(`${BASE_URL}/beds/${id}`, updateData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/beds/${id}`);
    return response.data;
  },

  getAvailable: async () => {
    const response = await apiClient.get(`${BASE_URL}/beds`, {
      params: { status: 'Available' },
    });
    return response.data;
  },

  getByWardType: async (wardType) => {
    const response = await apiClient.get(`${BASE_URL}/beds`, {
      params: { ward_type: wardType },
    });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.put(`${BASE_URL}/beds/${id}`, { status });
    return response.data;
  },
};

export const WARD_TYPES = ['ICU', 'General', 'Private', 'Ward A', 'Ward B', 'Ward C'];

export const BED_STATUS = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  MAINTENANCE: 'Maintenance',
  RESERVED: 'Reserved',
};

export const ADMISSION_STATUS = {
  ADMITTED: 'Admitted',
  DISCHARGED: 'Discharged',
  TRANSFER: 'Transfer',
};
