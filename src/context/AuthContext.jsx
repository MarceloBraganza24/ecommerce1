import { createContext, useContext, useEffect, useState } from 'react';
import { fetchWithAuth } from '../components/FetchWithAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingFetchLogOut, setLoadingFetchLogOut] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const login = async (email, password) => {
    const response = await fetch(`${apiUrl}api/sessions/login`, {
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

  const logout = async () => {
    try {
      setLoadingFetchLogOut(true);
      const response = await fetchWithAuth('api/sessions/logout', {
          method: 'POST',
      });
      
      if (response) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        return true;
      } else {
        return false;
      }
    } catch (error) {
        toast('Ha ocurrido un error al intentar salir! Intente nuevamente', {
            position: "top-right",
            autoClose: 1500,
            theme: "dark",
            className: "custom-toast",
        });
    } finally {
      setLoadingFetchLogOut(false);
    }
  };

  /* const fetchCurrentUser = async () => {
    if (!token) return;

    try {
      setLoadingUser(true);
      const response = await fetch(`${apiUrl}api/sessions/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.data);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setLoadingUser(false);
    }
  }; */
  const fetchCurrentUser = async () => {
    if (!token) {
      setUser(null);       // 🔹 limpiar usuario
      setLoadingUser(false); // 🔹 marcar fin de carga
      return;
    }

    try {
      setLoadingUser(true);
      const response = await fetch(`${apiUrl}api/sessions/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.data);
      } else {
        setUser(null);
        logout();
      }
    } catch (error) {
      setUser(null);
      logout();
    } finally {
      setLoadingUser(false);
    }
  };


  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loadingUser, loadingFetchLogOut, setToken, login, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
