import { useEffect,useState,useContext } from "react";
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom'
import ItemBinProduct from "./ItemBinProduct";
import Spinner from "./Spinner";
import { toast } from "react-toastify";
import ItemBinTicket from "./ItemBinTicket";

const Bin = () => {
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [selectAllTickets, setSelectAllTickets] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [user, setUser] = useState('');
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

    const fetchDeletedProducts = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/products/deleted');
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

    const fetchDeletedTickets = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/tickets/deleted');
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

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/sessions/current', {
                method: 'GET',
                credentials: 'include', // MUY IMPORTANTE para enviar cookies
            });
            const data = await response.json();
            if(data.error === 'jwt must be provided') { 
                setIsLoading(false)
                navigate('/')
            } else {
                const user = data.data
                if(user) {
                    setUser(user)
                    fetchCartByUserId(user._id);
                }
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error:', error);
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
        if(user.isLoggedIn) {
            setShowLogOutContainer(true)
        }
    }, [user.isLoggedIn]);

    useEffect(() => {
        fetchCategories();
        fetchCurrentUser();
        fetchDeletedProducts();
        fetchDeletedTickets();
        fetchStoreSettings();
    }, []);

    const handleMassDeleteTickets = async () => {
        const confirm = window.confirm('¿Estás seguro que querés eliminar los tickets seleccionados permanentemente?');
        if (!confirm) return;

        try {
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
        }
    };

    const handleMassRestoreTickets = async () => {
        const confirm = window.confirm('¿Estás seguro que querés restaurar los tickets seleccionados?');
        if (!confirm) return;

        try {
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
        }
    };

    const handleMassDelete = async () => {
        const confirm = window.confirm('¿Estás seguro que querés eliminar los productos seleccionados?');
        if (!confirm) return;

        try {
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
        }
    };

    const handleMassRestore = async () => {
        const confirm = window.confirm('¿Estás seguro que querés restaurar los productos seleccionados?');
        if (!confirm) return;

        try {
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
        }
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
                isLoggedIn={user.isLoggedIn}
                role={user.role}
                first_name={user.first_name}
                categories={categories}
                userCart={userCart}
                showLogOutContainer={showLogOutContainer}
                hexToRgba={hexToRgba}
                cartIcon={cartIcon}
                logo_store={storeSettings?.siteImages?.logoStore || ""}
                primaryColor={storeSettings?.primaryColor || ""}
                />
            </div>

            <div className="binContainer">

                <div className="binContainer__title">
                    <div className="binContainer__title__prop">Papelera</div>
                </div>

                <div className="binContainer__subTitle">
                    <div className="binContainer__subTitle__prop">Productos eliminados:</div>
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

                <div className="binContainer__subTitle">
                    <div className="binContainer__subTitle__prop">Tickets eliminados:</div>
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

        </>

    )
    
}

export default Bin