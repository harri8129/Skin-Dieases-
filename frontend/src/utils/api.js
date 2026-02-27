const API_BASE_URL = 'http://localhost:8000/api';

// Helper to get access token
export const getAccessToken = () => localStorage.getItem('access_token');

// Helper to get refresh token
export const getRefreshToken = () => localStorage.getItem('refresh_token');

// Helper to set tokens
export const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

// Helper to clear tokens (logout)
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Check if token is expired (basic check)
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (e) {
    return true;
  }
};

// Refresh token function
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/userdetails/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    setTokens(data.access, data.refresh);
    return data.access;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

// Main API request function with automatic token refresh
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get current access token
  let accessToken = getAccessToken();
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Prepare request options
  const requestOptions = {
    ...options,
    headers,
  };

  // Handle FormData (don't set Content-Type, let browser set it with boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    let response = await fetch(url, requestOptions);

    // If token is expired, try to refresh
    if (response.status === 401 && getRefreshToken()) {
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          onTokenRefreshed(newToken);
          
          // Retry the original request with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, { ...requestOptions, headers });
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          throw refreshError;
        }
      } else {
        // Wait for token refresh and retry
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            headers['Authorization'] = `Bearer ${newToken}`;
            resolve(fetch(url, { ...requestOptions, headers }));
          });
        });
      }
    }

    return response;
  } catch (error) {
    console.error('API Request error:', error);
    throw error;
  }
};

// Convenience methods
export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  
  put: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
  
  patch: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(body) 
    }),
  
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

// Logout function
export const logout = async () => {
  const refreshToken = getRefreshToken();
  
  if (refreshToken) {
    try {
      await api.post('/userdetails/logout/', { refresh: refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  clearTokens();
};

export default api;
