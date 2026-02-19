import { createContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginApi(email, password);
    const newToken = data?.token ?? data?.accessToken;
    const userData = data?.user ?? data;
    if (newToken) {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData || {}));
      setToken(newToken);
      setUser(userData || {});
    }
    return data;
  }, []);

  const register = useCallback(async (email, password, name, role = 'volunteer', organization = '') => {
    const data = await registerApi(email, password, name, role, organization);
    const newToken = data?.token ?? data?.accessToken;
    const userData = data?.user ?? data;
    if (newToken) {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData || {}));
      setToken(newToken);
      setUser(userData || {});
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, login, register, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
