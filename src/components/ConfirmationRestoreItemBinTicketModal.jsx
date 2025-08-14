import React, {useState} from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ConfirmationRestoreItemBinTicketModal = ({text,setShowConfirmationRestoreItemBinTicketModal,ticketId,fetchDeletedTickets,setSelectedTickets}) => {
    const [loading, setLoading] = useState(false);

    const handleBtnRestoreTicket = async () => {
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8081/api/tickets/${ticketId}/restore`, {
                method: 'PUT',
            });

            if (res.ok) {
                toast('Ticket restaurado correctamente', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchDeletedTickets(); // Recargá los productos para ver el cambio
                setSelectedTickets([])
                setShowConfirmationRestoreItemBinTicketModal(false);
            } else {
                toast('No se pudo restaurar el ticket', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (error) {
            console.error('Error al restaurar el ticket:', error);
        }finally {
            setLoading(false);
        }
    };

  return (
    <>

        <div className='confirmationDeleteModalContainer'>

            <div className='confirmationDeleteModalContainer__confirmationModal'>

                <div className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal'>
                    <div onClick={()=>setShowConfirmationRestoreItemBinTicketModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
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
                        onClick={handleBtnRestoreTicket}
                        className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                        >
                        Si
                        </button>
                    )}
                    <button onClick={()=>setShowConfirmationRestoreItemBinTicketModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                </div>

            </div>
    
        </div>
    </>
  )
}

export default ConfirmationRestoreItemBinTicketModal