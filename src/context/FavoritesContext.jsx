import { createContext, useContext, useState, useEffect } from 'react';
import { IsLoggedContext } from './IsLoggedContext'; // ⚠️ ajustá la ruta según tu estructura

export const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const { user } = useContext(IsLoggedContext);

    const fetchFavorites = async () => {
        try {
            const res = await fetch(`http://localhost:8081/api/favorites/${user._id}`);
            const data = await res.json();
            if (res.ok) setFavorites(data.payload);
        } catch (err) {
            console.error("Error al obtener favoritos:", err);
        }
    };

    const addToFavorites = async (userId, productId) => {
        try {
            const res = await fetch(`http://localhost:8081/api/favorites/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId })
            });
            const data = await res.json();
            if (res.ok) fetchFavorites();
        } catch (err) {
            console.error("Error al agregar favorito:", err);
        }
    };

    const removeFromFavorites = async (userId, productId) => {
        try {
            const res = await fetch(`http://localhost:8081/api/favorites/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId })
            });
            if (res.ok) fetchFavorites();
        } catch (err) {
            console.error("Error al quitar favorito:", err);
        }
    };

    useEffect(() => {
        if (user?._id) {
            fetchFavorites();
        }
    }, [user]);

    return (
        <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};
