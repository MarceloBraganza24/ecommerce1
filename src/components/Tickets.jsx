import React, {useState,useEffect} from 'react'
import NavBar from './NavBar';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import ItemTicket from './ItemTicket';
import { useNavigate } from 'react-router-dom';
import CreateSaleModal from './CreateSaleModal';

const Tickets = () => {
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [createSaleModal, setCreateSaleModal] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState("");
    const [pageInfoProducts, setPageInfoProducts] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    });   
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [selectedField, setSelectedField] = useState('title');
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tickets, setTickets] = useState([]);
    const [totalTickets, setTotalTickets] = useState("");
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    });   

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState('');
    const [categories, setCategories] = useState([]);
    const [userCart, setUserCart] = useState({});
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);

    const [inputFilteredTickets, setInputFilteredTickets] = useState('');
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);

    const fieldLabels = {
        title: 'Título',
        code: 'Código',
        amount: 'Precio',
        payer_email: "Operador",
        user_role: "Rol",
        all: 'Todos'
    };

    useEffect(() => {
        setSelectAll(selectedProducts.length === products.length && products.length > 0);
    }, [selectedProducts, products]);

    useEffect(() => {
        if(user.isLoggedIn) {
            setShowLogOutContainer(true)
        }
    }, [user.isLoggedIn]);

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

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pageInfo.page]);

    const goToPreviousDay = () => {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setSelectedDate(prevDate);
    };
    
    const goToNextDay = () => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setSelectedDate(nextDate);
    };

    const formatDateToString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Enero = 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const filteredByDate = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.purchase_datetime);
        return (
            ticketDate.getFullYear() === selectedDate.getFullYear() &&
            ticketDate.getMonth() === selectedDate.getMonth() &&
            ticketDate.getDate() === selectedDate.getDate()
        );
    });

    const ticketsOrdenados = [...filteredByDate].sort((a, b) => new Date(b.purchase_datetime) - new Date(a.purchase_datetime));

    useEffect(() => {
        if (user?.email) {
            fetchTickets(1, "", "");
        }
    }, [user]);

    const fetchProducts = async (page = 1, search = "",field = "") => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/byPage?page=${page}&search=${search}&field=${field}`)
            const productsAll = await response.json();
            setTotalProducts(productsAll.data.totalDocs)
            setProducts(productsAll.data.docs)
            setPageInfoProducts({
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

    const fetchTickets = async (page = 1, search = "",field = "") => {
        try {
            const response = await fetch(`http://localhost:8081/api/tickets/byPage?page=${page}&search=${search}&field=${field}`)
            const ticketsAll = await response.json();
            if (response.ok) {
                setTotalTickets(ticketsAll.data.totalDocs)
                setTickets(ticketsAll.data.docs)
                setPageInfo({
                    page: ticketsAll.data.page,
                    totalPages: ticketsAll.data.totalPages,
                    hasNextPage: ticketsAll.data.hasNextPage,
                    hasPrevPage: ticketsAll.data.hasPrevPage,
                    nextPage: ticketsAll.data.nextPage,
                    prevPage: ticketsAll.data.prevPage
                });
            } else {
                toast('Error al cargar las ventas', {
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
        } finally {
            setIsLoadingTickets(false)
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

    useEffect(() => {
        fetchCurrentUser();
        fetchStoreSettings();
        fetchCategories();
        fetchProducts();
    }, []);

    const handleInputFilteredSales = (e) => {
        const value = e.target.value;
        setInputFilteredTickets(value)
    }

    function hexToRgba(hex, opacity) {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const fetchStoreSettings = async () => {
        try {
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

    const handleMassDelete = async () => {
        const confirm = window.confirm('¿Estás seguro que querés eliminar los tickets seleccionados?');
        if (!confirm) return;

        try {
            const res = await fetch('http://localhost:8081/api/tickets/mass-delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedTickets })
            });

            const data = await res.json();
            if (res.ok) {
                setSelectedTickets([]);
                fetchTickets(1,"", "")
                toast('Tickets eliminados correctamente', {
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

    const handleSelectAll = (checked) => {
        setSelectAll(checked);

        if (checked) {
            const allIds = filteredByDate.map(ticket => ticket._id);
            setSelectedTickets(allIds);
        } else {
            setSelectedTickets([]);
        }
    };

    useEffect(() => {
        setSelectAll(selectedTickets.length === tickets.length && tickets.length > 0);
    }, [selectedTickets, tickets]);

    const toggleSelectTicket = (id) => {
        setSelectedTickets(prev =>
            prev.includes(id)
            ? prev.filter(pId => pId !== id)
            : [...prev, id]
        );
    };

    const handleBtnCreateSale = () => {
        setCreateSaleModal(true)
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchTickets(1, inputFilteredTickets, selectedField);
        }, 300); // debounce

        return () => clearTimeout(delay);
    }, [inputFilteredTickets, selectedField]);

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
                logo_store={storeSettings?.siteImages?.logoStore || ""}
                primaryColor={storeSettings?.primaryColor || ""}
                cartIcon={cartIcon}
                />
            </div>

            <div className='cPanelSalesContainer'>
                
                <div className='cPanelSalesContainer__title'>
                    <div className='cPanelSalesContainer__title__prop'>Ventas</div>        
                </div>

                <div className='cPanelSalesContainer__inputSearchSale'>
                    <div className='cPanelSalesContainer__inputSearchSale__selectContainer'>
                        <div>Buscar por:</div>
                        <select
                            className='cPanelSalesContainer__inputSearchSale__selectContainer__select'
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                            >
                            {Object.entries(fieldLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="cPanelSalesContainer__inputSearchSale__inputContainer">
                        <input type="text" onChange={handleInputFilteredSales} value={inputFilteredTickets} placeholder={`Buscar por ${fieldLabels[selectedField]}`} className='cPanelSalesContainer__inputSearchSale__inputContainer__input' name="" id="" />
                    </div>
                </div>

                <div className='cPanelSalesContainer__btnCreateSale'>
                    <button className='cPanelSalesContainer__btnCreateSale__btn' onClick={handleBtnCreateSale}>Crear venta</button>
                </div>

                {
                    ticketsOrdenados.length != 0 ?
                    <div className='cPanelSalesContainer__quantitySales'>
                        <div className='cPanelSalesContainer__quantitySales__prop'>Cantidad de ventas: {ticketsOrdenados.length}</div>        
                    </div>
                    :
                    <div className='cPanelSalesContainer__quantitySales'>
                        <div className='cPanelSalesContainer__quantitySales__prop'>&nbsp;</div>        
                    </div>
                }

                {
                    !isLoadingTickets &&
                    <div className="cPanelSalesContainer__dateFilter">
                        <button className='cPanelSalesContainer__dateFilter__btn' onClick={goToPreviousDay}>Anterior</button>
                        <span className='cPanelSalesContainer__dateFilter__date'>{formatDateToString(selectedDate)}</span>
                        <button className='cPanelSalesContainer__dateFilter__btn' onClick={goToNextDay}>Siguiente</button>
                    </div>
                }

                {
                    ticketsOrdenados.length != 0 &&
                    <div className='cPanelSalesContainer__btnDeleteSelected'>
                        <div className='cPanelSalesContainer__btnDeleteSelected__btnContainer'>
                            <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                            <span className='cPanelSalesContainer__btnDeleteSelected__btnContainer__span'>Seleccionar todos</span>
                            {selectedTickets.length > 0 ? (
                            <button
                            onClick={handleMassDelete}
                            className='cPanelSalesContainer__btnDeleteSelected__btnContainer__btn'
                            >
                            Eliminar seleccionados ({selectedTickets.length})
                            </button>
                            )
                            :
                            <><div></div></>
                            }
                        </div>
                    </div>
                }

                {
                    ticketsOrdenados.length != 0 &&
                    <div className='cPanelSalesContainer__headerTableCPanelSalesContainer'>

                        <div className="cPanelSalesContainer__headerTableCPanelSalesContainer__headerTable">

                            <div className="cPanelSalesContainer__headerTableCPanelSalesContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}></div>
                            <div className="cPanelSalesContainer__headerTableCPanelSalesContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Fecha y hora</div>
                            <div className="cPanelSalesContainer__headerTableCPanelSalesContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Código</div>
                            <div className="cPanelSalesContainer__headerTableCPanelSalesContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Productos</div>
                            <div className="cPanelSalesContainer__headerTableCPanelSalesContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Precio</div>
                            <div className="cPanelSalesContainer__headerTableCPanelSalesContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Operador</div>
                            <div className="cPanelSalesContainer__headerTableCPanelSalesContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Rol</div>

                        </div>

                    </div>
                }


                <div className="cPanelSalesContainer__salesTable">

                    {
                        isLoadingTickets ? 
                            <>
                                <div className="cPanelSalesContainer__salesTable__isLoadingLabel">
                                    Cargando ventas&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        : ticketsOrdenados.length != 0 ?

                            <>
                                {
                                    ticketsOrdenados.map((ticket) => {
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

                                        return (
                                            <ItemTicket
                                                ticket={ticket}
                                                fechaHora={`${formattedDate} ${formattedTime}`}
                                                fetchTickets={fetchTickets}
                                                email={user.email}
                                                role={user.role}
                                                selectedTickets={selectedTickets}
                                                setSelectedTickets={setSelectedTickets}
                                                toggleSelectTicket={toggleSelectTicket}
                                            />
                                        );
                                        
                                    })
                                }
                                <div className='cPanelSalesContainer__btnsPagesContainer'>
                                    <button className='cPanelSalesContainer__btnsPagesContainer__btn'
                                        disabled={!pageInfo.hasPrevPage}
                                        onClick={() => fetchTickets(pageInfo.prevPage, "", user.email)}
                                        >
                                        Anterior
                                    </button>
                                    
                                    <span>Página {pageInfo.page} de {pageInfo.totalPages}</span>

                                    <button className='cPanelSalesContainer__btnsPagesContainer__btn'
                                        disabled={!pageInfo.hasNextPage}
                                        onClick={() => fetchTickets(pageInfo.nextPage, "", user.email)}
                                        >
                                        Siguiente
                                    </button>
                                </div>
                            </>
                            
                        :
                            <div className="cPanelSalesContainer__salesTable__isLoadingLabel">
                                Aún no existen ventas
                            </div>

                    }

                </div>

            </div>  

            {
                createSaleModal &&
                <CreateSaleModal
                setCreateSaleModal={setCreateSaleModal}
                products={products}
                user={user}
                fetchProducts={fetchProducts}
                fetchTickets={fetchTickets}
                isLoadingProducts={isLoadingProducts}
                totalProducts={totalProducts}
                pageInfoProducts={pageInfoProducts}
                />
                
            }

        </>

    )

}

export default Tickets