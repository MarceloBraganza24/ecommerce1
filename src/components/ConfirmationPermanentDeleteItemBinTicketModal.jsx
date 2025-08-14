import React, {useState} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ConfirmationPermanentDeleteItemBinTicketModal = ({text,setShowConfirmationPermanentDeleteItemBinTicketModal,ticketId,fetchDeletedTickets,setSelectedTickets}) => {
    const [loading, setLoading] = useState(false);

    const handleBtnDeleteTicket = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/api/tickets/${ticketId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast('Has eliminado el ticket con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchDeletedTickets();
                setSelectedTickets([])
                setShowConfirmationPermanentDeleteItemBinTicketModal(false);
            } else {
                toast('No se ha podido borrar el ticket, intente nuevamente', {
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
                    <div onClick={()=>setShowConfirmationPermanentDeleteItemBinTicketModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
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
                        onClick={handleBtnDeleteTicket}
                        className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                        >
                        Si
                        </button>
                    )}
                    <button onClick={()=>setShowConfirmationPermanentDeleteItemBinTicketModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                </div>

            </div>
    
        </div>
    </>
  )
}

export default ConfirmationPermanentDeleteItemBinTicketModal