import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


// const HOST = Platform.select({
//   android: '10.0.2.2',    
//   ios: '192.168.1.2',     
//   default: '192.168.1.2'
// });

// Thay dòng dưới bằng đúng đường dẫn Render mà bạn vừa deploy thành công nhé
// export const API_BASE = `https://workly-app.onrender.com/api`;
export const API_BASE = `http://localhost:3000/api`

// Helper to get auth token
const getAuthHeaders = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return headers;
};

// Generic GET request
export async function apiGet(path) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Generic POST request
export async function apiPost(path, body) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Generic PUT request
export async function apiPut(path, body) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Generic PATCH request
export async function apiPatch(path, body) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Generic DELETE request
export async function apiDelete(path) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete
};

export default api;