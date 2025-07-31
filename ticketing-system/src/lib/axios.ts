import axios from 'axios';

import { loadingRef } from '../utils/loadingRef'; // You must create this to control loader visibility
// Optional Redux support (uncomment if using Redux)
// import { store } from '../store';
// import { setGlobalLoading } from '../slices/globalLoadingSlice';

const instance = axios.create({
  baseURL: 'http://localhost:4000/api', // Change to your API base URL
  withCredentials: true, // Ensures cookies like httpOnly tokens are sent
});

// 🚀 Global request interceptor
instance.interceptors.request.use(
  (config) => {
    // Show global loader
    loadingRef?.start?.();
    // Optional Redux dispatch
    // store.dispatch(setGlobalLoading(true));
    return config;
  },
  (error) => {
    loadingRef?.stop?.();
    // store.dispatch(setGlobalLoading(false));
    return Promise.reject(error);
  }
);

// 🚀 Global response interceptor
instance.interceptors.response.use(
  (response) => {
    loadingRef?.stop?.();
    // store.dispatch(setGlobalLoading(false));
    return response;
  },
  (error) => {
    loadingRef?.stop?.();
    // store.dispatch(setGlobalLoading(false));
    return Promise.reject(error);
  }
);

export default instance;
