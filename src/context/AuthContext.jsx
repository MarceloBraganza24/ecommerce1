import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const login = async (email, password) => {
    const response = await fetch(`${apiUrl}/api/sessions/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const token = data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
      }
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const fetchCurrentUser = async () => {
    if (!token) return;

    try {
      setLoadingUser(true);
      const response = await fetch(`${apiUrl}/api/sessions/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.data);
        setLoadingUser(false);
      } else {
        logout();
        setLoadingUser(false);
      }
    } catch (error) {
      logout();
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token,loadingUser, setToken, login, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
