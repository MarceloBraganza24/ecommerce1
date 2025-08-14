import React, {useState} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ConfirmationPermanentDeleteItemBinProductModal = ({text,setShowConfirmationPermanentDeleteItemBinProductModal,productId,fetchDeletedProducts,setSelectedProducts}) => {
    const [loading, setLoading] = useState(false);

    const handleBtnDeleteProduct = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/api/products/${productId}`, {
                method: 'DELETE'
            });
            const result = await res.json();
            console.log(result)
            if (res.ok) {
                toast('Has eliminado el producto con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchDeletedProducts();
                setSelectedProducts([])
                setShowConfirmationPermanentDeleteItemBinProductModal(false);
            } else {
                toast('No se ha podido borrar el producto, intente nuevamente', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

  return (
    <>

        <div className='confirmationDeleteModalContainer'>

            <div className='confirmationDeleteModalContainer__confirmationModal'>

                <div className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal'>
                    <div onClick={()=>setShowConfirmationPermanentDeleteItemBinProductModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                </div>
                
                <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                    <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas borrar permanentemente <br /> {text}?</div>
                </div>

                <div className='confirmationDeleteModalContainer__confirmationModal__btnContainer'>
                    {loading ? (
                        <button
                        disabled
                        className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnDeleteProduct}
                        className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                        >
                        Si
                        </button>
                    )}
                    <button onClick={()=>setShowConfirmationPermanentDeleteItemBinProductModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                </div>

            </div>
    
        </div>
    </>
  )
}

export default ConfirmationPermanentDeleteItemBinProductModal