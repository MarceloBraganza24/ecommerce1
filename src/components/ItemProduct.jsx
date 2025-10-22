import {useState,useEffect} from 'react'
import Spinner from './Spinner';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { toast } from 'react-toastify';
import { useFavorites } from '../context/FavoritesContext';

const ItemProduct = ({user,fetchContextFavorites,fetchCartByUserId,variantes,id,stock,images,title,description,price,userCart}) => {
    const { favorites, addToFavorites,isLoadingFavorites, removeFromFavorites } = useFavorites();
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const [localFavorite, setLocalFavorite] = useState(false);
    const [favoriteInitialized, setFavoriteInitialized] = useState(false);
    const [favoriteTransition, setFavoriteTransition] = useState(false);
    const SERVER_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!isLoadingFavorites) {
            const isFavorite = user && favorites?.some(fav => fav._id === id);
            setLocalFavorite(isFavorite);
            setFavoriteInitialized(true); // ✅ SIEMPRE se inicializa
        }
    }, [isLoadingFavorites, favorites, id, user]);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleLinkToItemDetail = () => {
        window.location.href = `/item/${id}`
    };

    const toggleFavorite = async () => {
        if(!user) {
            toast('Debes iniciar sesión para guardar favoritos!', {
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
            return
        }
        setLoadingFavorite(true);
        setFavoriteTransition(true);
        
        setTimeout(async () => {
            try {
                if (localFavorite) {
                    await removeFromFavorites(user._id, id);
                    setLocalFavorite(false);
                } else {
                    await addToFavorites(user._id, id);
                    setLocalFavorite(true);
                }
            } catch (err) {
                console.error("Error al actualizar favoritos", err);
            } finally {
                setLoadingFavorite(false);
                setFavoriteTransition(false); // sale del gris
            }
        }, 200);
    };

    const minVariantPrice = variantes.length > 0 
        ? Math.min(...variantes.map(v => v.price))
        : null;

    return (

        <>

            <div className="itemProduct">

                <div className="itemProduct__imgContainer">

                    {favoriteInitialized && (
                        <div 
                            onClick={toggleFavorite} 
                            className="itemProduct__imgContainer__favoriteIcon" 
                            disabled={loadingFavorite}
                        >
                            <span className="itemProduct__imgContainer__favoriteIcon__prop">
                                {favoriteTransition
                                    ? "🖤" // gris
                                    : localFavorite
                                        ? "💖" // rojo
                                        : "🤍" // vacío
                                }
                            </span>
                        </div>
                    )}

                    <Swiper
                        navigation
                        pagination={{ clickable: true }}
                        modules={[Navigation, Pagination]}
                        className="w-full h-56"
                    >
                        {(images || []).map((img, index) => (
                        <SwiperSlide key={index} style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                            <img
                            src={`${img}`}
                            alt={`Imagen ${index + 1} de ${title}`}
                            className="itemProduct__imgContainer__img"
                            />
                        </SwiperSlide>
                        ))}
                    </Swiper>

                </div>

                <div className="itemProduct__titleContainer" onClick={handleLinkToItemDetail}>
                    <div className="itemProduct__titleContainer__prop">{/* capitalizeFirstLetter(title) */title}</div>
                </div>

                <div className="itemProduct__descriptionContainer" onClick={handleLinkToItemDetail}>
                    <div className="itemProduct__descriptionContainer__prop">{/* capitalizeFirstLetter(description) */description}</div>
                </div>

                <div className="itemProduct__priceContainer" onClick={handleLinkToItemDetail}>
                    {
                        variantes.length > 0 ?
                        <div className="itemProduct__priceContainer__propLabel">
                            {/* <span className='itemProduct__priceContainer__propLabel__span'>Desde</span> */} ${minVariantPrice}  
                        </div>
                        :
                        <div className="itemProduct__priceContainer__prop">
                            ${price} 
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