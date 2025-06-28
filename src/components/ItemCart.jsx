import {useContext,useState} from 'react'
import {CartContext} from '../context/ShoppingCartContext'
import { Link } from 'react-router-dom';
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const ItemCart = ({user_id,id,title,description,quantity,img,price,selectedVariant,fetchCartByUserId}) => {
    //console.log(selectedVariant)

    const {deleteItemCart,updateQuantity} = useContext(CartContext);
    const [loadingQuantity, setLoadingQuantity] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleUpdateQuantity = async (newQuantity) => {
        setLoadingQuantity(true);
        //await updateQuantity(user_id, id, newQuantity, fetchCartByUserId);
        await updateQuantity(user_id, id, newQuantity, selectedVariant, fetchCartByUserId);
        setLoadingQuantity(false);
    };

    const handleIncrement = () => {
        const variantStock = selectedVariant?.stock ?? 0;
        if (quantity < variantStock) {
            handleUpdateQuantity(quantity + 1);
        } else {
            toast('No quedan más unidades disponibles para agregar!', {
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
    };

    const handleDelete = async () => {
        setLoadingDelete(true);
        await deleteItemCart(user_id, id,selectedVariant, fetchCartByUserId);
        setLoadingDelete(false);
    };

    return (

        <>

            <div className='itemCart'>

                <div className='itemCart__imgContainer'>
                    <img className='itemCart__imgContainer__img' src={`http://localhost:8081/${img}`} alt="img" />
                </div>

                <div className='itemCart__title'>
                    <Link className='itemCart__title__prop' to={`/item/${id}`}>
                        {title} 
                    </Link>
                </div>

                <div className='itemCart__description'>
                    <div className='itemCart__description__prop'>{description}</div>
                </div>

                {
                    selectedVariant ?
                    <div className='itemCart__variantesContainer'>
                        <div className='itemCart__variantesContainer__variantes'>
                            {Object.entries(selectedVariant.campos).map(([key, value]) => (
                                <div key={key} className='itemCart__variantesContainer__variantes__prop'>
                                    {key}: {value}
                                </div>
                            ))}
                        </div>
                    </div>
                    :
                    <div className='itemCart__variantesContainer'>
                        Sin variantes
                    </div>
                }

                <div className='itemCart__quantity'>

                    <button
                        className="itemDetailContainer__itemDetail__infoContainer__info__count__plusMinus"
                        onClick={() => quantity > 1 && handleUpdateQuantity(quantity - 1)}
                        disabled={loadingQuantity} 
                    >
                        -
                    </button>

                    <div className="itemCart__quantity">
                        {loadingQuantity ? <Spinner/> : quantity} 
                    </div>

                    <button
                        className="itemDetailContainer__itemDetail__infoContainer__info__count__plusMinus"
                        onClick={handleIncrement}
                        disabled={loadingQuantity}
                    >
                        +
                    </button>

                </div>

                <div className='itemCart__price'>
                    <div className='itemCart__price__prop'>
                        ${selectedVariant?.price ?? price}
                    </div>
                </div>

                <div className='itemCart__subtotal'>
                    <div className='itemCart__subtotal__prop'>
                        ${Math.round(quantity * (selectedVariant?.price ?? price))}
                    </div>
                </div>

                <div className='itemCart__btn'>
                    <button 
                        onClick={handleDelete}
                        disabled={loadingDelete}
                        className='itemCart__btn__prop'
                    >
                        {loadingDelete ? <Spinner/> : "X"}
                    </button>
                </div>

            </div>

        </>

    )

}

export default ItemCart