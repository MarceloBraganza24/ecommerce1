import React, {useState} from 'react'
import UpdateProductModal from './UpdateProductModal'
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import ConfirmationDeleteCPanelProductModal from './ConfirmationDeleteCPanelProductModal';

const ItemCPanelProduct = ({product,fetchProducts,inputFilteredProducts,selectedField,categories,selectedProducts,setSelectedProducts,toggleSelectProduct}) => {
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showConfirmationDeleteCPanelProductModal, setShowConfirmationDeleteCPanelProductModal] = useState(false);
    const [textConfirmationDeleteModal, setTextConfirmationDeleteCPanelProductModal] = useState('');

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleBtnDeleteProduct = async () => {
        setTextConfirmationDeleteCPanelProductModal(`el producto "${capitalizeFirstLetter(product.title)} ${capitalizeFirstLetter(product.description)}"`)
        setShowConfirmationDeleteCPanelProductModal(true);
    };

    return (
        <>
            <div className="cPanelProductsContainer__productsTable__itemContainer">

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleSelectProduct(product._id)}
                    />
                </div>


                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <img className="cPanelProductsContainer__productsTable__itemContainer__item__img" src={`http://localhost:8081/${product.images[0]}`} alt="" />
                </div>

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">{capitalizeFirstLetter(product.title)}</div>
                </div>

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__description">{capitalizeFirstLetter(product.description)}</div>
                </div>

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">
                        {
                            product.variantes && product.variantes.length != 0 ?
                            <div onClick={() => setShowUpdateModal(true)} style={{cursor:'pointer'}}>Ver precios</div>
                            :
                            <div>$ {product.price}</div>    
                        }
                    </div>
                </div>

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">
                        {
                            product.variantes && product.variantes.length != 0 ?
                            <div onClick={() => setShowUpdateModal(true)} style={{cursor:'pointer'}}>Ver stock</div>
                            :
                            product.stock 
                        }
                    </div>
                </div>

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">{capitalizeFirstLetter(product.category)}</div>
                </div>

                <div className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer'>
                    <button onClick={() => setShowUpdateModal(true)} className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'>Editar</button>
                    <button
                    onClick={handleBtnDeleteProduct}
                    className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'
                    >
                    Borrar
                    </button>
                </div>

            </div>

            {
                showUpdateModal &&
                <UpdateProductModal
                product={product}
                fetchProducts={fetchProducts}
                inputFilteredProducts={inputFilteredProducts}
                selectedField={selectedField}
                setShowUpdateModal={setShowUpdateModal}
                categories={categories}
                />
            }
            {
                showConfirmationDeleteCPanelProductModal &&
                <ConfirmationDeleteCPanelProductModal
                text={textConfirmationDeleteModal}
                productId={product._id}
                setShowConfirmationDeleteCPanelProductModal={setShowConfirmationDeleteCPanelProductModal}
                fetchProducts={fetchProducts}
                setSelectedProducts={setSelectedProducts}
                />
            }
        </>
    )

}

export default ItemCPanelProduct