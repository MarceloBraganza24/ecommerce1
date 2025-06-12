import React, {useState} from 'react'
import UpdateProductModal from './UpdateProductModal'
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const ItemCPanelProduct = ({product,fetchProducts,categories,selectedProducts,setSelectedProducts,toggleSelectProduct}) => {
    const [loading, setLoading] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleBtnDeleteProduct = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/api/products/${product._id}/soft-delete`, {
                method: 'PUT',  // Usamos PUT o PATCH para actualizar, no DELETE
            });

            if (res.ok) {
                toast('Has eliminado el producto con éxito (soft delete)', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchProducts(); // recarga los productos visibles
                setSelectedProducts([])
            } else {
                toast('No se ha podido borrar el producto, intente nuevamente', {
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
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">$ {product.price}</div>
                </div>

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">{product.stock}</div>
                </div>

                <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                    <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">{capitalizeFirstLetter(product.category)}</div>
                </div>

                <div className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer'>
                    <button onClick={() => setShowUpdateModal(true)} className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'>Editar</button>

                    {loading ? (
                        <button
                        disabled
                        className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnDeleteProduct}
                        className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'
                        >
                        Borrar
                        </button>
                    )}

                </div>

            </div>

            {
                showUpdateModal &&
                <UpdateProductModal
                product={product}
                fetchProducts={fetchProducts}
                setShowUpdateModal={setShowUpdateModal}
                categories={categories}
                />
            }
        </>
    )

}

export default ItemCPanelProduct