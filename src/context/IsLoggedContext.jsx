import { createContext, useState, useEffect } from "react";

export const IsLoggedContext = createContext(null);

export const IsLoggedInContext = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true); // opcional: útil para saber si ya cargó

    const login = () => {
        setIsLoggedIn(true);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/sessions/current', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            
            if (data.error === 'jwt must be provided') {
                setUser(null);
                setIsLoggedIn(false);
            } else {
                setUser(data.data);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error("Error al obtener el usuario:", error);
            setUser(null);
            setIsLoggedIn(false);
        } finally {
            setLoadingUser(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    return (
        <IsLoggedContext.Provider value={{
            isLoggedIn,
            login,
            logout,
            user,
            loadingUser,
            fetchCurrentUser, // ✅ por si querés forzar un refetch desde otro lado
        }}>
            {children}
        </IsLoggedContext.Provider>
    );
};
