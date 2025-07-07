import {useState,useEffect} from 'react'
import Spinner from './Spinner';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { toast } from 'react-toastify';
import { useFavorites } from '../context/FavoritesContext';

const ItemProduct = ({user_id,fetchContextFavorites,fetchCartByUserId,variantes,id,stock,images,title,description,price,userCart}) => {
    const [loading, setLoading] = useState(null);
    const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const [localFavorite, setLocalFavorite] = useState(false);

    useEffect(() => {
        setLocalFavorite(favorites?.some(fav => fav._id === id));
    }, [favorites, id]);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleLinkToItemDetail = () => {
        window.location.href = `/item/${id}`
    };

    //const isFavorite = favorites?.some(fav => fav._id === id);

    const toggleFavorite = async () => {
        setLoadingFavorite(true);
        try {
            if (localFavorite) {
                await removeFromFavorites(user_id, id);
                setLocalFavorite(false);
            } else {
                await addToFavorites(user_id, id);
                setLocalFavorite(true);
            }
        } catch (err) {
            console.error("Error al actualizar favoritos", err);
        } finally {
            setLoadingFavorite(false);
        }
    };

    return (

        <>

            <div className="itemProduct">

                <div className="itemProduct__imgContainer">

                    {user_id && (
                        <button onClick={toggleFavorite} className="itemProduct__imgContainer__favoriteBtn" disabled={loadingFavorite}>
                            {loadingFavorite ? (
                                <span className="itemProduct__imgContainer__favoriteSpinner">
                                    <Spinner/>
                                </span> // Podés poner un ícono mejor si querés
                            ) : (
                                <span className="itemProduct__imgContainer__favoriteIcon">
                                    {localFavorite ? "💖" : "🤍"}
                                </span>
                            )}
                        </button>
                    )}

                    <Swiper
                        navigation
                        pagination={{ clickable: true }}
                        modules={[Navigation, Pagination]}
                        className="w-full h-56"
                    >
                        {images.map((img, index) => (
                        <SwiperSlide key={index}>
                            <img
                            //src={img}
                            src={`http://localhost:8081/${img}`}
                            alt={`Imagen ${index + 1} de ${title}`}
                            className="itemProduct__imgContainer__img"
                            />
                        </SwiperSlide>
                        ))}
                    </Swiper>

                </div>

                <div className="itemProduct__titleContainer" onClick={handleLinkToItemDetail}>
                    <div className="itemProduct__titleContainer__prop">{capitalizeFirstLetter(title)}</div>
                </div>

                <div className="itemProduct__descriptionContainer" onClick={handleLinkToItemDetail}>
                    <div className="itemProduct__descriptionContainer__prop">{capitalizeFirstLetter(description)}</div>
                </div>

                <div className="itemProduct__priceContainer" onClick={handleLinkToItemDetail}>
                    {
                        variantes.length > 0 ?
                        <div className="itemProduct__priceContainer__propLabel">
                            Ver precios  
                        </div>
                        :
                        <div className="itemProduct__priceContainer__prop">
                            {price} 
                        </div>
                    }
                </div>

                <div className='itemProduct__btnContainer'>

                    <button 
                        onClick={handleLinkToItemDetail} 
                        className='itemProduct__btnContainer__btn'
                    >
                        Ver detalle
                    </button>

                </div>

            </div>

        </>
        
    )

}

export default ItemProduct