import axios from 'axios';
import { API_BASE_URL } from '../config';
import { normalizeStatusFields, encodeStatusFields } from '../utils/userUtils';

// Single axios instance used across services. Base URL comes from src/config.js
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Determine the status type based on the URL
const getStatusTypeFromUrl = (url) => {
  if (!url) return 'repair';
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('repairticket') || lowerUrl.includes('ticket') || lowerUrl.includes('repair')) {
    return 'repair';
  }
  if (lowerUrl.includes('supplier') || lowerUrl.includes('parts') || lowerUrl.includes('order')) {
    return 'supplier';
  }
  if (lowerUrl.includes('bill') || lowerUrl.includes('payment') || lowerUrl.includes('invoice')) {
    return 'bill';
  }
  
  return 'repair'; // default
};

// Request interceptor to encode status fields before sending to server
api.interceptors.request.use(
  (config) => {
    const statusType = getStatusTypeFromUrl(config.url);
    
    // Encode status fields in request data
    // Only encode when `config.data` is a plain JS object (not URLSearchParams/FormData/string)
    const isUrlSearchParams = (typeof URLSearchParams !== 'undefined' && config.data instanceof URLSearchParams);
    const isFormData = (typeof FormData !== 'undefined' && config.data instanceof FormData);
    const isString = typeof config.data === 'string';
    if (config.data && typeof config.data === 'object' && !isUrlSearchParams && !isFormData && !ArrayBuffer.isView(config.data)) {
      config.data = encodeStatusFields(config.data, statusType);
    }
    
    // Encode status fields in URL params
    if (config.params && typeof config.params === 'object') {
      config.params = encodeStatusFields(config.params, statusType);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to decode status fields when receiving from server
api.interceptors.response.use(
  (response) => {
    const statusType = getStatusTypeFromUrl(response.config.url);
    
    // Decode the response data
    if (response.data) {
      response.data = normalizeStatusFields(response.data, statusType);
    }
    return response;
  },
  (error) => {
    // Also decode error responses if they have data
    if (error.response && error.response.data) {
      const statusType = getStatusTypeFromUrl(error.response.config?.url);
      error.response.data = normalizeStatusFields(error.response.data, statusType);
    }
    return Promise.reject(error);
  }
);

export default api;
