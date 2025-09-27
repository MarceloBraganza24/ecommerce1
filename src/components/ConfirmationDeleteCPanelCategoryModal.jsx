import React, {useState} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ConfirmationDeleteCPanelCategoryModal = ({fetchCategories,setShowConfirmationDeleteCPanelCategoryModal,categoryId}) => {
    const [loading, setLoading] = useState(false);
    const SERVER_URL = import.meta.env.VITE_API_URL;
    const handleDelete = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${SERVER_URL}api/categories/${categoryId._id}`, { method: "DELETE" });
            if(res.ok) {
                fetchCategories();
                setShowConfirmationDeleteCPanelCategoryModal(false)
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false)
        }
    };

  return (
    <>

        <div className='confirmationDeleteModalContainer'>

            <div className='confirmationDeleteModalContainer__confirmationModal'>

                <div className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal'>
                    <div onClick={()=>setShowConfirmationDeleteCPanelCategoryModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                </div>
                
                <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                    <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas eliminar la categoría "{categoryId.name}"?</div>
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
                        onClick={handleDelete}
                        className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                        >
                        Si
                        </button>
                    )}
                    <button onClick={()=>setShowConfirmationDeleteCPanelCategoryModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                </div>

            </div>
    
        </div>
    </>
  )
}

export default ConfirmationDeleteCPanelCategoryModal