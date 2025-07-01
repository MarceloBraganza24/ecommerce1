import React, {useState,useEffect,useRef } from 'react'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const CreateSaleModal = ({fetchTickets,setCreateSaleModal,user,products,fetchProducts,isLoadingProducts,totalProducts,pageInfoProducts}) => {
    //console.log(products)
    const [selectedField, setSelectedField] = useState('title');
    const [inputFilteredProducts, setInputFilteredProducts] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedProductData, setSelectedProductData] = useState([]); // Objetos completos
    const [allProducts, setAllProducts] = useState([]); // todos los productos sin filtrar
    const [addedProducts, setAddedProducts] = useState([]);
    //console.log(addedProducts)
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
    const [selectedVariantsMap, setSelectedVariantsMap] = useState({});

    const handleBtnCloseCreateSaleModal = () => {
        setAddedProducts([]);
        setSelectedVariantsMap({});
        setCreateSaleModal(false)
    };

    useEffect(() => {
        setAllProducts(products);
    }, []);

    const getSelectedVariante = (product) => {
        const selectedCampos = selectedVariantsMap[product._id] || {};
        return product.variantes?.find((v) =>
            Object.entries(selectedCampos).every(([key, val]) => v.campos[key] === val)
        );
    };

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
        // ✅ Verificación previa de stock
        for (let product of addedProducts) {
            const camposSeleccionados = product.camposSeleccionados || {};

            const varianteSeleccionada = product.variantes?.find(v =>
                Object.entries(camposSeleccionados).every(
                    ([key, val]) => v.campos[key] === val
                )
            );

            const stockDisponible = varianteSeleccionada?.stock ?? product.stock;

            if (product.quantity > stockDisponible) {
                    toast(`No hay suficiente stock para ${product.title} (${Object.entries(camposSeleccionados).map(([key, val]) => `${key}: ${val}`).join(', ') || 'sin variante'})`, {
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
                return; // 👈 evita continuar con la venta
            }
        }
        
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

    const getProductKey = (productId, camposSeleccionados = {}) => {
        const sortedCampos = Object.entries(camposSeleccionados)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, val]) => `${key}:${val}`)
            .join('|');
        return `${productId}__${sortedCampos}`;
    }; 

    const handleAddProduct = (product, camposSeleccionados = {}, productKey) => {

        const camposRequeridos = Object.keys(product.camposExtras || {});
        if (camposRequeridos.length > 0) {
            const todasVariantesSeleccionadas = camposRequeridos.every(
                campo => camposSeleccionados[campo] && camposSeleccionados[campo] !== ''
                );

            if (!todasVariantesSeleccionadas) {
                toast('Por favor selecciona todas las variantes antes de añadir el producto.', {
                    position: 'top-right',
                    autoClose: 3000,
                    theme: 'dark',
                });
                return;
            }
        }

        const varianteSeleccionada = product.variantes?.find(v =>
            Object.entries(camposSeleccionados).every(
                ([key, val]) => v.campos?.[key] === val
            )
        );

        const price = varianteSeleccionada?.price ?? product.price;
        const stock = varianteSeleccionada?.stock ?? product.stock;

        if (stock < 1) {
            const hasVariants = Object.keys(camposSeleccionados || {}).length > 0;

            toast(
                hasVariants
                    ? `No hay stock disponible para "${product.title}" con la variante seleccionada`
                    : `No hay stock disponible para "${product.title}" (sin variante)`,
                {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                }
            );
            return;
        }

        setAddedProducts(prev => {
            const existingProduct = prev.find(p =>
                (p._uniqueKey && p._uniqueKey === productKey) ||
                (
                    p._id === product._id &&
                    JSON.stringify(p.camposSeleccionados || {}) === JSON.stringify(camposSeleccionados)
                )
            );

            const cantidadEnLista = existingProduct?.quantity || 0;
            const cantidadDisponible = stock - cantidadEnLista;

            if (cantidadDisponible <= 0) {
                toast('No quedan más unidades disponibles para agregar!', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                return prev;
            }

            let newList;

            if (existingProduct) {
                toast('Cantidad incrementada!', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });

                newList = prev.map(p =>
                    (p._uniqueKey && p._uniqueKey === productKey) ||
                    (
                        p._id === product._id &&
                        JSON.stringify(p.camposSeleccionados || {}) === JSON.stringify(camposSeleccionados)
                    )
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                );
            } else {
                toast('Producto añadido a la venta!', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });

                newList = [
                    ...prev,
                    {
                        ...product,
                        price,
                        stock,
                        quantity: 1,
                        camposSeleccionados,
                        selectedVariant: varianteSeleccionada ?? null,
                        _uniqueKey: productKey
                    }
                ];
            }

            // ✅ Resetear los selects solo si se agrega o incrementa correctamente
            setSelectedVariantsMap(prev => {
                const newMap = { ...prev };
                delete newMap[product._id];
                return newMap;
            });

            return newList;
        });

    };

    const handleIncreaseQuantity = (productKey) => {
        setAddedProducts(prev =>
            prev.map(product => {
            if (product._uniqueKey !== productKey) return product;

            const varianteSeleccionada = product.variantes?.find(v =>
                Object.entries(product.camposSeleccionados || {}).every(
                ([key, val]) => v.campos?.[key] === val
                )
            );

            const stockDisponible = varianteSeleccionada?.stock ?? product.stock;

            if (product.quantity < stockDisponible) {
                return { ...product, quantity: product.quantity + 1 };
            } else {
                toast('No hay más stock disponible para esta variante', { /* config toast */ });
                return product;
            }
            })
        );
    };

    const handleDecreaseQuantity = (productKey) => {
        setAddedProducts(prev =>
            prev.map(product =>
            product._uniqueKey === productKey && product.quantity > 1
                ? { ...product, quantity: product.quantity - 1 }
                : product
            )
        );
    };

    const handleRemoveProduct = (productKey) => {
      setAddedProducts(prev => prev.filter(p => p._uniqueKey !== productKey));
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

        setAddedProducts(prev => {
            const updated = [...prev];

            for (const product of selectedProductData) {
                const camposSeleccionados = selectedVariantsMap[product._id] || {};
                const camposRequeridos = Object.keys(product.camposExtras || {});
                const tieneVariantes = camposRequeridos.length > 0;

                // Validar que estén todas las variantes seleccionadas
                const variantesCompletas = camposRequeridos.every(
                    campo => camposSeleccionados[campo] && camposSeleccionados[campo] !== ''
                );

                if (tieneVariantes && !variantesCompletas) {
                    toast(`Faltan seleccionar variantes para "${product.title}"`, {
                        position: "top-right",
                        autoClose: 2000,
                        theme: "dark",
                    });
                    continue;
                }

                // Buscar variante específica si hay
                const varianteSeleccionada = product.variantes?.find(v =>
                    Object.entries(camposSeleccionados).every(
                        ([key, val]) => v.campos?.[key] === val
                    )
                );

                const stock = varianteSeleccionada?.stock ?? product.stock;
                const price = varianteSeleccionada?.price ?? product.price;

                const productKey = getProductKey(product._id, camposSeleccionados);

                const existingIndex = updated.findIndex(p => p._uniqueKey === productKey);
                const existingProduct = updated[existingIndex];
                const cantidadEnLista = existingProduct?.quantity || 0;
                const cantidadDisponible = stock - cantidadEnLista;

                if (cantidadDisponible <= 0) {
                    toast(`No queda stock disponible para "${product.title}"`, {
                        position: "top-right",
                        autoClose: 2000,
                        theme: "dark",
                    });
                    continue;
                }

                if (existingIndex !== -1) {
                    updated[existingIndex].quantity += 1;
                } else {
                    updated.push({
                        ...product,
                        price,
                        stock,
                        quantity: 1,
                        camposSeleccionados,
                        _uniqueKey: productKey,
                    });
                }

                // Limpiar selects después de añadir
                if (tieneVariantes) {
                    setSelectedVariantsMap(prev => {
                        const newMap = { ...prev };
                        delete newMap[product._id];
                        return newMap;
                    });
                }
            }

            return updated;
        });

        setSelectedProducts([]);
        setSelectedProductData([]);
    };


    return (

        <>

            <div className="createSaleModalContainer">

                <div className='createSaleModalContainer__createSaleModal'>

                    <div className='createSaleModalContainer__createSaleModal__btnCloseModal'>
                        <div onClick={handleBtnCloseCreateSaleModal} className='createSaleModalContainer__createSaleModal__btnCloseModal__prop'>X</div>
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
                            <div className='createSaleModalContainer__createSaleModal__addedProducts__subTitle'>Cantidad de productos añadidos: {addedProducts.length}</div>
                            <div className='createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer'>

                                <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable">

                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Imagen</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Título</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Descripción</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Variantes</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Precio</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Stock</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Cantidad</div>
                                    <div className="createSaleModalContainer__createSaleModal__addedProducts__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Categoría</div>

                                </div>

                            </div>
                            <div className='createSaleModalContainer__createSaleModal__addedProducts__list'>
                                {addedProducts.map(product => (

                                    <div key={product._uniqueKey || product._id} className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer'>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <img className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__img" src={`http://localhost:8081/${product.images[0]}`} alt="" />
                                        </div>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__label">{product.title}</div>
                                        </div>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__description">{product.description}</div>
                                        </div>

                                        {
                                            product.variantes?.length > 0 ? (
                                                <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__itemVariantes">
                                                {Object.entries(product.camposExtras || {}).map(([atributo, opcionesStr]) => {
                                                    const opciones = opcionesStr.split(',').map(op => op.trim());

                                                    return (
                                                    <div key={atributo} className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__itemVariantes__variantes'>
                                                        <div>{atributo}:</div>
                                                        <select
                                                        className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__itemVariantes__variantes__select'
                                                        value={product.camposSeleccionados?.[atributo] || ''}
                                                        onChange={(e) => {
                                                        const value = e.target.value;

                                                        setAddedProducts(prev => {
                                                            const prevSinEste = prev.filter(p => p._uniqueKey !== product._uniqueKey);

                                                            const nuevosCampos = {
                                                                ...product.camposSeleccionados,
                                                                [atributo]: value
                                                            };

                                                            const newKey = getProductKey(product._id, nuevosCampos);

                                                            const yaExiste = prevSinEste.some(p => p._uniqueKey === newKey);

                                                            if (yaExiste) {
                                                                toast('Ya has añadido este producto con esa variante.', {
                                                                    position: "top-right",
                                                                    autoClose: 2000,
                                                                    theme: "dark",
                                                                    className: "custom-toast",
                                                                });
                                                                return prev;
                                                            }

                                                            const varianteSeleccionada = product.variantes.find(v =>
                                                                Object.entries(nuevosCampos).every(([key, val]) => v.campos[key] === val)
                                                            );

                                                            const actualizado = {
                                                                ...product,
                                                                camposSeleccionados: nuevosCampos,
                                                                price: varianteSeleccionada?.price ?? product.price,
                                                                stock: varianteSeleccionada?.stock ?? product.stock,
                                                                quantity: 1,
                                                                _uniqueKey: newKey
                                                            };

                                                            return [...prevSinEste, actualizado];
                                                        });
                                                    }}

                                                        >
                                                        {opciones.map((op, idx) => (
                                                            <option key={idx} value={op}>{op}</option>
                                                        ))}
                                                        </select>
                                                    </div>
                                                    );
                                                })}
                                                </div>
                                            ) : (
                                                <span className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__itemVariantes__noVariants'>-</span>
                                                )
                                        }

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__label">
                                                {
                                                    product.variantes?.length > 0
                                                        ? (
                                                            (() => {
                                                            const selectedVariante = product.variantes.find(v =>
                                                                Object.entries(product.camposSeleccionados || {}).every(
                                                                ([key, val]) => v.campos[key] === val
                                                                )
                                                            );
                                                            return selectedVariante ? `$ ${selectedVariante.price}` : '-';
                                                            })()
                                                        )
                                                        : `$ ${product.price}`
                                                    }
                                            </div>
                                        </div>

                                            {/* Stock */}
                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__label">
                                                {
                                                product.variantes?.length > 0
                                                    ? (
                                                    product.variantes.find(v =>
                                                        Object.entries(product.camposSeleccionados || {}).every(([key, val]) => v.campos[key] === val)
                                                    )?.stock ?? '-'
                                                    )
                                                    : product.stock
                                                }
                                            </div>
                                        </div>


                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__quantity">
                                                <button className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__quantity__btn' onClick={() => handleDecreaseQuantity(product._uniqueKey)}>-</button>
                                                <span>{product.quantity}</span>
                                                <button className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__quantity__btn' onClick={() => handleIncreaseQuantity(product._uniqueKey)}>+</button>
                                            </div>
                                        </div>

                                        <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item">
                                            <div className="createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__item__label">{product.category}</div>
                                        </div>

                                        <div className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__btnsContainer'>

                                            <button onClick={() => handleRemoveProduct(product._uniqueKey)} className='createSaleModalContainer__createSaleModal__addedProducts__list__itemContainer__btnsContainer__btn'>Borrar</button>

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
                                <div className="createSaleModalContainer__createSaleModal__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Variantes</div>
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
                                products.map((product) => {
                                    const camposSeleccionados = selectedVariantsMap[product._id] || {};
                                    const productKey = getProductKey(product._id, camposSeleccionados);

                                    return (
                                    
                                        <div key={productKey} className="createSaleModalContainer__createSaleModal__productsTable__itemContainer">

                                            <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product._id)}
                                                    onChange={() => toggleSelectProduct(product._id)}
                                                />
                                            </div>

                                            <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item">
                                                <img className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item__img" src={`http://localhost:8081/${product.images[0]}`} alt="" />
                                            </div>

                                            <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item">
                                                <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item__label">{product.title}</div>
                                            </div>

                                            <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item">
                                                <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item__description">{product.description}</div>
                                            </div>

                                            <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__itemVariantes">
                                                {
                                                    product.variantes?.length > 0 ? (
                                                        Object.entries(product.camposExtras || {}).map(([atributo, opcionesStr]) => {
                                                            const opciones = opcionesStr.split(',').map(op => op.trim());

                                                            return (
                                                                <div key={atributo} className='createSaleModalContainer__createSaleModal__productsTable__itemContainer__itemVariantes__variantes'>
                                                                    <div>{atributo}</div>
                                                                    <select
                                                                        className='createSaleModalContainer__createSaleModal__productsTable__itemContainer__itemVariantes__variantes__select'
                                                                        value={selectedVariantsMap[product._id]?.[atributo] || ''}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            setSelectedVariantsMap(prev => {
                                                                                const newMap = {
                                                                                ...prev,
                                                                                [product._id]: {
                                                                                    ...prev[product._id],
                                                                                    [atributo]: value
                                                                                }
                                                                                };
                                                                                return newMap;
                                                                            });
                                                                        }}
                                                                    >
                                                                        <option value="" disabled>{`Elegir ${atributo}`}</option>
                                                                        {opciones.map((op, idx) => (
                                                                            <option key={idx} value={op}>{op}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className='createSaleModalContainer__createSaleModal__productsTable__itemContainer__itemVariantes__noVariants'>-</span>
                                                    )
                                                }
                                            </div>

                                            <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item">
                                                <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item__label">
                                                    {product.variantes?.length > 0 ? (
                                                        (() => {
                                                            const camposSeleccionados = selectedVariantsMap[product._id] || {};
                                                            const camposRequeridos = Object.keys(product.camposExtras || {});
                                                            const variantesCompletas = camposRequeridos.every(
                                                                campo => camposSeleccionados[campo] && camposSeleccionados[campo] !== ''
                                                            );
                                                            return variantesCompletas
                                                                ? `$ ${getSelectedVariante(product)?.price ?? '-'}`
                                                                : '-';
                                                        })()
                                                    ) : `$ ${product.price}`}
                                                </div>
                                            </div>

                                            <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item">
                                                <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item__label">
                                                    {product.variantes?.length > 0 ? (
                                                        (() => {
                                                            const camposSeleccionados = selectedVariantsMap[product._id] || {};
                                                            const camposRequeridos = Object.keys(product.camposExtras || {});
                                                            const variantesCompletas = camposRequeridos.every(
                                                                campo => camposSeleccionados[campo] && camposSeleccionados[campo] !== ''
                                                            );
                                                            return variantesCompletas
                                                                ? getSelectedVariante(product)?.stock ?? '-'
                                                                : '-';
                                                        })()
                                                    ) : product.stock}
                                                </div>
                                            </div>



                                            <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item">
                                                <div className="createSaleModalContainer__createSaleModal__productsTable__itemContainer__item__label">{product.category}</div>
                                            </div>

                                            <div className='createSaleModalContainer__createSaleModal__productsTable__itemContainer__btnsContainer'>

                                                {/* <button onClick={() => {console.log('Añadir producto con variantes:', selectedVariantsMap[product._id]);handleAddProduct(product, camposSeleccionados, productKey)}} className='createSaleModalContainer__createSaleModal__productsTable__itemContainer__btnsContainer__btn'>Añadir</button> */}
                                                <button
                                                    className='createSaleModalContainer__createSaleModal__productsTable__itemContainer__btnsContainer__btn'
                                                    onClick={() => {
                                                    // Validar que todas las variantes tengan valor seleccionado
                                                    const campos = selectedVariantsMap[product._id] || {};
                                                    const faltan = Object.values(campos).some(v => !v);
                                                    if (product.variantes?.length > 0 && faltan) {
                                                        toast('Por favor selecciona todas las variantes');
                                                        return;
                                                    }
                                                    const key = getProductKey(product._id, campos);
                                                    // Aquí llamás a la función para agregar producto:
                                                    handleAddProduct(product, campos, key);
                                                    }}
                                                >
                                                    Añadir
                                                </button>

                                            </div>

                                        </div>
                                    )
                                    
                                })
                        }
                        
                        {
                            !isLoadingProducts &&
                            
                            <div className='createSaleModalContainer__createSaleModal__btnsPagesContainer'>
                                <button className='createSaleModalContainer__createSaleModal__btnsPagesContainer__btn'
                                    disabled={!pageInfoProducts.hasPrevPage}
                                    onClick={() => handleChangePage(pageInfoProducts.prevPage)}
                                    >
                                    Anterior
                                </button>
                                
                                <span>Página {pageInfoProducts.page} de {pageInfoProducts.totalPages}</span>

                                <button className='createSaleModalContainer__createSaleModal__btnsPagesContainer__btn'
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