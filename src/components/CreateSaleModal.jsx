import React, {useState,useEffect,useRef } from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const CreateSaleModal = ({fetchTickets,setCreateSaleModal,user,products,fetchProducts,isLoadingProducts,totalProducts,pageInfoProducts}) => {
    const [selectedField, setSelectedField] = useState('title');
    const [inputFilteredProducts, setInputFilteredProducts] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedProductData, setSelectedProductData] = useState([]); // Objetos completos
    const [allProducts, setAllProducts] = useState([]); // todos los productos sin filtrar
    const [addedProducts, setAddedProducts] = useState([]);
    const [loadingBtnConfirmSale, setLoadingBtnConfirmSale] = useState(false);
    const headerRef = useRef(null);
    const [inputDiscount, setInputDiscount] = useState('');
    const [showLabelAddCoupon, setShowLabelAddDiscount] = useState(true);
    const [showInputDiscountContainer, setShowInputDiscountContainer] = useState(false);
    const [showLabelDiscountApplied, setShowLabelApplyDiscount] = useState(false);
    const [total, setTotal] = useState('');
    const [totalQuantity, setTotalQuantity] = useState('');
    const [totalWithDiscount, setTotalWithDiscount] = useState('');
    const [isLoadingValidateCoupon, setIsLoadingValidateCoupon] = useState(false);

    const handleBtnCreateSale = () => {
        setCreateSaleModal(false)
    };

    useEffect(() => {
        setAllProducts(products);
    }, []);

    const toggleSelectProduct = (productId) => {
        const product = products.find(p => p._id === productId);
        if (!product) return;

        setSelectedProducts((prevIds) =>
            prevIds.includes(productId)
                ? prevIds.filter((id) => id !== productId)
                : [...prevIds, productId]
        );

        setSelectedProductData((prevData) =>
            prevData.some((p) => p._id === productId)
                ? prevData.filter((p) => p._id !== productId)
                : [...prevData, product]
        );
    };

    const handleBtnAddDiscount = () => {
        if(showInputDiscountContainer) {
            setShowInputDiscountContainer(false)
        } else {
            setShowInputDiscountContainer(true)
        }
    }

    const handleBtnChangeDiscount = () => {
        setShowInputDiscountContainer(true)
        setShowLabelAddDiscount(true)
        setShowLabelApplyDiscount(false)
    }

    const handleInputDiscount = (e) => {
        setInputDiscount(e.target.value)
    }

    const handleBtnApplyDiscount = async () => {
        if(!inputDiscount) {
            toast('Debes ingresar un descuento!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
            return
        } else if(inputDiscount <= 0) {
            toast('Debes ingresar un descuento mayor a 0!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
            return
        }
        setShowLabelAddDiscount(false)
        setShowInputDiscountContainer(false)
        setShowLabelApplyDiscount(true)
    }

    const fieldLabels = {
        title: 'Título',
        description: 'Descripción',
        category: 'Categoría',
        state: 'Estado',
        price: 'Precio',
        stock: "Stock",
        all: 'Todos'
    };

    const handleBtnConfirmSale = async () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        const purchase_datetime = currentDate;

        const newTicket = {
            amount: showLabelDiscountApplied?totalWithDiscount:total,
            payer_email: user.email,
            items: addedProducts,
            deliveryMethod: 'vendedor',
            purchase_datetime,
            user_role: user.role,
        }
        try {
            setLoadingBtnConfirmSale(true)
            const response = await fetch(`http://localhost:8081/api/tickets/save-admin-sale`, {
                method: 'POST',         
                credentials: 'include', // 👈 necesario para recibir cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTicket)
            })
            const data = await response.json();
            if (response.ok) {
                toast('Has registrado la venta con éxito!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
                setTimeout(() => {
                    setCreateSaleModal(false)
                    fetchTickets(1, "", "");
                }, 2500);
            } else {
                toast('Ha ocurrido un error, intente nuevamente!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setLoadingBtnConfirmSale(false)
        } finally {
            setLoadingBtnConfirmSale(false)
        }
    }

    const handleAddProduct = (product) => {
        if (product.stock < 1) {
            toast('No hay stock disponible en este producto!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        setAddedProducts(prev => {
            const existingProduct = prev.find(p => p._id === product._id);
            const cantidadEnLista = existingProduct?.quantity || 0;
            const cantidadDisponible = product.stock - cantidadEnLista;

            if (cantidadDisponible <= 0) {
                toast('No quedan más unidades disponibles para agregar!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
                return prev;
            }

            toast('Has añadido un producto a la venta!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });

            if (existingProduct) {
                return prev.map(p =>
                    p._id === product._id
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                );
            } else {
                return [...prev, { ...product, quantity: 1 }];
            }
        });
    };

    const handleIncreaseQuantity = (productId) => {
        setAddedProducts(prev =>
            prev.map(product =>
                product._id === productId && product.quantity < product.stock
                    ? { ...product, quantity: product.quantity + 1 }
                    : product
            )
        );
    };

    const handleDecreaseQuantity = (productId) => {
        setAddedProducts(prev =>
            prev.map(product =>
                product._id === productId && product.quantity > 1
                    ? { ...product, quantity: product.quantity - 1 }
                    : product
            )
        );
    };

    const handleRemoveProduct = (productId) => {
        setAddedProducts(addedProducts.filter(product => product._id !== productId));
    };

    const handleInputFilteredProducts = (e) => {
        const value = e.target.value;
        const soloLetrasYNumeros = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
        setInputFilteredProducts(soloLetrasYNumeros);
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchProducts(1, inputFilteredProducts, selectedField);
        }, 500); // Agrega debounce para no disparar cada tecla (opcional)
        return () => clearTimeout(delayDebounce);
    }, [inputFilteredProducts, selectedField]);

    useEffect(() => {
        if (addedProducts.length === 0) {
            setTotal(0);
            setTotalQuantity(0);
            setTotalWithDiscount(0);
            return;
        }

        // Calcular total y cantidad total
        const totalCalculated = addedProducts.reduce((acc, product) => {
            return acc + (product.price * product.quantity);
        }, 0);

        const quantityCalculated = addedProducts.reduce((acc, product) => {
            return acc + product.quantity;
        }, 0);

        setTotal(totalCalculated);
        setTotalQuantity(quantityCalculated);

        // Verificar si el descuento es válido
        const discount = parseFloat(inputDiscount);
        const isValidDiscount = !isNaN(discount) && discount >= 0 && discount <= 100;

        const discountedTotal = isValidDiscount
            ? totalCalculated - (totalCalculated * discount / 100)
            : totalCalculated;

        setTotalWithDiscount(discountedTotal);

    }, [addedProducts, inputDiscount]); // 👈 Se recalcula cada vez que cambia cantidad o descuento

    const handleChangePage = (page) => {
        fetchProducts(page, inputFilteredProducts, selectedField)
    };

    useEffect(() => {
        if (headerRef.current) {
            headerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [pageInfoProducts.page]);

    const handleAddSelectedProducts = () => {
        if (selectedProducts.length === 0) {
            toast('Debes seleccionar al menos 1 producto!', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        const selectedToAdd = selectedProductData; // Usar los productos seleccionados completos

        const productsWithStock = selectedToAdd.filter(p => p.stock > 0);
        const productsWithoutStock = selectedToAdd.filter(p => p.stock < 1);

        if (productsWithStock.length > 0) {
            setAddedProducts(prev => {
                const updated = [...prev];

                for (const product of productsWithStock) {
                    const existingIndex = updated.findIndex(p => p._id === product._id);
                    const existingProduct = updated[existingIndex];
                    const cantidadEnLista = existingProduct?.quantity || 0;
                    const cantidadDisponible = product.stock - cantidadEnLista;

                    if (cantidadDisponible <= 0) {
                        toast('No quedan más unidades disponibles para agregar!', {
                            position: "top-right",
                            autoClose: 2000,
                            theme: "dark",
                            className: "custom-toast",
                        });
                        // No agregamos más unidades para este producto, seguimos con el siguiente
                        continue;
                    }

                    if (existingIndex !== -1) {
                        updated[existingIndex].quantity += 1;
                    } else {
                        updated.push({ ...product, quantity: 1 });
                    }
                }

                return updated;
            });
        }

        setSelectedProducts([]);
        setSelectedProductData([]);

        if (productsWithoutStock.length === selectedToAdd.length) {
            toast('Ninguno de los productos seleccionados tiene stock disponible.', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
        } else if (productsWithoutStock.length > 0) {
            toast(`${productsWithoutStock.length} producto(s) no fueron añadidos por falta de stock.`, {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
        }
    };


    return (

        <>

            <div className="createSaleModalContainer">

                <div className='createSaleModalContainer__createSaleModal'>

                    <div className='createSaleModalContainer__createSaleModal__btnCloseModal'>
                        <div onClick={handleBtnCreateSale} className='createSaleModalContainer__createSaleModal__btnCloseModal__prop'>X</div>
                    </div>

                    <div className='createSaleModalContainer__createSaleModal__title'>
                        <div className='createSaleModalContainer__createSaleModal__title__prop'>Crear venta</div>
                    </div>

                    <div className='createSaleModalContainer__createSaleModal__inputSearchProduct'>
                        <div className='createSaleModalContainer__createSaleModal__inputSearchProduct__selectContainer'>
                            <div className='createSaleModalContainer__createSaleModal__inputSearchProduct__selectContainer__label'>Buscar por:</div>
                            <select
                                className='createSaleModalContainer__createSaleModal__inputSearchProduct__selectContainer__select'
                                value={selectedField}
                                onChange={(e) => setSelectedField(e.target.value)}
                                >
                                {Object.entries(fieldLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className='createSaleModalContainer__createSaleModal__inputSearchProduct__inputContainer'>
                            <input type="text" onChange={handleInputFilteredProducts} value={inputFilteredProducts} placeholder={`Buscar productos por ${fieldLabels[selectedField]}`} className='createSaleModalContainer__createSaleModal__inputSearchProduct__inputContainer__input' name="" id="" />
                        </div>
                    </div>

                    {
                        addedProducts.length > 0 && 
                        <div className='createSaleModalContainer__createSaleModal__addedProducts'>
                            <div className='createSaleModalContainer__createSaleModal__addedProducts__title'>- Productos añadidos -</div>
                            <div className='createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer'>

                                <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable">

                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Imagen</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Título</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Descripción</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Cantidad</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Precio</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Stock</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Categoría</div>

                                </div>

                            </div>
                            <div className='createSaleModalContainer__createSaleModal__addedProducts__list'>
                                {addedProducts.map(product => (

                                    <div key={product._id} className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer'>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <img className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__img" src={`http://localhost:8081/${product.images[0]}`} alt="" />
                                        </div>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__label">{product.title}</div>
                                        </div>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__description">{product.description}</div>
                                        </div>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__quantity">
                                                <button className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__quantity__btn' onClick={() => handleDecreaseQuantity(product._id)}>-</button>
                                                <span>{product.quantity}</span>
                                                <button className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__quantity__btn' onClick={() => handleIncreaseQuantity(product._id)}>+</button>
                                            </div>
                                        </div>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__label">$ {product.price}</div>
                                        </div>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__label">{product.stock}</div>
                                        </div>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__label">{product.category}</div>
                                        </div>

                                        <div className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__btnsContainer'>

                                            <button onClick={() => handleRemoveProduct(product._id)} className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__btnsContainer__btn'>Borrar</button>

                                        </div>

                                    </div>
                                    
                                ))}
                            </div>

                            <div>

                                {
                                    showLabelAddCoupon &&
                                    <div className='createSaleModalContainer__createSaleModal__addedProducts__itemDiscount'>
                                        <div onClick={handleBtnAddDiscount} className='createSaleModalContainer__createSaleModal__addedProducts__itemDiscount__prop'>Ingresar descuento</div>
                                    </div>
                                }

                                {
                                    showInputDiscountContainer &&
                                    <div className='createSaleModalContainer__createSaleModal__addedProducts__inputCouponContainer'>
                                        <input placeholder='Descuento (%)' value={inputDiscount} onChange={handleInputDiscount} className='createSaleModalContainer__createSaleModal__addedProducts__inputCouponContainer__input' type="number" />
                                        
                                        <button onClick={handleBtnApplyDiscount} className='createSaleModalContainer__createSaleModal__addedProducts__inputCouponContainer__btn'>
                                            {isLoadingValidateCoupon ? (
                                                <>
                                                    <Spinner />
                                                </>
                                            ) : (
                                                'Aplicar'
                                            )}
                                        </button>
                                    </div>
                                }

                                {
                                    showLabelDiscountApplied &&
                                    <>
                                        <div className='createSaleModalContainer__createSaleModal__addedProducts__itemDiscount'>
                                            <div className='createSaleModalContainer__createSaleModal__addedProducts__itemDiscount__labelDiscount'>Has aplicado un descuento del <strong>{inputDiscount}%</strong></div>
                                        </div>
                                        <div className='createSaleModalContainer__createSaleModal__addedProducts__itemDiscount'>
                                            <div onClick={handleBtnChangeDiscount} className='createSaleModalContainer__createSaleModal__addedProducts__itemDiscount__labelDiscount' style={{cursor: 'pointer', textDecoration: 'underline'}}>Cambiar descuento</div>
                                        </div>
                                    </>
                                }

                                {
                                    !showLabelDiscountApplied ?
                                        <div className='createSaleModalContainer__createSaleModal__addedProducts__itemGrid'>

                                            <div className='createSaleModalContainer__createSaleModal__addedProducts__itemGrid__labelTotal'>TOTAL</div>

                                            <div className='createSaleModalContainer__createSaleModal__addedProducts__itemGrid__valueTotal'>$ {total}</div>

                                        </div>
                                    :
                                        <>
                                            <div className='createSaleModalContainer__createSaleModal__addedProducts__itemGrid'>

                                                <div className='createSaleModalContainer__createSaleModal__addedProducts__itemGrid__labelTotalBefore'></div>

                                                <div className='createSaleModalContainer__createSaleModal__addedProducts__itemGrid__valueTotal'><span style={{fontSize:'14px',alignSelf:'center'}}>antes</span> <span style={{textDecoration:'line-through'}}>$ {total}</span></div>

                                            </div>
                                            <div className='createSaleModalContainer__createSaleModal__addedProducts__itemGrid'>

                                                <div className='createSaleModalContainer__createSaleModal__addedProducts__itemGrid__labelTotal'>TOTAL <span style={{fontSize:'14px'}}>(con descuento)</span></div>

                                                <div className='createSaleModalContainer__createSaleModal__addedProducts__itemGrid__valueTotal'>$ {totalWithDiscount}</div>

                                            </div>
                                        </>
                                }

                            </div>
                            <div className='createSaleModalContainer__createSaleModal__addedProducts__btnContainer'>
                                <button
                                    className="createSaleModalContainer__createSaleModal__addedProducts__btnContainer__btn"
                                    onClick={() => setAddedProducts([])}
                                >
                                    Vaciar productos añadidos
                                </button>
                                <button 
                                    onClick={handleBtnConfirmSale} 
                                    className='createSaleModalContainer__createSaleModal__addedProducts__btnContainer__btn'
                                    disabled={loadingBtnConfirmSale}
                                >
                                    {loadingBtnConfirmSale ? <Spinner/> : 'Confirmar venta'}
                                </button>
                            </div>
                        </div>
                    }

                    <div className='createSaleModalContainer__createSaleModal__btnAddSelected'>
                        <button
                            className='createSaleModalContainer__createSaleModal__btnAddSelected__btn'
                            onClick={handleAddSelectedProducts}
                        >
                            {selectedProducts.length === 0
                            ? 'Añadir seleccionados'
                            : `Añadir seleccionados (${selectedProducts.length})`}
                        </button>
                    </div>



                    {
                        products.length != 0 &&
                        <div className='createSaleModalContainer__createSaleModal__headerTableContainer'>

                            <div className="createSaleModalContainer__createSaleModal__headerTableContainer__headerTable">

                                <div className="createSaleModalContainer__createSaleModal__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}></div>
                                <div className="createSaleModalContainer__createSaleModal__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Imagen</div>
                                <div className="createSaleModalContainer__createSaleModal__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Título</div>
                                <div className="createSaleModalContainer__createSaleModal__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Descripción</div>
                                <div className="createSaleModalContainer__createSaleModal__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Precio</div>
                                <div className="createSaleModalContainer__createSaleModal__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Stock</div>
                                <div className="createSaleModalContainer__createSaleModal__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Categoría</div>

                            </div>

                        </div>
                    }

                    <div ref={headerRef} className='createSaleModalContainer__createSaleModal__productsTable'>

                        {
                            isLoadingProducts ? 
                                <>
                                    <div className="catalogContainer__grid__catalog__isLoadingLabel">
                                        Cargando productos&nbsp;&nbsp;<Spinner/>
                                    </div>
                                </>
                            :
                                products.map((product) => (
                                

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
                                            <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">{product.title}</div>
                                        </div>

                                        <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                                            <div className="cPanelProductsContainer__productsTable__itemContainer__item__description">{product.description}</div>
                                        </div>

                                        <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                                            <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">$ {product.price}</div>
                                        </div>

                                        <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                                            <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">{product.stock}</div>
                                        </div>

                                        <div className="cPanelProductsContainer__productsTable__itemContainer__item">
                                            <div className="cPanelProductsContainer__productsTable__itemContainer__item__label">{product.category}</div>
                                        </div>

                                        <div className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer'>

                                            <button onClick={() => handleAddProduct(product)} className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'>Añadir</button>

                                        </div>

                                    </div>
                                    
                                ))
                        }
                        
                        {
                            !isLoadingProducts &&
                            
                            <div className='cPanelProductsContainer__btnsPagesContainer'>
                                <button className='cPanelProductsContainer__btnsPagesContainer__btn'
                                    disabled={!pageInfoProducts.hasPrevPage}
                                    onClick={() => handleChangePage(pageInfoProducts.prevPage)}
                                    >
                                    Anterior
                                </button>
                                
                                <span>Página {pageInfoProducts.page} de {pageInfoProducts.totalPages}</span>

                                <button className='cPanelProductsContainer__btnsPagesContainer__btn'
                                    disabled={!pageInfoProducts.hasNextPage}
                                    onClick={() => handleChangePage(pageInfoProducts.nextPage)}
                                    >
                                    Siguiente
                                </button>
                            </div>
                        }

                    </div>

                </div>

            </div>

        </>

    )

}

export default CreateSaleModal