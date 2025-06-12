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
    const productoEnCarrito = userCart?.products?.find(p => p.product._id === id);
    const cantidadEnCarrito = productoEnCarrito?.quantity || 0;
    const cantidadDisponible = stock - cantidadEnCarrito;

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const addToCartAndSave = async () => {
        if (!user_id) {
            toast("Debes iniciar sesión para agregar productos al carrito", {
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
            return false;
        }
        if(stock == 0) {
            toast("No hay stock disponible en este producto!", {
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
            return;
        }
        if (1 > cantidadDisponible) {
            toast(`No quedan más unidades disponibles para agregar!`, {
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
            return;
        }
    
        const newItem = {
            product: id,
            quantity: 1,
            title
        };
    
        try {
            const response = await fetch("http://localhost:8081/api/carts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, products: [newItem] }),
            });
    
            const data = await response.json();
            if (response.ok) {
                toast("Has agregado el producto al carrito!", {
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
                fetchCartByUserId(user_id);
                return true;
            } else {
                throw new Error(data.message || "Error desconocido");
            }
        } catch (error) {
            toast("Error al guardar el producto en el carrito!", {
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
            return false;
        }
    };

    const handleAddToCart = async () => {
        setLoading("addToCartAndSave");
        const success = await addToCartAndSave();
        setLoading(null);
    };

    const handleLinkToItemDetail = () => {
        window.location.href = `/item/${id}`
    };

    return (

        <>

            <div className="itemProduct">

                <div className="itemProduct__imgContainer">

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
                        onClick={handleAddToCart} 
                        disabled={loading === 'addToCartAndSave'} 
                        className='itemProduct__btnContainer__btn'
                    >
                        {loading === 'addToCartAndSave' ? <Spinner/> : "Agregar al Carrito"}
                    </button>

                </div>

            </div>

        </>
        
    )

}

export default ItemProduct