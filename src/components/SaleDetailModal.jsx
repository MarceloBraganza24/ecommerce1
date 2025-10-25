import React from 'react'

const SaleDetailModal = ({userRole,ticket,setShowMoreDetailsTicketModal,fechaHora}) => {

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return (

        <>
            
            <div className='saleDetailModalContainer'>

                <div className='saleDetailModalContainer__saleDetailModal'>

                    <div className='saleDetailModalContainer__saleDetailModal__btnCloseModal'>
                        <div className='saleDetailModalContainer__saleDetailModal__btnCloseModal__title'>Detalle de venta</div>
                        <div onClick={()=>setShowMoreDetailsTicketModal(false)} className='saleDetailModalContainer__saleDetailModal__btnCloseModal__btn'>X</div>
                    </div>

                    <div className='saleDetailModalContainer__saleDetailModal__detailsGrid'>
                        <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__key'>Fecha y hora</div>
                        <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__value'>{fechaHora}</div>
                    </div>

                    <div className='saleDetailModalContainer__saleDetailModal__detailsGrid'>
                        <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__key'>Código</div>
                        <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__itemEllipsis'>{ticket.code}</div>
                    </div> 

                    <div className='saleDetailModalContainer__saleDetailModal__detailsGrid'>
                        <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__key'>TOTAL</div>
                        <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__valuePrice'>${ticket.amount}</div>
                    </div>

                    {
                        (userRole == 'admin' || userRole == 'premium') &&
                        <>
                            <div className='saleDetailModalContainer__saleDetailModal__detailsGrid'>
                                <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__key'>Operador</div>
                                <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__itemEllipsis'>{ticket.payer_email}</div>
                            </div>

                            <div className='saleDetailModalContainer__saleDetailModal__detailsGrid'>
                                <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__key'>Rol</div>
                                <div className='saleDetailModalContainer__saleDetailModal__detailsGrid__value'>{ticket.user_role}</div>
                            </div>
                        </>
                    }

                    <div>Productos</div>
                    <div className="saleDetailModalContainer__saleDetailModal__detailsGrid__products">
                        
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
                                <>
                                    <div
                                        key={index}
                                        onClick={product?._id ? handleLinkToProductDetail : undefined}
                                        className="saleDetailModalContainer__saleDetailModal__detailsGrid__products__productLine"
                                        style={{ cursor: product?._id ? 'pointer' : 'default' }}
                                    >
                                        <div className="saleDetailModalContainer__saleDetailModal__detailsGrid__products__productLine__img">
                                            <img className='saleDetailModalContainer__saleDetailModal__detailsGrid__products__productLine__img__prop' src={imageUrl} alt='#image' />
                                        </div>
                                        <div className="saleDetailModalContainer__saleDetailModal__detailsGrid__products__productLine__title">
                                            {title}
                                        </div>
                                        <div className="saleDetailModalContainer__saleDetailModal__detailsGrid__products__variantContainer">
                                            {variantCampos ? (
                                                <div className="saleDetailModalContainer__saleDetailModal__detailsGrid__products__variantContainer__variant">
                                                    {Object.entries(variantCampos).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="saleDetailModalContainer__saleDetailModal__detailsGrid__products__variantContainer__variant__prop"
                                                        >
                                                            <strong>{capitalizeFirstLetter(key)}</strong>: {value}
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                            :
                                            <div className="saleDetailModalContainer__saleDetailModal__detailsGrid__products__variantContainer__noVariant">
                                                -
                                            </div>
                                            }
                                        </div>
                                        <div className="saleDetailModalContainer__saleDetailModal__detailsGrid__products__productLine__quantity">
                                            x {item.quantity}
                                        </div>
                                        <div className="saleDetailModalContainer__saleDetailModal__detailsGrid__products__productLine__quantity">
                                            ${snapshot?.price || product?.price || '-'}
                                        </div>
                                    </div>
                                </>
                            );
                        })}
                    </div>

                </div>

            </div>

        </>

    )

}

export default SaleDetailModal