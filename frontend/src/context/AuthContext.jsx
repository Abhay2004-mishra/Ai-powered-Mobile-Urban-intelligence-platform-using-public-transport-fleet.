import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('urbaneye_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/api/auth/me')
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('urbaneye_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async ({ email, password, full_name, role, department }) => {
    const res = await api.post('/api/auth/register', { email, password, full_name, role, department });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('urbaneye_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('urbaneye_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'municipal_officer';
  const isFieldWorker = user?.role === 'field_worker';
  const isBusOperator = user?.role === 'bus_operator';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      loading,
      isAdmin,
      isOfficer,
      isFieldWorker,
      isBusOperator
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
