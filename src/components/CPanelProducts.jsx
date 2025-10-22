import React, {useState,useEffect,useContext,useRef} from 'react'
import NavBar from './NavBar'
import { useNavigate } from 'react-router-dom'
import ItemCPanelProduct from './ItemCPanelProduct';
import CreateProductModal from './CreateProductModal';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { useAuth } from '../context/AuthContext';
import NavbarMobile from './NavbarMobile';

const CPanelProducts = () => {
    const SERVER_URL = import.meta.env.VITE_API_URL;
    const [categoriesTree, setCategoriesTree] = useState([]);
    const [showConfirmationUpdatePricesModal, setShowConfirmationUpdatePricesModal] = useState(false);
    const [showConfirmationRestoreOriginalPricesModal, setShowConfirmationRestoreOriginalPricesModal] = useState(false);
    const [showConfirmationDeleteAllProductsSelectedModal, setShowConfirmationDeleteAllProductsSelectedModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useAuth();
    const [isScrollForced, setIsScrollForced] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_white.png');
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState("");
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [storeSettings, setStoreSettings] = useState({});
    const [userCart, setUserCart] = useState({});
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    });   
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [selectedField, setSelectedField] = useState('all');

    const [inputFilteredProducts, setInputFilteredProducts] = useState('');
    const [showCreateProductModal, setShowCreateProductModal] = useState(false);
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);

    const productsListRef = useRef(null); 

    const fetchCategoriesTree = async () => {
        try {
            const res = await fetch(`${SERVER_URL}api/categories/combined`);
            const data = await res.json();
            if (res.ok) setCategoriesTree(data.payload || []);
        } catch (err) {
            console.error("Error al cargar categorías:", err);
        } finally {
            setIsLoadingCategories(false)
        }
    };
    
    useEffect(() => {
        if (!isLoadingAuth) {
            if (!user || (user.role !== 'admin' && user.role !== 'premium')) {
                navigate('/');
            }
        }
    }, [user, isLoadingAuth, navigate]);

    useEffect(() => {
        if (user?.isLoggedIn) {
            fetchCartByUserId(user._id)
        }
    }, [user]);

    function esColorClaro(hex) {
        if (!hex) return true;

        hex = hex.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return brightness > 128; // <-- usar el mismo umbral que en getContrastingTextColor
    }

    useEffect(() => {
        if (storeSettings?.primaryColor) {
            const claro = esColorClaro(storeSettings.primaryColor);
            setCartIcon(claro ? '/src/assets/cart_black.png' : '/src/assets/cart_white.png');
        }
    }, [storeSettings]);

    const fieldLabels = {
        title: 'Título',
        description: 'Descripción',
        category: 'Categoría',
        state: 'Estado',
        price: 'Precio',
        stock: "Stock",
        all: 'Todos'
    };

    const handleInputFilteredProducts = (e) => {
        const value = e.target.value;
        const soloLetrasYNumeros = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
        setInputFilteredProducts(soloLetrasYNumeros);
    }

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchProducts(1, inputFilteredProducts, selectedField);
        }, 300); // debounce

        return () => clearTimeout(delay);
    }, [inputFilteredProducts, selectedField]);
    
    useEffect(() => {
        setIsScrollForced(true);

        if (productsListRef.current) {
            productsListRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        const timeout = setTimeout(() => {
            setIsScrollForced(false);
        }, 1500);

        return () => clearTimeout(timeout);
    }, [pageInfo.page]);

    const fetchProducts = async (page = 1, search = "",field = "") => {
        try {
            const response = await fetch(`${SERVER_URL}api/products/byPage?page=${page}&search=${search}&field=${field}`)
            const productsAll = await response.json();
            setTotalProducts(productsAll.data.totalDocs)
            setProducts(productsAll.data.docs)
            setPageInfo({
                page: productsAll.data.page,
                totalPages: productsAll.data.totalPages,
                hasNextPage: productsAll.data.hasNextPage,
                hasPrevPage: productsAll.data.hasPrevPage,
                nextPage: productsAll.data.nextPage,
                prevPage: productsAll.data.prevPage
            });
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoadingProducts(false)
        }
    };

    const fetchStoreSettings = async () => {
        try {
            const response = await fetch(`${SERVER_URL}api/settings`);
            const data = await response.json();
            if (response.ok) {
                setStoreSettings(data); 
            } else {
                toast('Error al cargar configuraciones', {
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
            console.error(error);
        } finally {
            setIsLoadingStoreSettings(false)
        }
    };

    const fetchCartByUserId = async (user_id) => {
        try {
            const response = await fetch(`${SERVER_URL}api/carts/byUserId/${user_id}`);
            const data = await response.json();
    
            if (!response.ok) {
                console.error("Error al obtener el carrito:", data);
                toast('Error al cargar el carrito del usuario actual', {
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
                setUserCart({ user_id, products: [] }); // 👈 cambio clave
                return [];
            }
    
            if (!data.data || !Array.isArray(data.data.products)) {
                console.warn("Carrito vacío o no válido, asignando array vacío.");
                setUserCart({ user_id, products: [] }); // 👈 cambio clave
                return [];
            }
    
            setUserCart(data.data);
            return data.data;
    
        } catch (error) {
            console.error("Error al obtener el carrito:", error);
            toast('Error en la conexión', {
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
            setUserCart({ user_id, products: [] }); // 👈 cambio clave
            return [];
        }
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchProducts(1, inputFilteredProducts, selectedField);
        fetchStoreSettings();
        fetchCategoriesTree();
        window.scrollTo(0, 0);
    }, []);

    function hexToRgba(hex, opacity) {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const [selectedCategories, setSelectedCategories] = useState([]);
    //console.log(selectedCategories)
    const [percentage, setPercentage] = useState('');

    const handleCheckboxChange = (id) => {
        setSelectedCategories(prev =>
        prev.includes(id)
            ? prev.filter(catId => catId !== id)
            : [...prev, id]
        );
    };

    const isParentSelected = (categoryId) => {
        const findParentId = (cats, targetId, parentId = null) => {
            for (let cat of cats) {
                if (cat._id === targetId) return parentId;
                if (cat.children?.length) {
                    const found = findParentId(cat.children, targetId, cat._id);
                    if (found) return found;
                }
            }
            return null;
        };
        const parentId = findParentId(categoriesTree, categoryId);
        return parentId && selectedCategories.includes(parentId);
    };

    const handleSubmitUpdatedPrices = () => {
        if (selectedCategories.length === 0) {
            toast('Debes seleccionar al menos una categoría.', {
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
            return; // evita que se continúe con el fetch
        }
        if (!percentage || isNaN(percentage) || Number(percentage) === 0) {
            toast('Debes ingresar un porcentaje válido (mayor o menor a 0).', {
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
        setShowConfirmationUpdatePricesModal(true);
    };

    const handleRestorePricesByCategory = async () => {
        if (selectedCategories.length === 0) {
            toast('Debes seleccionar al menos una categoría para restaurar los precios.', {
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
        setShowConfirmationRestoreOriginalPricesModal(true);
    };

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const getSelectedCategoryNames = (tree, selectedIds) => {
        let result = [];

        const traverse = (nodes) => {
            for (const node of nodes) {
            if (selectedIds.includes(node._id)) {
                result.push(node.name);
            }
            if (node.children && node.children.length > 0) {
                traverse(node.children);
            }
            }
        };

        traverse(tree);
        return result;
    };

    const ConfirmationDeleteAllProductsSelected = () => {
        const [loading, setLoading] = useState(false);

        const handleMassDelete = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${SERVER_URL}api/products/mass-delete`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedProducts })
                });

                const data = await res.json();
                if (res.ok) {
                    setSelectedProducts([]);
                    fetchProducts(1, inputFilteredProducts, selectedField);
                    toast('Productos eliminados correctamente', {
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
                    setLoading(false);
                    setShowConfirmationDeleteAllProductsSelectedModal(false);
                } 
            } catch (error) {
                console.error(error);
                toast('Error al eliminar productos', {
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
                setLoading(false);
            }
        };

        return (
            
            <>

                <div className='confirmationDeleteModalContainer'>

                    <div className='confirmationDeleteModalContainer__confirmationModal'>

                        <div className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal'>
                            <div onClick={()=>setShowConfirmationDeleteAllProductsSelectedModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                        </div>
                        
                        <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                            <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas borrar todos los productos({selectedProducts.length}) seleccionados?</div>
                        </div>

                        <div className='confirmationDeleteModalContainer__confirmationModal__btnContainer'>
                            {loading ? (
                                <button
                                disabled
                                className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                                >
                                <Spinner/>
                                </button>
                            ) : (
                                <button
                                onClick={handleMassDelete}
                                className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                                >
                                Si
                                </button>
                            )}
                            <button onClick={()=>setShowConfirmationDeleteAllProductsSelectedModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                        </div>

                    </div>
            
                </div>

            </>
            
        )

    }

    const ConfirmationUpdatePricesModal = () => {
        const [loading, setLoading] = useState(false);

        const categoriasSeleccionadasNames = getSelectedCategoryNames(categoriesTree, selectedCategories);

        const handleSubmitUpdatedPrices = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${SERVER_URL}api/products/update-prices-category`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        percentage: Number(percentage),
                        categories: selectedCategories
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    toast('Has aplicado los cambios correctamente!', {
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
                    setPercentage('');
                    setSelectedCategories([]);
                    fetchProducts(1, inputFilteredProducts, selectedField)
                    setShowConfirmationUpdatePricesModal(false);
                } else {
                    toast('Ha ocurrido un error al aplicar los cambios, intente nuevamente!', {
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
                console.error(error);
                toast('Error al eliminar productos', {
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
                setLoading(false);
            }
        };

        return (
            
            <>

                <div className='confirmationDeleteModalContainer'>

                    <div className='confirmationDeleteModalContainer__confirmationModal'>

                        <div className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal'>
                            <div onClick={()=>setShowConfirmationUpdatePricesModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                        </div>
                        
                        <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                            <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>
                                ¿Estás seguro que deseas actualizar los precios ({ percentage > 0 ? `+${percentage}` : `${percentage}` }%) 
                                <br />
                                de las siguientes categorías: ({categoriasSeleccionadasNames.join(', ')})?
                            </div>
                        </div>

                        <div className='confirmationDeleteModalContainer__confirmationModal__btnContainer'>
                            {loading ? (
                                <button
                                disabled
                                className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                                >
                                <Spinner/>
                                </button>
                            ) : (
                                <button
                                onClick={handleSubmitUpdatedPrices}
                                className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                                >
                                Si
                                </button>
                            )}
                            <button onClick={()=>setShowConfirmationUpdatePricesModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                        </div>

                    </div>
            
                </div>

            </>
            
        )

    }

    const ConfirmationRestoreOriginalPricesModal = () => {
        const [loading, setLoading] = useState(false);

        const categoriasSeleccionadasNames = getSelectedCategoryNames(categoriesTree, selectedCategories);

        const handleRestorePricesByCategory = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${SERVER_URL}api/products/restore-prices-category`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categories: selectedCategories })
                });

                const result = await response.json();

                if (response.ok) {
                    toast(`Restauración exitosa! Se actualizaron ${result.modifiedCount || 'los'} productos.`, {
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
                    setPercentage('');
                    setSelectedCategories([]);
                    fetchProducts(1, inputFilteredProducts, selectedField)
                    setLoading(false);
                    setShowConfirmationRestoreOriginalPricesModal(false);
                } else {
                    toast('Error al restaurar los precios.', {
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
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                toast('Error en la conexión al intentar restaurar precios.', {
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
                setLoading(false);
            }
        };

        return (
            
            <>

                <div className='confirmationDeleteModalContainer'>

                    <div className='confirmationDeleteModalContainer__confirmationModal'>

                        <div className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal'>
                            <div onClick={()=>setShowConfirmationRestoreOriginalPricesModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                        </div>
                        
                        <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                            <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas restaurar los precios anteriores <br /> de las siguientes categorías: ({categoriasSeleccionadasNames.join(', ')})?</div>
                        </div>

                        <div className='confirmationDeleteModalContainer__confirmationModal__btnContainer'>
                            {loading ? (
                                <button
                                disabled
                                className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                                >
                                <Spinner/>
                                </button>
                            ) : (
                                <button
                                onClick={handleRestorePricesByCategory}
                                className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                                >
                                Si
                                </button>
                            )}
                            <button onClick={()=>setShowConfirmationRestoreOriginalPricesModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                        </div>

                    </div>
            
                </div>

            </>
            
        )

    }

    const handleMassDelete = () => {
        setShowConfirmationDeleteAllProductsSelectedModal(true);
    };

    const handleSelectAll = (checked) => {
        setSelectAll(checked);

        if (checked) {
            const allIds = products.map(product => product._id);
            setSelectedProducts(allIds);
        } else {
            setSelectedProducts([]);
        }
    };

    useEffect(() => {
        setSelectAll(selectedProducts.length === products.length && products.length > 0);
    }, [selectedProducts, products]);

    const toggleSelectProduct = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id)
            ? prev.filter(pId => pId !== id)
            : [...prev, id]
        );
    };

    const renderCategories = (categories, level = 0) => {
        return categories.map((cat) => (
            <div key={cat._id} style={{ marginLeft: `${level * 20}px` }}>
            <label className='cPanelProductsContainer__formUpdatePrices__categories__labelInput'>
                <input
                type="checkbox"
                value={cat._id}
                checked={selectedCategories.includes(cat._id)}
                onChange={() => handleCheckboxChange(cat._id)}
                disabled={isParentSelected(cat._id)}
                />
                <div className='cPanelProductsContainer__formUpdatePrices__categories__labelInput__label'>
                {cat.name} ({cat.productCount})
                </div>
            </label>

            {/* Renderiza hijos si existen */}
            {cat.children && cat.children.length > 0 && renderCategories(cat.children, level + 1)}
            </div>
        ));
    };

    return (

        <>
            <NavbarMobile
            products={products}
            isScrollForced={isScrollForced}
            isLoading={isLoading}
            isLoadingAuth={isLoadingAuth}
            user={user}
            isLoggedIn={user?.isLoggedIn || false}
            role={user?.role || null}
            first_name={user?.first_name || ''}
            storeName={storeSettings?.storeName || ""}
            categories={categories}
            userCart={userCart}
            showLogOutContainer={showLogOutContainer}
            hexToRgba={hexToRgba}
            cartIcon={cartIcon}
            logo_store={storeSettings?.siteImages?.logoStore || ""}
            primaryColor={storeSettings?.primaryColor || ""}
            />

            <div className='navbarContainer'>
                <NavBar
                isScrollForced={isScrollForced}
                isLoading={isLoading}
                isLoadingAuth={isLoadingAuth}
                user={user}
                isLoggedIn={user?.isLoggedIn || false}
                role={user?.role || null}
                first_name={user?.first_name || ''}
                categories={categories}
                userCart={userCart}
                showLogOutContainer={showLogOutContainer}
                hexToRgba={hexToRgba}
                primaryColor={storeSettings?.primaryColor || ""}
                logo_store={storeSettings?.siteImages?.logoStore || ""}
                cartIcon={cartIcon}
                storeName={storeSettings?.storeName || ""}
                />
            </div>
            <div className='cPanelProductsContainer'>
                
                <div className='cPanelProductsContainer__title'>
                    <div className='cPanelProductsContainer__title__prop'>Productos</div>        
                </div>

                <div className='cPanelProductsContainer__formUpdatePrices'>
                    <div className='cPanelProductsContainer__formUpdatePrices__title'>Actualizaciones de precios</div>
                    <div className='cPanelProductsContainer__formUpdatePrices__subTitle'>Seleccioná las categorías:</div>
                        
                    <div className='cPanelProductsContainer__formUpdatePrices__categories'>
                        {isLoadingCategories ? (
                            <div className="cPanelProductsContainer__formUpdatePrices__categories__spinner">
                                <Spinner/>
                            </div>
                        ) : (
                            renderCategories(categoriesTree)
                        )}
                    </div>

                    <div className='cPanelProductsContainer__formUpdatePrices__inputPercentage'>
                        <div className='cPanelProductsContainer__formUpdatePrices__inputPercentage__label'>Porcentaje a aplicar (%)</div>
                        <input
                        className='cPanelProductsContainer__formUpdatePrices__inputPercentage__input'
                        type="number"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        required
                        placeholder='%'
                        />
                    </div>

                    <div className='cPanelProductsContainer__formUpdatePrices__btnSubmitContainer'>
                        <button className='cPanelProductsContainer__formUpdatePrices__btnSubmitContainer__btnSubmit' onClick={handleSubmitUpdatedPrices}>Actualizar precios</button>
                        <button
                            className='cPanelProductsContainer__formUpdatePrices__btnSubmitContainer__btnSubmit'
                            type="button"
                            onClick={handleRestorePricesByCategory}
                            >
                            Restaurar precios originales
                        </button>
                    </div>
                </div>

                <div className='cPanelProductsContainer__inputSearchProduct'>
                    <div className='cPanelProductsContainer__inputSearchProduct__selectContainer'>
                        <div>Buscar por:</div>
                        <select
                            className='cPanelProductsContainer__inputSearchProduct__selectContainer__select'
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                            >
                            {Object.entries(fieldLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className='cPanelProductsContainer__inputSearchProduct__inputContainer'>
                        <input type="text" onChange={handleInputFilteredProducts} value={inputFilteredProducts} placeholder={`Buscar por ${fieldLabels[selectedField]}`} className='cPanelProductsContainer__inputSearchProduct__inputContainer__input' name="" id="" />
                    </div>
                </div>

                <div className='cPanelProductsContainer__btnCreateProduct'>
                    <button onClick={()=>setShowCreateProductModal(true)} className='cPanelProductsContainer__btnCreateProduct__btn'>Crear producto</button>
                </div>

                <div className='cPanelProductsContainer__quantityProducts'>
                    <div className='cPanelProductsContainer__quantityProducts__massDeleteBtnContainer'>
                        <div className='cPanelProductsContainer__quantityProducts__massDeleteBtnContainer__checkboxContainer'>
                            <input
                            className='cPanelProductsContainer__quantityProducts__massDeleteBtnContainer__checkboxContainer__checkbox'
                            type="checkbox"
                            checked={selectAll}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                            <span className='cPanelProductsContainer__quantityProducts__massDeleteBtnContainer__checkboxContainer__span'>Seleccionar todos</span>
                        </div>
                        {selectedProducts.length > 0 ? (
                        <div className='cPanelProductsContainer__quantityProducts__massDeleteBtnContainer__btn'>
                            <button
                            onClick={handleMassDelete}
                            className='cPanelProductsContainer__quantityProducts__massDeleteBtnContainer__btn__prop'
                            >
                            Eliminar seleccionados ({selectedProducts.length})
                            </button>
                        </div>
                        )
                        :
                        <><div></div></>
                        }
                    </div>
                    <div className='cPanelProductsContainer__quantityProducts__prop'>Cantidad de productos: {totalProducts}</div>        
                </div>

                {
                    products.length != 0 &&
                    <div ref={productsListRef} className='cPanelProductsContainer__headerTableContainer'>

                        <div className="cPanelProductsContainer__headerTableContainer__headerTable">

                            <div className="cPanelProductsContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}></div>
                            <div className="cPanelProductsContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Imagen</div>
                            <div className="cPanelProductsContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Título</div>
                            <div className="cPanelProductsContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Descripción</div>
                            <div className="cPanelProductsContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Precio</div>
                            <div className="cPanelProductsContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Stock</div>
                            <div className="cPanelProductsContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Categoría</div>

                        </div>

                        <div className="cPanelProductsContainer__headerTableContainer__headerTableMobile">

                            <div className="cPanelProductsContainer__headerTableContainer__headerTableMobile__item" style={{borderRight:'0.3vh solid black'}}></div>
                            <div className="cPanelProductsContainer__headerTableContainer__headerTableMobile__item" style={{borderRight:'0.3vh solid black'}}>Imagen</div>
                            <div className="cPanelProductsContainer__headerTableContainer__headerTableMobile__item" style={{borderRight:'0.3vh solid black'}}>Título</div>
                            <div className="cPanelProductsContainer__headerTableContainer__headerTableMobile__item" style={{borderRight:'0.3vh solid black'}}>Stock</div>
                            {/* <div className="cPanelProductsContainer__headerTableContainer__headerTableMobile__item" style={{borderRight:'0.3vh solid black'}}>Categoría</div> */}

                        </div>

                    </div>
                }


                <div className="cPanelProductsContainer__productsTable">

                    {
                        isLoadingProducts ? 
                            <>
                                <div className="catalogContainer__grid__catalog__isLoadingLabel">
                                    Cargando productos&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        :
                        products.map((product) => (
                            <>
                                <ItemCPanelProduct
                                product={product}
                                fetchProducts={fetchProducts}
                                inputFilteredProducts={inputFilteredProducts}
                                selectedField={selectedField}
                                categories={categoriesTree}
                                selectedProducts={selectedProducts}
                                setSelectedProducts={setSelectedProducts}
                                toggleSelectProduct={toggleSelectProduct}
                                />
                            </>
                        ))
                    }
                    <div className='cPanelProductsContainer__btnsPagesContainer'>
                        <button className='cPanelProductsContainer__btnsPagesContainer__btn'
                            disabled={!pageInfo.hasPrevPage}
                            onClick={() => fetchProducts(pageInfo.prevPage, inputFilteredProducts, selectedField)}
                            >
                            Anterior
                        </button>
                        
                        <span>Página {pageInfo.page} de {pageInfo.totalPages}</span>

                        <button className='cPanelProductsContainer__btnsPagesContainer__btn'
                            disabled={!pageInfo.hasNextPage}
                            onClick={() => fetchProducts(pageInfo.nextPage, inputFilteredProducts, selectedField)}
                            >
                            Siguiente
                        </button>
                    </div>

                </div>

            </div>  
            
            {
                showCreateProductModal &&
                <CreateProductModal
                categories={categoriesTree}
                fetchProducts={fetchProducts}
                setShowCreateProductModal={setShowCreateProductModal}/>      
            }
            {
                showConfirmationDeleteAllProductsSelectedModal &&
                <ConfirmationDeleteAllProductsSelected/>
            }
            {
                showConfirmationUpdatePricesModal &&
                <ConfirmationUpdatePricesModal/>
            }
            {
                showConfirmationRestoreOriginalPricesModal &&
                <ConfirmationRestoreOriginalPricesModal/>
            }
        
        </>

    )

}

export default CPanelProducts