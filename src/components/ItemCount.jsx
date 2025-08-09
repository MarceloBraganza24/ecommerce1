import {useEffect, useState} from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Spinner from './Spinner';

const ItemCount = ({loadingVariant,selectedVariant,variantes,user_id,roleUser,id,images,title,description,price,stock,fetchCartByUserId,userCart}) => {
    //console.log(stock)

    const normalizeCampos = (campos) => {
        if (!campos) return {};
        return Object.fromEntries(
            Object.entries(campos).map(([k, v]) => [k.toLowerCase(), v])
        );
    };

    const selectedCamposNorm = normalizeCampos(selectedVariant?.campos);

    const productoEnCarrito = userCart?.products?.find(p => {
        const carritoCamposNorm = normalizeCampos(p.selectedVariant?.campos);
        return p.product._id === id &&
            JSON.stringify(carritoCamposNorm) === JSON.stringify(selectedCamposNorm);
    });
    
    const varianteSeleccionada = variantes?.find(item => {
        if (!selectedVariant?.campos) return false;

        const campos1 = normalizeCampos(item.campos);
        const campos2 = normalizeCampos(selectedVariant.campos);

        return Object.entries(campos2).every(([key, value]) => campos1[key] === value);
    });

    //const stockVariante = varianteSeleccionada?.stock || stock;
    const stockVariante = variantes?.length > 0
        ? (varianteSeleccionada?.stock ?? 0)
        : stock;

    // Buscar en el carrito si ya hay esta combinación
    const cantidadEnCarrito = productoEnCarrito?.quantity || 0;

    // Cantidad disponible según variante
    const cantidadDisponible = stockVariante - cantidadEnCarrito;

    const navigate = useNavigate();
    const [loading, setLoading] = useState(null);
    const [count, setCount] = useState(1);
    const [ultimoToast, setUltimoToast] = useState(0);
    const tiempoEspera = 2000;

    useEffect(() => {
        setCount(1);
    },[selectedVariant])

    const stockDisponible = variantes?.length > 0
    ? stockVariante // usar siempre la variante si existen
    : stock ?? 0;

    const increment = () => {
        console.log('Increment clicked, count:', count, 'stockDisponible:', stockDisponible);
        setCount(prevCount => {
            console.log('PrevCount:', prevCount);
            if (prevCount < stockDisponible) {
                console.log('Incrementing count');
                return prevCount + 1;
            } else {
                console.log('No stock disponible, showing toast');
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
                    setUltimoToast(ahora);
                }
                return prevCount;
            }
        });
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
        if(stockVariante == 0) {
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
        if (count > stockVariante) {
            toast(`La cantidad debe ser menor o igual al stock!`, {
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
            toast(`No quedan más unidades disponibles para agregar! Tu carrito ya posee las unidades disponibles`, {
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
            title,
            ...(selectedVariant && Object.keys(selectedVariant).length > 0 ? { selectedVariant } : {})
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
        if(stockVariante == 0) {
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
        if (count > stockVariante) {
            toast(`La cantidad debe ser menor o igual al stock!`, {
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
            toast(`No quedan más unidades disponibles para agregar! Tu carrito ya posee las unidades disponibles`, {
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

            {/* { stockVariante > 0 ?
                <div className='itemDetailContainer__itemDetail__infoContainer__info__count__prop'>{count}</div>
                :
                <div className='itemDetailContainer__itemDetail__infoContainer__info__count__prop'>0</div>
            } */}
            <div className='itemDetailContainer__itemDetail__infoContainer__info__count__prop'>
                { stockDisponible > 0 ? count : 0 }
            </div>

            <button className='itemDetailContainer__itemDetail__infoContainer__info__count__plusMinus' onClick={increment}>+</button>

            {/* <div className='itemDetailContainer__itemDetail__infoContainer__info__count__availability'>({stockVariante} Disponibles)</div> */}
            {/* <div className='itemDetailContainer__itemDetail__infoContainer__info__count__availability'>
                ({(variantes?.length > 0 
                    ? (stockVariante >= 10 ? '+10' : stockVariante) 
                    : (stock >= 10 ? '+10' : stock)
                    )} Disponibles)
            </div> */}
            <div className='itemDetailContainer__itemDetail__infoContainer__info__count__availability'>
                {
                    loadingVariant ?
                    <Spinner/>
                    :
                    stockVariante >= 10 ?
                    '(+10 Disponibles)'
                    :
                    `(${stockVariante} Disponibles)`
                }
            </div>
            {/* <div className='itemDetailContainer__itemDetail__infoContainer__info__count__availability'>({stockDisponible < 10 ? stockDisponible : '+10'} Disponibles)</div> */}


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