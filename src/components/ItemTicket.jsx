import React, {useState} from 'react'
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const ItemTicket = ({ticket,fetchTickets,fechaHora,email,role,selectedTickets,setSelectedTickets,toggleSelectTicket}) => {
    const [loading, setLoading] = useState(false);

    const handleBtnDeleteTicket = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/api/tickets/${ticket._id}/soft-delete`, {
                method: 'PUT',  // Usamos PUT o PATCH para actualizar, no DELETE
            });

            if (res.ok) {
                toast('Has eliminado el ticket con éxito (soft delete)', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchTickets(1, "", "");
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

    const handleBtnHiddenProduct = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/api/tickets/${ticket._id}`, {
                method: 'PUT'
            });
            if (res.ok) {
                toast('Has eliminado la venta con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchTickets(1, "", email);
            } else {
                toast('No se ha podido eliminar la venta, intente nuevamente', {
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
            {
                role == 'admin' ?

                <div className="cPanelSalesContainer__salesTable__itemContainer">

                    <div className="cPanelSalesContainer__salesTable__itemContainer__item">
                        <input
                            type="checkbox"
                            checked={selectedTickets.includes(ticket._id)}
                            onChange={() => toggleSelectTicket(ticket._id)}
                            />
                    </div>

                    <div className="cPanelSalesContainer__salesTable__itemContainer__item">
                        <div className="cPanelSalesContainer__salesTable__itemContainer__item__label">{fechaHora}</div>
                    </div>

                    <div className="cPanelSalesContainer__salesTable__itemContainer__itemEllipsis">
                        <div className="cPanelSalesContainer__salesTable__itemContainer__itemEllipsis__item">{ticket.code}</div>
                    </div>

                    <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products">
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
                                    className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__productLine"
                                    style={{ cursor: product?._id ? 'pointer' : 'default' }}
                                >
                                    <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__productLine__img">
                                        <img className='cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__productLine__img__prop' src={imageUrl} alt='#image' />
                                    </div>
                                    <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__productLine__title">
                                        {title}
                                    </div>
                                    <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__productLine__quantity">
                                        x {item.quantity}
                                    </div>
                                    <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__productLine__quantity">
                                        ${item.snapshot.price}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cPanelSalesContainer__salesTable__itemContainer__item">
                        <div className="cPanelSalesContainer__salesTable__itemContainer__item__label">$ {ticket.amount}</div>
                    </div>

                    <div className="cPanelSalesContainer__salesTable__itemContainer__itemEllipsis">
                        <div className="cPanelSalesContainer__salesTable__itemContainer__itemEllipsis__item">{ticket.payer_email}</div>
                    </div>

                    <div className="cPanelSalesContainer__salesTable__itemContainer__item">
                        <div className="cPanelSalesContainer__salesTable__itemContainer__item__label">{ticket.user_role}</div>
                    </div>

                    <div className='cPanelSalesContainer__salesTable__itemContainer__btnsContainer'>

                        {loading ? (
                            <button
                            disabled
                            className='cPanelSalesContainer__salesTable__itemContainer__btnsContainer__btn'
                            >
                            <Spinner/>
                            </button>
                        ) 
                        : role == 'admin' &&
                        (
                            <button
                            onClick={handleBtnDeleteTicket}
                            className='cPanelSalesContainer__salesTable__itemContainer__btnsContainer__btn'
                            >
                            Borrar
                            </button>
                        )}

                    </div>

                </div>
                : role == 'user' &&
                <div className="myPurchasesContainer__purchasesTable__itemContainer">

                    <div className="myPurchasesContainer__purchasesTable__itemContainer__item">
                        <div className="myPurchasesContainer__purchasesTable__itemContainer__item__label">{fechaHora}</div>
                    </div>

                    <div className="myPurchasesContainer__purchasesTable__itemContainer__itemEllipsis">
                        <div className="myPurchasesContainer__purchasesTable__itemContainer__itemEllipsis__item">{ticket.code}</div>
                    </div>

                    <div className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products">
                        {ticket.items.map((item, index) => {
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
                                ? `http://localhost:8081/${relativePath}` // reemplazá con tu dominio real
                                : '/default-image.jpg';

                            const handleLinkToProductDetail = () => {
                                if (product?._id) {
                                    window.location.href = `/item/${product._id}`;
                                }
                            };

                            return (
                                <div
                                    key={index}
                                    onClick={product?._id ? handleLinkToProductDetail : undefined}
                                    className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__productLine"
                                    style={{ cursor: product?._id ? 'pointer' : 'default' }}
                                >
                                    <div className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__img">
                                        <img
                                            className='myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__img__prop'
                                            src={imageUrl}
                                            alt='Producto'
                                        />
                                    </div>
                                    <div className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__title">
                                        {title}
                                    </div>
                                    <div className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__quantity">
                                        x {item.quantity}
                                    </div>
                                    <div className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__quantity">
                                        ${snapshot?.price || product?.price || '-'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="myPurchasesContainer__purchasesTable__itemContainer__item">
                        <div className="myPurchasesContainer__purchasesTable__itemContainer__item__label">$ {ticket.amount}</div>
                    </div>

                    <div className='myPurchasesContainer__purchasesTable__itemContainer__btnsContainer'>

                        {loading ? (
                            <button
                            disabled
                            className='myPurchasesContainer__purchasesTable__itemContainer__btnsContainer__btn'
                            >
                            <Spinner/>
                            </button>
                        ) : role == 'user' && (
                            <button
                            onClick={handleBtnHiddenProduct}
                            className='myPurchasesContainer__purchasesTable__itemContainer__btnsContainer__btn'
                            >
                            Borrar
                            </button>
                        )}
                    </div>

                </div>
            }
            
        </>
    )

}

export default ItemTicket