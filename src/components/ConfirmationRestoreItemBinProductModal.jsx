import React, {useState} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ConfirmationRestoreItemBinProductModal = ({text,setShowConfirmationRestoreItemBinProductModal,productId,fetchDeletedProducts,setSelectedProducts}) => {
    const [loading, setLoading] = useState(false);

    const handleBtnRestoreProduct = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8081/api/products/${productId}/restore`, {
                method: 'PUT',
            });

            if (res.ok) {
                toast('Producto restaurado correctamente', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchDeletedProducts(); // Recargá los productos para ver el cambio
                setSelectedProducts([]);
                setShowConfirmationRestoreItemBinProductModal(false);
            } else {
                toast('No se pudo restaurar el producto', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (error) {
            console.error('Error al restaurar el producto:', error);
        }finally {
            setLoading(false);
        }
    };

  return (
    <>

        <div className='confirmationDeleteModalContainer'>

            <div className='confirmationDeleteModalContainer__confirmationModal'>

                <div className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal'>
                    <div onClick={()=>setShowConfirmationRestoreItemBinProductModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                </div>
                
                <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                    <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas restaurar <br /> {text}?</div>
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
                        onClick={handleBtnRestoreProduct}
                        className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                        >
                        Si
                        </button>
                    )}
                    <button onClick={()=>setShowConfirmationRestoreItemBinProductModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                </div>

            </div>
    
        </div>
    </>
  )
}

export default ConfirmationRestoreItemBinProductModal