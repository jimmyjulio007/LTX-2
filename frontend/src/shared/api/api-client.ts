import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true, // Needed for Better Auth session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization header if needed (redundant if using cookies, but good to have)
apiClient.interceptors.request.use((config) => {
  // Better Auth stores session in cookies, so axios withCredentials handles it.
  // If we ever need to manually add a token from local storage:
  // const token = localStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
