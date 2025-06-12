import {useState} from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Spinner from './Spinner';

const ItemCount = ({user_id,roleUser,id,images,title,description,price,stock,fetchCartByUserId,userCart}) => {
    const productoEnCarrito = userCart?.products?.find(p => p.product._id === id);
    const cantidadEnCarrito = productoEnCarrito?.quantity || 0;
    const cantidadDisponible = stock - cantidadEnCarrito;

    const navigate = useNavigate();
    const [loading, setLoading] = useState(null);
    const [count, setCount] = useState(1);
    const [ultimoToast, setUltimoToast] = useState(0);
    const tiempoEspera = 2000;

    const increment = () => {
        if (count < stock) {
            setCount(count + 1);
        } else {
            const ahora = Date.now();
            if (ahora - ultimoToast >= tiempoEspera) {
                toast('No hay mas disponibilidad de la ingresada!', {
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
                setUltimoToast(ahora); // Actualiza el tiempo del último toast
            }
        }
    };

    const decrement = () => {
        setCount((prevCount) => Math.max(prevCount - 1, 1));
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
        if (count > cantidadDisponible) {
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
            quantity: count,
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

    const addToCartAndContinue = async () => {
        if (!user_id) {
            toast("Debes iniciar sesión para realizar una compra", {
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
        if (count > cantidadDisponible) {
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
    
        setLoading("addToCartAndContinue");
    
        const success = await addToCartAndSave();

        if(roleUser == 'admin') {
            setTimeout(() => {
                navigate("/cart");
            }, 2000);
            return;
        }
        if (success) {
            setTimeout(() => {
                navigate("/shipping");
            }, 2000);
        } else {
            setLoading(null); // solo en caso de fallo
        }
    };
    
    
  return (

    <>
        <div className='itemDetailContainer__itemDetail__infoContainer__info__count'>

            <h2 className='itemDetailContainer__itemDetail__infoContainer__info__count__quantityLabel'>Cantidad:</h2>

            { count != 1 ?
                <button className='itemDetailContainer__itemDetail__infoContainer__info__count__plusMinus' onClick={decrement}>-</button> : <button disabled className='itemDetailContainer__itemDetail__infoContainer__info__count__plusMinus' onClick={decrement}>-</button>
            }

            { stock > 0 ?
                <div className='itemDetailContainer__itemDetail__infoContainer__info__count__prop'>{count}</div>
                :
                <div className='itemDetailContainer__itemDetail__infoContainer__info__count__prop'>0</div>
            }

            <button className='itemDetailContainer__itemDetail__infoContainer__info__count__plusMinus' onClick={increment}>+</button>

            <div className='itemDetailContainer__itemDetail__infoContainer__info__count__availability'>({stock} Disponibles)</div>

        </div> 

        <div className='itemDetailContainer__itemDetail__infoContainer__info__btnAddToCart'>
            <button 
                onClick={addToCartAndContinue} 
                disabled={loading === 'addToCartAndContinue'} 
                className='itemDetailContainer__itemDetail__infoContainer__info__btnAddToCart__prop'
            >
                {loading === 'addToCartAndContinue' ? <Spinner/> : "Comprar ahora"}
            </button>

            <button 
                onClick={handleAddToCart} 
                disabled={loading === 'addToCartAndSave'} 
                className='itemDetailContainer__itemDetail__infoContainer__info__btnAddToCart__propCart'
            >
                {loading === 'addToCartAndSave' ? <Spinner/> : "Agregar al Carrito"}
            </button>

        </div>


    </>

  )

}

export default ItemCount