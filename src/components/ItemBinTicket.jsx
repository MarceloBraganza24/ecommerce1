import React, {useState} from 'react'
import UpdateProductModal from './UpdateProductModal'
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import ConfirmationRestoreItemBinTicketModal from './ConfirmationRestoreItemBinTicketModal';
import ConfirmationPermanentDeleteItemBinTicketModal from './ConfirmationPermanentDeleteItemBinTicketModal';
import SaleDetailModal from './SaleDetailModal';

const ItemBinTicket = ({role,ticket,fechaHora,fetchDeletedTickets,selectedTickets,setSelectedTickets,toggleSelectTicket}) => {
    const [loading, setLoading] = useState(false);
    const [loadingBtnRestore, setLoadingBtnRestore] = useState(false);
    const SERVER_URL = import.meta.env.VITE_API_URL;

    const [showConfirmationRestoreItemBinTicketModal, setShowConfirmationRestoreItemBinTicketModal] = useState(false);
    const [textConfirmationRestoreItemBinModal, setTextConfirmationRestoreItemBinTicketModal] = useState(''); 
    
    const [showConfirmationPermanentDeleteItemBinTicketModal, setShowConfirmationPermanentDeleteItemBinTicketModal] = useState(false);
    const [textConfirmationPermanentDeleteItemBinTicketModal, setTextConfirmationPermanentDeleteItemBinTicketModal] = useState('');

    const [showDetailTicketModal, setShowMoreDetailsTicketModal] = useState(false);

    const handleBtnDeleteTicket = async () => {
        setTextConfirmationPermanentDeleteItemBinTicketModal(`la venta con los siguientes datos:\nfecha: ${fechaHora}\ncodigo: ${ticket.code}\nrealizada por ${ticket.payer_email}`)
        setShowConfirmationPermanentDeleteItemBinTicketModal(true);
    };

    const handleBtnRestoreTicket = async () => {
        setTextConfirmationRestoreItemBinTicketModal(`la venta con los siguientes datos:\nfecha: ${fechaHora}\ncodigo: ${ticket.code}\nrealizada por ${ticket.payer_email}`)
        setShowConfirmationRestoreItemBinTicketModal(true);
    };

    const handleBtnShowDetailTicketModal = async () => {
        setShowMoreDetailsTicketModal(true);
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
                        const variantCampos = item.selectedVariant?.campos || snapshot?.variant?.campos;

                        const imageUrl = relativePath
                            ? `${relativePath}`  // <-- reemplazá con tu dominio real
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
                                <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__variantContainer">
                                    {variantCampos ? (
                                        <div className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__variantContainer__variant">
                                            {Object.entries(variantCampos).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="cPanelSalesContainer__salesTable__itemContainer__itemProduct__products__variantContainer__variant__prop"
                                                >
                                                    {key}: {value}
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
                                <div className="binContainer__salesTable__itemContainer__itemProduct__products__productLine__quantity">
                                    x {item.quantity}
                                </div>
                                <div className="binContainer__salesTable__itemContainer__itemProduct__products__productLine__price">
                                    ${snapshot?.price || product?.price || '-'}
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

            <div className="binContainer__salesTable__itemContainerMobile">

                <div className="binContainer__salesTable__itemContainerMobile__item">
                    <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket._id)}
                        onChange={() => toggleSelectTicket(ticket._id)}
                        />
                </div>

                <div className="binContainer__salesTable__itemContainerMobile__item">
                    <div className="binContainer__salesTable__itemContainerMobile__item__label">{fechaHora}</div>
                </div>

                <div className="binContainer__salesTable__itemContainerMobile__itemEllipsis">
                    <div className="binContainer__salesTable__itemContainerMobile__itemEllipsis__item">{ticket.code}</div>
                </div>

                <div className="binContainer__salesTable__itemContainerMobile__itemEllipsis">
                    <div className="binContainer__salesTable__itemContainerMobile__itemEllipsis__item">{ticket.payer_email}</div>
                </div>

                <div className='binContainer__salesTable__itemContainerMobile__btnsContainer'>
                    <button
                    onClick={handleBtnShowDetailTicketModal}
                    className='binContainer__salesTable__itemContainerMobile__btnsContainer__btn'
                    >
                    Ver detalle
                    </button>
                    {loadingBtnRestore ? (
                        <button
                        disabled
                        className='binContainer__salesTable__itemContainerMobile__btnsContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnRestoreTicket}
                        className='binContainer__salesTable__itemContainerMobile__btnsContainer__btn'
                        >
                        Restaurar
                        </button>
                    )}

                    {loading ? (
                        <button
                        disabled
                        className='binContainer__salesTable__itemContainerMobile__btnsContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnDeleteTicket}
                        className='binContainer__salesTable__itemContainerMobile__btnsContainer__btn'
                        >
                        Borrar <br /> permamentemente
                        </button>
                    )}

                </div>

            </div>
            {
                showDetailTicketModal &&
                <SaleDetailModal
                ticket={ticket}
                userRole={role}
                fechaHora={fechaHora}
                setShowMoreDetailsTicketModal={setShowMoreDetailsTicketModal}
                />
            }
            {
                showConfirmationRestoreItemBinTicketModal &&
                <ConfirmationRestoreItemBinTicketModal
                text={textConfirmationRestoreItemBinModal}
                ticketId={ticket._id}
                setShowConfirmationRestoreItemBinTicketModal={setShowConfirmationRestoreItemBinTicketModal}
                fetchDeletedTickets={fetchDeletedTickets}
                setSelectedTickets={setSelectedTickets}
                />
            }
            {
                showConfirmationPermanentDeleteItemBinTicketModal &&
                <ConfirmationPermanentDeleteItemBinTicketModal
                text={textConfirmationPermanentDeleteItemBinTicketModal}
                ticketId={ticket._id}
                setShowConfirmationPermanentDeleteItemBinTicketModal={setShowConfirmationPermanentDeleteItemBinTicketModal}
                fetchDeletedTickets={fetchDeletedTickets}
                setSelectedTickets={setSelectedTickets}
                />
            }

        </>
    )

}

export default ItemBinTicket