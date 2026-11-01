import axios from 'axios';

const TOKEN_KEY = 'roomBooking.token';

// JWT storage. Login in Lab 2 calls tokenStorage.set() with the token from POST /auth/login.
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Every failed request rejects with { status, message, data } so pages handle one shape.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;
    if (status === 401) {
      tokenStorage.clear();
    }
    return Promise.reject({
      status,
      message: error.response?.data?.message ?? error.message,
      data: error.response?.data,
    });
  },
);
