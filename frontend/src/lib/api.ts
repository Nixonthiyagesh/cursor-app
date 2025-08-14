import axios from 'axios'

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Only handle critical auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on critical auth errors (like expired tokens)
    // Let individual components handle 401 errors for better UX
    if (error.response?.status === 401 && error.response?.data?.message === 'Invalid token.') {
      // Token is invalid/expired, clear and redirect
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)