import { createContext, useState } from "react"
import { toast } from "react-toastify"

export const FavoritesProvider = createContext(null)

export const FavoritesContext = ({children}) => {
    const [favorites, setFavorites] = useState([]);

    // Opcional: cargar favoritos desde la base de datos al iniciar sesión
    const fetchFavorites = async (userId) => {
        const res = await fetch(`http://localhost:8081/api/favorites/${userId}`);
        const data = await res.json();
        setFavorites(data.favorites || []);
    };

    const addToFavorites = async (userId, productId) => {
        const res = await fetch(`http://localhost:8081/api/favorites/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId })
        });
        const data = await res.json();
        if (res.ok) setFavorites(data.favorites);
    };

    const removeFromFavorites = async (userId, productId) => {
        const res = await fetch(`http://localhost:8081/api/favorites/${userId}/${productId}`, {
            method: "DELETE"
        });
        const data = await res.json();
        if (res.ok) setFavorites(data.favorites);
    };
    
    return (

        <FavoritesProvider.Provider 
            value={{ favorites, fetchFavorites, addToFavorites, removeFromFavorites }}
        >
            {children}
        </FavoritesProvider.Provider>

    )

}