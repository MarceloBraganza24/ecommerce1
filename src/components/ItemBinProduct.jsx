import React, {useState} from 'react'
import UpdateProductModal from './UpdateProductModal'
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const ItemBinProduct = ({product,fetchDeletedProducts,selectedProducts,setSelectedProducts}) => {
    const [loading, setLoading] = useState(false);
    const [loadingBtnRestore, setLoadingBtnRestore] = useState(false);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleBtnDeleteProduct = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/api/products/${product._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast('Has eliminado el producto con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchDeletedProducts();
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

    const handleBtnRestoreProduct = async () => {
        try {
            setLoadingBtnRestore(true);
            const res = await fetch(`http://localhost:8081/api/products/${product._id}/restore`, {
                method: 'PUT',
            });

            if (res.ok) {
                toast('Producto restaurado correctamente', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchDeletedProducts(); // Recargá los productos para ver el cambio
                setSelectedProducts([])
            } else {
                toast('No se pudo restaurar el producto', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (error) {
            console.error('Error al restaurar el producto:', error);
        }finally {
            setLoadingBtnRestore(false);
        }
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

                <div className="binContainer__productsTable__itemContainer__item">
                    <div className="binContainer__productsTable__itemContainer__item__label">$ {product.price}</div>
                </div>

                <div className="binContainer__productsTable__itemContainer__item">
                    <div className="binContainer__productsTable__itemContainer__item__label">{product.stock}</div>
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

        </>
    )

}

export default ItemBinProduct