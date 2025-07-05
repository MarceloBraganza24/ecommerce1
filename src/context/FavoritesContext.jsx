import { createContext, useContext, useState, useEffect } from 'react';
import { IsLoggedContext } from './IsLoggedContext'; // ⚠️ ajustá la ruta según tu estructura
import { toast } from 'react-toastify';

export const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const { user } = useContext(IsLoggedContext);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

    const fetchContextFavorites = async () => {
        setIsLoadingFavorites(true);
        try {
            const res = await fetch(`http://localhost:8081/api/favorites/user/${user._id}`);
            const data = await res.json();
            if (res.ok) {
                setFavorites(data.data.products);
            } 
        } catch (err) {
            console.error("Error al obtener favoritos:", err);
        } finally {
            setIsLoadingFavorites(false);
        }
    };

    const clearAllFavorites = async (userId) => {
        try {
            const res = await fetch(`http://localhost:8081/api/favorites/clear`, {
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
            const res = await fetch(`http://localhost:8081/api/favorites/add`, {
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
            const res = await fetch(`http://localhost:8081/api/favorites/remove`, {
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
        if (user?._id) {
            fetchContextFavorites();
        } else {
            setIsLoadingFavorites(false); // importante para salir del loading si no hay user
        }
    }, [user]);

    return (
        <FavoritesContext.Provider value={{ favorites,isLoadingFavorites, addToFavorites, removeFromFavorites, fetchContextFavorites,clearAllFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};
