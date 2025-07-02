import {useState} from 'react'
import Spinner from './Spinner';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { toast } from 'react-toastify';

const ItemProduct = ({user_id,fetchCartByUserId,id,stock,images,title,description,price,userCart}) => {
    const [loading, setLoading] = useState(null);
    // const productoEnCarrito = userCart?.products?.find(p => p.product._id === id);
    // const cantidadEnCarrito = productoEnCarrito?.quantity || 0;
    // const cantidadDisponible = stock - cantidadEnCarrito;

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleLinkToItemDetail = () => {
        window.location.href = `/item/${id}`
    };

    return (

        <>

            <div className="itemProduct">

                <div className="itemProduct__imgContainer">

                    <button
                        className="itemProduct__favoriteBtn"
                        onClick={(e) => {
                            e.stopPropagation(); // Evita que dispare handleLinkToItemDetail
                            handleToggleFavorite(productId); // Lógica que definas para favoritos
                        }}
                    >
                        ❤️
                    </button>

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
                    <div className="itemProduct__priceContainer__prop">$ {price}</div>
                </div>

                <div className='itemProduct__btnContainer'>

                    <button 
                        onClick={handleLinkToItemDetail} 
                        //disabled={loading === 'addToCartAndSave'} 
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