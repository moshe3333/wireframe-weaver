
export const setAuthData = (data: { token: string; uid: string; role: string; fullName: string }) => {
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('auth_uid', data.uid);
  localStorage.setItem('auth_role', data.role);
  localStorage.setItem('auth_name', data.fullName);
};

export const getAuthData = () => {
  return {
    token: localStorage.getItem('auth_token'),
    uid: localStorage.getItem('auth_uid'),
    role: localStorage.getItem('auth_role'),
    fullName: localStorage.getItem('auth_name'),
  };
};

export const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_uid');
  localStorage.removeItem('auth_role');
  localStorage.removeItem('auth_name');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

const API_BASE = 'http://localhost:5000/api';

export default API_BASE;
