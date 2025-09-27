import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

export const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const SERVER_URL = import.meta.env.VITE_API_URL;
    const [favorites, setFavorites] = useState([]);
    const { user,loadingUser } = useAuth();
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

    const fetchContextFavorites = async () => {
        setIsLoadingFavorites(true);
        try {
            const res = await fetch(`${SERVER_URL}api/favorites/user/${user._id}`);
            const data = await res.json();
            if (res.ok) {
                setFavorites(data.data?.products);
            } 
        } catch (err) {
            console.error("Error al obtener favoritos:", err);
        } finally {
            setIsLoadingFavorites(false); // ✅ marcamos como cargado
        }
    };

    const clearAllFavorites = async (userId) => {
        try {
            const res = await fetch(`${SERVER_URL}api/favorites/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                toast('Se eliminaron todos los favoritos', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchContextFavorites(); // actualiza el contexto
            } else {
                toast('Error al eliminar favoritos', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (err) {
            console.error("Error al eliminar todos los favoritos:", err);
        }
    };

    const addToFavorites = async (userId, productId) => {
        try {
            const res = await fetch(`${SERVER_URL}api/favorites/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId })
            });
            const data = await res.json();
            if (res.ok) {
                toast('Has guardado el producto como favorito', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchContextFavorites();
            } 
        } catch (err) {
            console.error("Error al agregar favorito:", err);
        }
    };

    const removeFromFavorites = async (userId, productId) => {
        try {
            const res = await fetch(`${SERVER_URL}api/favorites/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId })
            });
            if (res.ok) {
                toast('Has eliminado el producto de favoritos', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchContextFavorites();
            } 
        } catch (err) {
            console.error("Error al quitar favorito:", err);
        }
    };

    useEffect(() => {
        if (!loadingUser) {
            if (user && user._id) {
                fetchContextFavorites();
            } else {
                setFavorites([]);
                setIsLoadingFavorites(false);
            }
        }
    }, [user?._id, loadingUser]);

    return (
        <FavoritesContext.Provider value={{ favorites,isLoadingFavorites, addToFavorites, removeFromFavorites, fetchContextFavorites,clearAllFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};
