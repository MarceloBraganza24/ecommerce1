import React, {useState} from 'react'
import ItemBinProductModal from './ItemBinProductModal'
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import ConfirmationRestoreItemBinProductModal from './ConfirmationRestoreItemBinProductModal';
import ConfirmationPermanentDeleteItemBinProductModal from './ConfirmationPermanentDeleteItemBinProductModal';

const ItemBinProduct = ({product,fetchDeletedProducts,selectedProducts,setSelectedProducts}) => {
    const [loading, setLoading] = useState(false);
    const [loadingBtnRestore, setLoadingBtnRestore] = useState(false);
    const [showItemBinProductModal, setShowItemBinProductModal] = useState(false);

    
    const [showConfirmationRestoreItemBinProductModal, setShowConfirmationRestoreItemBinProductModal] = useState(false);
    const [textConfirmationRestoreItemBinModal, setTextConfirmationRestoreItemBinProductModal] = useState('');

    const [showConfirmationPermanentDeleteItemBinProductModal, setShowConfirmationPermanentDeleteItemBinProductModal] = useState(false);
    const [textConfirmationPermanentDeleteItemBinProductModal, setTextConfirmationPermanentDeleteItemBinProductModal] = useState('');

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleBtnDeleteProduct = async () => {
        setTextConfirmationPermanentDeleteItemBinProductModal(`el siguiente producto:\n Título: ${capitalizeFirstLetter(product.title)}\n Descripción: ${capitalizeFirstLetter(product.description)}`)
        setShowConfirmationPermanentDeleteItemBinProductModal(true);
    };

    const handleBtnRestoreProduct = async () => {
        setTextConfirmationRestoreItemBinProductModal(`el siguiente producto:\n Título: ${capitalizeFirstLetter(product.title)}\n Descripción: ${capitalizeFirstLetter(product.description)}`)
        setShowConfirmationRestoreItemBinProductModal(true);
    };


    return (
        <>
            <div className="binContainer__productsTable__itemContainer">

                <div className="binContainer__productsTable__itemContainer__item">
                    <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => {
                        if (selectedProducts.includes(product._id)) {
                            setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                        } else {
                            setSelectedProducts([...selectedProducts, product._id]);
                        }
                        }}
                    />
                </div>


                <div className="binContainer__productsTable__itemContainer__item">
                    <img className="binContainer__productsTable__itemContainer__item__img" src={`http://localhost:8081/${product.images[0]}`} alt="" />
                </div>

                <div className="binContainer__productsTable__itemContainer__item">
                    <div className="binContainer__productsTable__itemContainer__item__label">{capitalizeFirstLetter(product.title)}</div>
                </div>

                <div className="binContainer__productsTable__itemContainer__item">
                    <div className="binContainer__productsTable__itemContainer__item__description">{capitalizeFirstLetter(product.description)}</div>
                </div>

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">
                        {
                            product.variantes && product.variantes.length != 0 ?
                            <div onClick={() => setShowItemBinProductModal(true)} style={{cursor:'pointer'}}>Ver precios</div>
                            :
                            <div>$ {product.price}</div>    
                        }
                    </div>
                </div>

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">
                        {
                            product.variantes && product.variantes.length != 0 ?
                            <div onClick={() => setShowItemBinProductModal(true)} style={{cursor:'pointer'}}>Ver stock</div>
                            :
                            product.stock 
                        }
                    </div>
                </div>

                <div className="binContainer__productsTable__itemContainer__item">
                    <div className="binContainer__productsTable__itemContainer__item__label">{capitalizeFirstLetter(product.category)}</div>
                </div>

                <div className='binContainer__productsTable__itemContainer__btnsContainer'>
                    {loadingBtnRestore ? (
                        <button
                        disabled
                        className='binContainer__productsTable__itemContainer__btnsContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnRestoreProduct}
                        className='binContainer__productsTable__itemContainer__btnsContainer__btn'
                        >
                        Restaurar
                        </button>
                    )}

                    {loading ? (
                        <button
                        disabled
                        className='binContainer__productsTable__itemContainer__btnsContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnDeleteProduct}
                        className='binContainer__productsTable__itemContainer__btnsContainer__btn'
                        >
                        Borrar <br /> permanentemente
                        </button>
                    )}

                </div>

            </div>

            {
                showItemBinProductModal &&
                <ItemBinProductModal
                product={product}
                setShowItemBinProductModal={setShowItemBinProductModal}
                />
            }
            {
                showConfirmationRestoreItemBinProductModal &&
                <ConfirmationRestoreItemBinProductModal
                text={textConfirmationRestoreItemBinModal}
                productId={product._id}
                setShowConfirmationRestoreItemBinProductModal={setShowConfirmationRestoreItemBinProductModal}
                fetchDeletedProducts={fetchDeletedProducts}
                setSelectedProducts={setSelectedProducts}
                />
            }
            {
                showConfirmationPermanentDeleteItemBinProductModal &&
                <ConfirmationPermanentDeleteItemBinProductModal
                text={textConfirmationPermanentDeleteItemBinProductModal}
                productId={product._id}
                setShowConfirmationPermanentDeleteItemBinProductModal={setShowConfirmationPermanentDeleteItemBinProductModal}
                fetchDeletedProducts={fetchDeletedProducts}
                setSelectedProducts={setSelectedProducts}
                />
            }
        </>
    )

}

export default ItemBinProduct