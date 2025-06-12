import React, {useState} from 'react'
import UpdateProductModal from './UpdateProductModal'
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const ItemBinTicket = ({ticket,fechaHora,fetchDeletedTickets,selectedTickets,setSelectedTickets,toggleSelectTicket}) => {
    const [loading, setLoading] = useState(false);
    const [loadingBtnRestore, setLoadingBtnRestore] = useState(false);

    const handleBtnDeleteTicket = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/api/tickets/${ticket._id}`, {
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

    const handleBtnRestoreTicket = async () => {
        try {
            setLoadingBtnRestore(true);
            const res = await fetch(`http://localhost:8081/api/tickets/${ticket._id}/restore`, {
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
            setLoadingBtnRestore(false);
        }
    };


    return (
        <>
            <div className="binContainer__salesTable__itemContainer">

                <div className="binContainer__salesTable__itemContainer__item">
                    <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket._id)}
                        onChange={() => toggleSelectTicket(ticket._id)}
                        />
                </div>

                <div className="binContainer__salesTable__itemContainer__item">
                    <div className="binContainer__salesTable__itemContainer__item__label">{fechaHora}</div>
                </div>

                <div className="binContainer__salesTable__itemContainer__itemEllipsis">
                    <div className="binContainer__salesTable__itemContainer__itemEllipsis__item">{ticket.code}</div>
                </div>

                <div className="binContainer__salesTable__itemContainer__itemProduct__products">
                    {ticket.items.map((item, index) => {
                        const handleLinkToProductDetail = () => {
                            window.location.href = `/item/${item.product._id}`
                        }

                        const product = item.product;
                        const snapshot = item.snapshot;

                        const title = product?.title
                            ? product.title.charAt(0).toUpperCase() + product.title.slice(1).toLowerCase()
                            : snapshot?.title || 'Producto eliminado';

                        const images = Array.isArray(product?.images)
                            ? product.images
                            : snapshot?.image
                                ? [snapshot.image]
                                : [];

                        const relativePath = images.length > 0 ? images[0] : null;

                        const imageUrl = relativePath
                            ? `http://localhost:8081/${relativePath}`  // <-- reemplazá con tu dominio real
                            : '/default-image.jpg';

                        return (
                            <div
                                key={index}
                                onClick={product?._id ? handleLinkToProductDetail : undefined}
                                className="binContainer__salesTable__itemContainer__itemProduct__products__productLine"
                                style={{ cursor: product?._id ? 'pointer' : 'default' }}
                            >
                                <div className="binContainer__salesTable__itemContainer__itemProduct__products__productLine__img">
                                    <img className='binContainer__salesTable__itemContainer__itemProduct__products__productLine__img__prop' src={imageUrl} alt='#image' />
                                </div>
                                <div className="binContainer__salesTable__itemContainer__itemProduct__products__productLine__title">
                                    {title}
                                </div>
                                <div className="binContainer__salesTable__itemContainer__itemProduct__products__productLine__quantity">
                                    x {item.quantity}
                                </div>
                                <div className="binContainer__salesTable__itemContainer__itemProduct__products__productLine__quantity">
                                    ${item.snapshot.price}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="binContainer__salesTable__itemContainer__item">
                    <div className="binContainer__salesTable__itemContainer__item__label">$ {ticket.amount}</div>
                </div>

                <div className="binContainer__salesTable__itemContainer__itemEllipsis">
                    <div className="binContainer__salesTable__itemContainer__itemEllipsis__item">{ticket.payer_email}</div>
                </div>

                <div className="binContainer__salesTable__itemContainer__item">
                    <div className="binContainer__salesTable__itemContainer__item__label">{ticket.user_role}</div>
                </div>

                <div className='binContainer__salesTable__itemContainer__btnsContainer'>
                    {loadingBtnRestore ? (
                        <button
                        disabled
                        className='binContainer__salesTable__itemContainer__btnsContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnRestoreTicket}
                        className='binContainer__salesTable__itemContainer__btnsContainer__btn'
                        >
                        Restaurar
                        </button>
                    )}

                    {loading ? (
                        <button
                        disabled
                        className='binContainer__salesTable__itemContainer__btnsContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnDeleteTicket}
                        className='binContainer__salesTable__itemContainer__btnsContainer__btn'
                        >
                        Borrar <br /> permamentemente
                        </button>
                    )}

                </div>

            </div>

        </>
    )

}

export default ItemBinTicket