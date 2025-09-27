import React, {useState} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ConfirmationDeleteUserTicketModal = ({text,email,setShowConfirmationDeleteUserTicketModal,ticketId,fetchTickets,selectedDate,setSelectedTickets}) => {
    const [loading, setLoading] = useState(false);
    const SERVER_URL = import.meta.env.VITE_API_URL;

    const handleBtnHiddenProduct = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${SERVER_URL}api/tickets/${ticketId}`, {
                method: 'PUT'
            });
            if (res.ok) {
                toast('Has eliminado la compra con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchTickets(1, "", email);
            } else {
                toast('No se ha podido eliminar la compra, intente nuevamente', {
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
                    <div onClick={()=>setShowConfirmationDeleteUserTicketModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                </div>
                
                <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                    <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas eliminar {text}?</div>
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
                        onClick={handleBtnHiddenProduct}
                        className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                        >
                        Si
                        </button>
                    )}
                    <button onClick={()=>setShowConfirmationDeleteUserTicketModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                </div>

            </div>
    
        </div>
    </>
  )
}

export default ConfirmationDeleteUserTicketModal