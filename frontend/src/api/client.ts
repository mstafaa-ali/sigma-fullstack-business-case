import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || 'An error occurred';

    // Show toast for server errors
    if (error.response?.status >= 500) {
      toast.error(`Server Error: ${message}`);
    } else if (error.response?.status === 400) {
      toast.error(`Validation Error: ${message}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
