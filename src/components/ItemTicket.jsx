import React, {useState} from 'react'
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import ConfirmationDeleteAdminTicketModal from './ConfirmationDeleteAdminTicketModal';
import ConfirmationDeleteUserTicketModal from './ConfirmationDeleteUserTicketModal';
import SaleDetailModal from './SaleDetailModal';

const ItemTicket = ({ticket,fetchTickets,selectedDate,fechaHora,email,role,selectedTickets,setSelectedTickets,toggleSelectTicket}) => {
    const SERVER_URL = import.meta.env.VITE_API_URL;
    const [loading, setLoading] = useState(false);
    const [showMoreDetailsTicketModal, setShowMoreDetailsTicketModal] = useState(false);
    const [showConfirmationDeleteAdminTicketModal, setShowConfirmationDeleteAdminTicketModal] = useState(false);
    const [textConfirmationDeleteModal, setTextConfirmationDeleteAdminTicketModal] = useState('');

    const [showConfirmationDeleteUserTicketModal, setShowConfirmationDeleteUserTicketModal] = useState(false);
    const [textConfirmationDeleteUserTicketModal, setTextConfirmationDeleteUserTicketModal] = useState('');

    const handleBtnSeeMoreDetailsTicket = () => {
        setShowMoreDetailsTicketModal(true);
    };

    const handleBtnDeleteTicket = () => {
        setTextConfirmationDeleteAdminTicketModal(`la venta con los siguientes datos?\n- Fecha: ${fechaHora}\n- Codigo: ${ticket.code}\n- Realizada por ${ticket.payer_email}`)
        setShowConfirmationDeleteAdminTicketModal(true);
    };

    const handleBtnDeleteUserTicket = () => {
        setTextConfirmationDeleteUserTicketModal(`la compra con los siguientes datos?\n- Fecha: ${fechaHora}\n- Codigo: ${ticket.code}\n- Realizada por ${ticket.payer_email}`)
        setShowConfirmationDeleteUserTicketModal(true);
    };

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return (
        <>
            {
                (role == 'admin' || role == 'premium') ?
                <>
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
                                const variantCampos = item.selectedVariant?.campos || snapshot?.variant?.campos;

                                const imageUrl = relativePath
                                    ? `${relativePath}`  // <-- reemplazá con tu dominio real
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
                                        <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__variantContainer">
                                            {variantCampos ? (
                                                <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__variantContainer__variant">
                                                    {Object.entries(variantCampos).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__variantContainer__variant__prop"
                                                        >
                                                            {capitalizeFirstLetter(key)}: {value}
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                            :
                                            <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__variantContainer__noVariant">
                                                -
                                            </div>
                                            }
                                        </div>
                                        <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__productLine__quantity">
                                            x {item.quantity}
                                        </div>
                                        <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__productLine__quantity">
                                            ${snapshot?.price || product?.price || '-'}
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
                            : (role == 'admin' || role == 'premium') &&
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
                    <div className="cPanelSalesContainer__salesTable__itemContainerMobile">

                        <div className="cPanelSalesContainer__salesTable__itemContainerMobile__item">
                            <input
                                type="checkbox"
                                checked={selectedTickets.includes(ticket._id)}
                                onChange={() => toggleSelectTicket(ticket._id)}
                                />
                        </div>

                        <div className="cPanelSalesContainer__salesTable__itemContainerMobile__item">
                            <div className="cPanelSalesContainer__salesTable__itemContainerMobile__item__label">{fechaHora}</div>
                        </div>

                        <div className="cPanelSalesContainer__salesTable__itemContainerMobile__itemEllipsis">
                            <div className="cPanelSalesContainer__salesTable__itemContainerMobile__itemEllipsis__item">{ticket.code}</div>
                        </div>

                        <div className="cPanelSalesContainer__salesTable__itemContainerMobile__itemEllipsis">
                            <div className="cPanelSalesContainer__salesTable__itemContainerMobile__itemEllipsis__item">{ticket.payer_email}</div>
                        </div>

                        <div className='cPanelSalesContainer__salesTable__itemContainerMobile__btnsContainer'>

                            <button
                            onClick={handleBtnSeeMoreDetailsTicket}
                            className='cPanelSalesContainer__salesTable__itemContainerMobile__btnsContainer__btn'
                            >
                            Ver más
                            </button>
                            {loading ? (
                                <button
                                disabled
                                className='cPanelSalesContainer__salesTable__itemContainerMobile__btnsContainer__btn'
                                >
                                <Spinner/>
                                </button>
                            ) 
                            : (role == 'admin' || role == 'premium') &&
                            (
                                <button
                                onClick={handleBtnDeleteTicket}
                                className='cPanelSalesContainer__salesTable__itemContainerMobile__btnsContainer__btn'
                                >
                                Borrar
                                </button>
                            )}

                        </div>

                    </div>
                </>
                : role == 'user' &&
                <>
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

                                const variantCampos = item.selectedVariant?.campos || snapshot?.variant?.campos;
                                //  console.log(snapshot)

                                const imageUrl = relativePath
                                    ? `${relativePath}` // reemplazá con tu dominio real
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
                                        <div className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__variantContainer">
                                            {variantCampos ? (
                                                <div className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__variantContainer__variant">
                                                    {Object.entries(variantCampos).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__variantContainer__variant__prop"
                                                        >
                                                            {capitalizeFirstLetter(key)}: {value}
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                            :
                                            <div className="myPurchasesContainer__purchasesTable__itemContainer__itemProduct__products__variantContainer__noVariant">
                                                -
                                            </div>
                                            }
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
                                onClick={handleBtnDeleteUserTicket}
                                className='myPurchasesContainer__purchasesTable__itemContainer__btnsContainer__btn'
                                >
                                Borrar
                                </button>
                            )}
                        </div>

                    </div>

                    <div className="myPurchasesContainer__purchasesTable__itemContainerMobile">

                        <div className="myPurchasesContainer__purchasesTable__itemContainerMobile__item">
                            <div className="myPurchasesContainer__purchasesTable__itemContainerMobile__item__label">{fechaHora}</div>
                        </div>

                        <div className="myPurchasesContainer__purchasesTable__itemContainerMobile__itemEllipsis">
                            <div className="myPurchasesContainer__purchasesTable__itemContainerMobile__itemEllipsis__item">{ticket.code}</div>
                        </div>

                        <div className="myPurchasesContainer__purchasesTable__itemContainerMobile__itemEllipsis">
                            <div className="myPurchasesContainer__purchasesTable__itemContainerMobile__itemEllipsis__itemPrice">${ticket.amount}</div>
                        </div>

                        <div className='myPurchasesContainer__purchasesTable__itemContainerMobile__btnsContainer'>
                            <button
                            onClick={setShowMoreDetailsTicketModal}
                            className='myPurchasesContainer__purchasesTable__itemContainerMobile__btnsContainer__btn'
                            >
                            Ver más
                            </button>
                            {loading ? (
                                <button
                                disabled
                                className='myPurchasesContainer__purchasesTable__itemContainerMobile__btnsContainer__btn'
                                >
                                <Spinner/>
                                </button>
                            ) : role == 'user' && (
                                <button
                                onClick={handleBtnDeleteUserTicket}
                                className='myPurchasesContainer__purchasesTable__itemContainerMobile__btnsContainer__btn'
                                >
                                Borrar
                                </button>
                            )}

                        </div>

                    </div>
                </>
            }

            {
                showMoreDetailsTicketModal &&
                <SaleDetailModal
                ticket={ticket}
                userRole={role}
                fechaHora={fechaHora}
                setShowMoreDetailsTicketModal={setShowMoreDetailsTicketModal}
                />
            }

            {
                showConfirmationDeleteAdminTicketModal &&
                <ConfirmationDeleteAdminTicketModal
                text={textConfirmationDeleteModal}
                ticketId={ticket._id}
                setShowConfirmationDeleteAdminTicketModal={setShowConfirmationDeleteAdminTicketModal}
                fetchTickets={fetchTickets}
                selectedDate={selectedDate}
                setSelectedTickets={setSelectedTickets}
                />
            }

            {
                showConfirmationDeleteUserTicketModal &&
                <ConfirmationDeleteUserTicketModal
                text={textConfirmationDeleteUserTicketModal}
                ticketId={ticket._id}
                email={email}
                setShowConfirmationDeleteUserTicketModal={setShowConfirmationDeleteUserTicketModal}
                fetchTickets={fetchTickets}
                selectedDate={selectedDate}
                setSelectedTickets={setSelectedTickets}
                />
            }
            
        </>
    )

}

export default ItemTicket