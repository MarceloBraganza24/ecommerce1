import { useEffect,useState,useContext } from "react";
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom'
import ItemBinProduct from "./ItemBinProduct";
import Spinner from "./Spinner";
import { toast } from "react-toastify";
import ItemBinTicket from "./ItemBinTicket";
import { useAuth } from '../context/AuthContext';

const Bin = () => {
    const [showConfirmationDeleteAllProductsSelectedModal, setShowConfirmationDeleteAllProductsSelectedModal] = useState(false);
    const [showConfirmationDeleteAllTicketsSelectedModal, setShowConfirmationDeleteAllTicketsSelectedModal] = useState(false);
    const [showConfirmationRestoreAllProductsSelectedModal, setShowConfirmationRestoreAllProductsSelectedModal] = useState(false);
    const [showConfirmationRestoreAllTicketsSelectedModal, setShowConfirmationRestoreAllTicketsSelectedModal] = useState(false);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [selectAllTickets, setSelectAllTickets] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useAuth();
    const [categories, setCategories] = useState([]);
    const [userCart, setUserCart] = useState({});
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);
    const [products, setProducts] = useState([]);
    const [tickets, setTickets] = useState([]);
    const navigate = useNavigate();
    const [productSearch, setProductSearch] = useState("");
    const [ticketSearch, setTicketSearch] = useState("");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDeletedProducts(productSearch);
        }, 400); // espera 400ms después de que deja de escribir
        return () => clearTimeout(timeoutId);
    }, [productSearch]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDeletedTickets(ticketSearch);
        }, 400); // espera 400ms después de que deja de escribir
        return () => clearTimeout(timeoutId);
    }, [ticketSearch]);

    function hexToRgba(hex, opacity) {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    function esColorClaro(hex) {
        if (!hex) return true;

        hex = hex.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return brightness > 128; // <-- usar el mismo umbral que en getContrastingTextColor
    }

    const fetchDeletedProducts = async (searchValue = "") => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/deleted?search=${encodeURIComponent(searchValue)}`);
            const data = await response.json();
            if (response.ok) {
                setProducts(data.payload);
            } else {
                toast('Error al cargar productos eliminados, intente nuevamente!', {
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
        } finally {
            setIsLoadingProducts(false)
        }
    };

    const fetchDeletedTickets = async (searchValue = "") => {
        try {
            const response = await fetch(`http://localhost:8081/api/tickets/deleted?search=${encodeURIComponent(searchValue)}`);
            const data = await response.json();
            if (response.ok) {
                setTickets(data.payload);
            } else {
                toast('Error al cargar tickets eliminados, intente nuevamente!', {
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
        } finally {
            setIsLoadingTickets(false)
        }
    };

    const fetchStoreSettings = async () => {
        try {
            setIsLoadingStoreSettings(true)
            const response = await fetch('http://localhost:8081/api/settings');
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
            const response = await fetch(`http://localhost:8081/api/carts/byUserId/${user_id}`);
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

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/categories');
            const data = await response.json();
            if (response.ok) {
                setCategories(data.data); 
            } else {
                toast('Error al cargar categorías', {
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
        }
    };

    useEffect(() => {
        if (storeSettings?.primaryColor) {
            const claro = esColorClaro(storeSettings.primaryColor);
            setCartIcon(claro ? '/src/assets/cart_black.png' : '/src/assets/cart_white.png');
        }
    }, [storeSettings]);

    useEffect(() => {
        if (user?.isLoggedIn) {
            fetchCartByUserId(user._id)
        }
    }, [user]);

    useEffect(() => {
        fetchCategories();
        fetchCurrentUser();
        fetchDeletedProducts();
        fetchDeletedTickets();
        fetchStoreSettings();
        window.scrollTo(0, 0);
    }, []);

    const handleMassDeleteTickets = async () => {
        if(selectedTickets.length == 0) {
            toast('Debes seleccionar alguna venta para eliminar permanentemente!', {
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
        setShowConfirmationDeleteAllTicketsSelectedModal(true);
    };

    const handleMassRestoreTickets = async () => {
        if(selectedTickets.length == 0) {
            toast('Debes seleccionar alguna venta para restaurar!', {
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
        setShowConfirmationRestoreAllTicketsSelectedModal(true);
    };

    const ConfirmationDeleteAllProductsSelected = () => {
        const [loading, setLoading] = useState(false);

        const handleMassDelete = async () => {

            try {
                setLoading(true);
                const res = await fetch('http://localhost:8081/api/products/mass-delete-permanent', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedProducts })
                });

                const data = await res.json();
                if (res.ok) {
                    setSelectedProducts([]);
                    fetchDeletedProducts()
                    toast('Productos eliminados de manera permanente con éxito', {
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
                            <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas eliminar permanentemente todos los productos({selectedProducts.length}) seleccionados?</div>
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

    const ConfirmationDeleteAllTicketsSelected = () => {
        const [loading, setLoading] = useState(false);

        const handleMassDeleteTickets = async () => {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:8081/api/tickets/mass-delete-permanent', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedTickets })
                });

                const data = await res.json();
                if (res.ok) {
                    setSelectedTickets([]);
                    fetchDeletedTickets()
                    toast('Tickets eliminados de manera permanente con éxito', {
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
                    setShowConfirmationDeleteAllTicketsSelectedModal(false);
                } 
            } catch (error) {
                console.error(error);
                toast('Error al eliminar tickets', {
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
                            <div onClick={()=>setShowConfirmationDeleteAllTicketsSelectedModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                        </div>
                        
                        <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                            <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas eliminar permanentemente todas las ventas({selectedTickets.length}) seleccionadas?</div>
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
                                onClick={handleMassDeleteTickets}
                                className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                                >
                                Si
                                </button>
                            )}
                            <button onClick={()=>setShowConfirmationDeleteAllTicketsSelectedModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                        </div>

                    </div>
            
                </div>

            </>
            
        )

    }

    const handleMassDelete = () => {
        if(selectedProducts.length == 0) {
            toast('Debes seleccionar algún producto para eliminar permanentemente!', {
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
        setShowConfirmationDeleteAllProductsSelectedModal(true);
    };

    const ConfirmationRestoreAllTicketsSelected = () => {
        const [loading, setLoading] = useState(false);

        const handleMassRestoreTickets = async () => {

            try {
                setLoading(true);
                const res = await fetch('http://localhost:8081/api/tickets/mass-restore', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedTickets })
                });

                const data = await res.json();
                if (res.ok) {
                    setSelectedTickets([]);
                    fetchDeletedTickets()
                    toast('Tickets restaurados correctamente', {
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
                    setLoading(true);
                    setShowConfirmationRestoreAllTicketsSelectedModal(false);
                } 
            } catch (error) {
                console.error(error);
                toast('Error al restaurar tickets', {
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
                setLoading(true);
            }
        };

        return (
            
            <>

                <div className='confirmationDeleteModalContainer'>

                    <div className='confirmationDeleteModalContainer__confirmationModal'>

                        <div className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal'>
                            <div onClick={()=>setShowConfirmationRestoreAllTicketsSelectedModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                        </div>
                        
                        <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                            <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas restaurar todas las ventas({selectedTickets.length}) seleccionadas?</div>
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
                                onClick={handleMassRestoreTickets}
                                className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                                >
                                Si
                                </button>
                            )}
                            <button onClick={()=>setShowConfirmationRestoreAllTicketsSelectedModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                        </div>

                    </div>
            
                </div>

            </>
            
        )

    }

    const ConfirmationRestoreAllProductsSelected = () => {
        const [loading, setLoading] = useState(false);

        const handleMassRestore = async () => {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:8081/api/products/mass-restore', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedProducts })
                });

                const data = await res.json();
                if (res.ok) {
                    setSelectedProducts([]);
                    fetchDeletedProducts()
                    toast('Productos restaurados correctamente', {
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
                    setShowConfirmationRestoreAllProductsSelectedModal(false);
                } 
            } catch (error) {
                console.error(error);
                toast('Error al restaurar productos', {
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
                            <div onClick={()=>setShowConfirmationRestoreAllProductsSelectedModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnCloseModal__btn'>X</div>
                        </div>
                        
                        <div className='confirmationDeleteModalContainer__confirmationModal__title'>
                            <div className='confirmationDeleteModalContainer__confirmationModal__title__prop'>¿Estás seguro que deseas restaurar todos los productos({selectedProducts.length}) seleccionados?</div>
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
                                onClick={handleMassRestore}
                                className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'
                                >
                                Si
                                </button>
                            )}
                            <button onClick={()=>setShowConfirmationRestoreAllProductsSelectedModal(false)} className='confirmationDeleteModalContainer__confirmationModal__btnContainer__btn'>No</button>
                        </div>

                    </div>
            
                </div>

            </>
            
        )

    }

    const handleMassRestore = async () => {
        if(selectedProducts.length == 0) {
            toast('Debes seleccionar algún producto para restaurar!', {
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
        setShowConfirmationRestoreAllProductsSelectedModal(true);
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

    const handleSelectAllTickets = (checked) => {
        setSelectAllTickets(checked);

        if (checked) {
            const allIds = tickets.map(ticket => ticket._id);
            setSelectedTickets(allIds);
        } else {
            setSelectedTickets([]);
        }
    };

    useEffect(() => {
        setSelectAllTickets(selectedTickets.length === tickets.length && tickets.length > 0);
    }, [selectedTickets, tickets]);

    const toggleSelectTicket = (id) => {
        setSelectedTickets(prev =>
            prev.includes(id)
            ? prev.filter(pId => pId !== id)
            : [...prev, id]
        );
    };

    return (

        <>
            <div className='navbarContainer'>
                <NavBar
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
                cartIcon={cartIcon}
                logo_store={storeSettings?.siteImages?.logoStore || ""}
                primaryColor={storeSettings?.primaryColor || ""}
                storeName={storeSettings?.storeName || ""}
                />
            </div>

            <div className="binContainer">

                <div className="binContainer__title">
                    <div className="binContainer__title__prop">Papelera</div>
                </div>

                <div className="binContainer__subTitle">
                    <div className="binContainer__subTitle__prop">Productos eliminados:</div>
                </div>

                <div className="binContainer__inputSearchDeletedProducts">
                    <input
                        className="binContainer__inputSearchDeletedProducts__input"
                        type="text"
                        placeholder="Buscar productos..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                    />
                </div>

                {
                    products.length > 0 &&
                    <>
                        <div className='binContainer__massDeleteBtnContainer'>
                            <button
                            onClick={handleMassDelete}
                            className='binContainer__massDeleteBtnContainer__btn'
                            >
                            Eliminar permamentemente ({selectedProducts.length})
                            </button>
                            <button
                            onClick={handleMassRestore}
                            className='binContainer__massDeleteBtnContainer__btn'
                            >
                            Restaurar ({selectedProducts.length})
                            </button>
                        </div>

                        <div className='binContainer__quantityProducts'>
                            <div className="binContainer__quantityProducts__massDeleteBtnContainer">
                                <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                                <span>Seleccionar todos</span>
                            </div>
                            <div className='binContainer__quantityProducts__prop'>Cantidad de productos: {products.length}</div>        
                        </div>
                    </>
                }

                {
                    products.length != 0 &&
                    <div className='binContainer__headerTableContainer'>

                        <div className="binContainer__headerTableContainer__headerTable">

                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}></div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Imagen</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Título</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Descripción</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Precio</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Stock</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Categoría</div>

                        </div>

                    </div>
                }

                <div className="binContainer__productsTable">

                    {
                        isLoadingProducts ? 
                            <>
                                <div className="catalogContainer__grid__catalog__isLoadingLabel">
                                    Cargando productos&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        : products.length > 0 ?
                            products.map((product) => (
                                <>
                                    <ItemBinProduct
                                    product={product}
                                    fetchDeletedProducts={fetchDeletedProducts}
                                    selectedProducts={selectedProducts}
                                    setSelectedProducts={setSelectedProducts}
                                    />
                                </>
                                
                            ))
                        :
                        <>
                            <div className="catalogContainer__grid__catalog__isLoadingLabel">
                                Aún no existen productos eliminados
                            </div>
                        </>
                    }

                </div>

                <div className="binContainer__separator">
                    <div className="binContainer__separator__prop"></div>
                </div>

                <div className="binContainer__subTitle">
                    <div className="binContainer__subTitle__prop">Tickets eliminados:</div>
                </div>

                <div className="binContainer__inputSearchDeletedProducts">
                    <input
                        className="binContainer__inputSearchDeletedProducts__input"
                        type="text"
                        placeholder="Buscar ventas..."
                        value={ticketSearch}
                        onChange={(e) => setTicketSearch(e.target.value)}
                    />
                </div>

                {
                    tickets.length > 0 &&
                    <>
                        <div className='binContainer__massDeleteBtnContainer'>
                            <button
                            onClick={handleMassDeleteTickets}
                            className='binContainer__massDeleteBtnContainer__btn'
                            >
                            Eliminar permamentemente ({selectedTickets.length})
                            </button>
                            <button
                            onClick={handleMassRestoreTickets}
                            className='binContainer__massDeleteBtnContainer__btn'
                            >
                            Restaurar ({selectedTickets.length})
                            </button>
                        </div>

                        <div className='binContainer__quantityProducts'>
                            <div className="binContainer__quantityProducts__massDeleteBtnContainer">
                                <input
                                type="checkbox"
                                checked={selectAllTickets}
                                onChange={(e) => handleSelectAllTickets(e.target.checked)}
                                />
                                <span>Seleccionar todos</span>
                            </div>
                            <div className='binContainer__quantityProducts__prop'>Cantidad de tickets: {tickets.length}</div>        
                        </div>
                    </>
                }

                {
                    tickets.length != 0 &&
                    <div className='binContainer__headerSalesTableContainer'>

                        <div className="binContainer__headerSalesTableContainer__headerTable">

                            <div className="binContainer__headerSalesTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}></div>
                            <div className="binContainer__headerSalesTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Fecha y hora</div>
                            <div className="binContainer__headerSalesTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Código</div>
                            <div className="binContainer__headerSalesTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Productos</div>
                            <div className="binContainer__headerSalesTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Precio</div>
                            <div className="binContainer__headerSalesTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Operador</div>
                            <div className="binContainer__headerSalesTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Rol</div>

                        </div>

                    </div>
                }

                <div className="binContainer__salesTable">

                    {
                        isLoadingTickets ? 
                            <>
                                <div className="cPanelSalesContainer__salesTable__isLoadingLabel">
                                    Cargando tickets&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        : tickets.length > 0 ?
                            tickets.map((ticket) => {
                                const currentDate = new Date(ticket.purchase_datetime);
                                const formattedDate = currentDate.toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                });

                                const formattedTime = currentDate.toLocaleTimeString('es-AR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                });
                                return(
                                <>
                                    <ItemBinTicket
                                    ticket={ticket}
                                    fetchDeletedTickets={fetchDeletedTickets}
                                    fechaHora={`${formattedDate} ${formattedTime}`}
                                    selectedTickets={selectedTickets}
                                    setSelectedTickets={setSelectedTickets}
                                    toggleSelectTicket={toggleSelectTicket}
                                    />
                                </>
                                )
                                
                            })

                        :
                        <>
                            <div className="catalogContainer__grid__catalog__isLoadingLabel">
                                Aún no existen tickets eliminados   
                            </div>
                        </>
                    }

                </div>

            </div>
            {
                showConfirmationDeleteAllProductsSelectedModal &&
                <ConfirmationDeleteAllProductsSelected/>
            }
            {
                showConfirmationDeleteAllTicketsSelectedModal &&
                <ConfirmationDeleteAllTicketsSelected/>
            }
            {
                showConfirmationRestoreAllProductsSelectedModal &&
                <ConfirmationRestoreAllProductsSelected/>
            }
            {
                showConfirmationRestoreAllTicketsSelectedModal &&
                <ConfirmationRestoreAllTicketsSelected/>
            }

        </>

    )
    
}

export default Bin