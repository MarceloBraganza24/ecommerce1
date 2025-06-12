import {useState,useContext,useEffect} from 'react'
import { Link,useNavigate } from 'react-router-dom'
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const Shipping = () => {
    const [loadingCheckOut, setLoadingCheckOut] = useState(false);
    const [showLabelAddCoupon, setShowLabelAddCoupon] = useState(true);
    const [showInputCouponContainer, setShowInputCouponContainer] = useState(false);
    const [isLoadingValidateCoupon, setIsLoadingValidateCoupon] = useState(false);
    const [showLabelValidatedCoupon, setShowLabelValidatedCoupon] = useState(false);
    const [inputCoupon, setInputCoupon] = useState('');
    const [validatedCoupon, setValidatedCoupon] = useState({});
    const [metodoEntrega, setMetodoEntrega] = useState("domicilio");
    const [userCart, setUserCart] = useState({});
    const [user, setUser] = useState('');
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [isLoadingSellerAddresses, setIsLoadingSellerAddresses] = useState(true);
    const [isLoadingGeneralData, setIsLoadingGeneralData] = useState(true);
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const [deliveryForms, setDeliveryForms] = useState([]);
    const [isLoadingDeliveryForm, setIsLoadingDeliveryForm] = useState(true);
    const [selectedSellerAddress, setSelectedSellerAddress] = useState("");
    const [sellerAddressData, setSellerAddressData] = useState({
        street: "",
        street_number: "",
        locality: "",
        province: "",
        postal_code: ""
    });
    const [selectedSellerAddressData, setSelectedSellerAddressData] = useState({
        street: "",
        street_number: "",
        locality: "",
        province: "",
        postal_code: ""
    });
    
    useEffect(() => {
        
        if(sellerAddresses.length == 1) {
            setSellerAddressData({
                street: sellerAddresses[0].street,
                street_number: sellerAddresses[0].street_number,
                locality: sellerAddresses[0].locality,
                province: sellerAddresses[0].province,
                postal_code: sellerAddresses[0].postal_code
            })
        }
        
        const [calleCompleta, locality, province,postal_code] = selectedSellerAddress.split(',').map(e => e.trim());
        const callePartes = calleCompleta.split(' ');
        
        setSelectedSellerAddressData({
            street: callePartes.join(' '),
            street_number: callePartes.pop(),
            locality: locality,
            province: province,
            postal_code,
        })

    }, [selectedSellerAddress,sellerAddresses]);

    const [formShippingAddressData, setFormShippingAddressData] = useState({
        street: "",
        street_number: "",
        locality: "",
        province: "",
        postal_code: ""
    });
    const navigate = useNavigate();

    const [total, setTotal] = useState('');
    const [totalQuantity, setTotalQuantity] = useState('');
    const [totalWithDiscount, setTotalWithDiscount] = useState('');

    const handleCheckout = async () => {
        setLoadingCheckOut(true)
        try {
            const response = await fetch(`http://localhost:8081/api/payments/create-preference-purchase`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: userCart.products, // tu array de productos
                    user: user,
                    discount: validatedCoupon.discount,
                    shippingAddress: metodoEntrega == 'domicilio' ? formShippingAddressData : (sellerAddresses.length == 1 ? sellerAddressData : selectedSellerAddressData),
                    deliveryMethod: metodoEntrega,
                    user_cart_id: userCart._id
                })
            });
        
            const data = await response.json();
            if (data.init_point) {
                window.location.href = data.init_point; // Redirige al Checkout Pro
            } else {
                toast('Ha ocurrido un error al intentar hacer el pago, intente nuevamente', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }); 
            }
        } catch (error) {
          console.error("Error en checkout:", error);
        }
    };
    
    useEffect(() => {
        
        if(userCart.products && Array.isArray(userCart.products) && validatedCoupon) {
            const total = Array.isArray(userCart.products)?userCart.products.reduce((acumulador, producto) => acumulador + (producto.product.price * producto.quantity), 0): 0;
            setTotal(total)
            const totalQuantity = Array.isArray(userCart.products)?userCart.products.reduce((sum, producto) => sum + producto.quantity, 0):0;
            setTotalQuantity(totalQuantity)
            const discountPercentage = validatedCoupon.discount;
            const totalWithDiscount = total - (total * (discountPercentage / 100));
            setTotalWithDiscount(totalWithDiscount)
        }

    }, [userCart,validatedCoupon]);

    const corregirCapitalizacion = (texto) => {
        if (!texto) return '';
    
        const excepciones = ['de', 'del', 'la', 'el', 'y', 'en', 'a', 'los', 'las', 'por', 'con', 'para', 'al', 'un', 'una'];
    
        return texto
            .toLocaleLowerCase('es-AR')
            .split(' ')
            .map((palabra, index) => {
                if (excepciones.includes(palabra) && index !== 0) {
                    return palabra;
                }
                return palabra.charAt(0).toUpperCase() + palabra.slice(1);
            })
            .join(' ');
    };

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
                setUserCart([]); // Si hay un error, aseguramos que el carrito esté vacío
                return [];
            }
    
            if (!data.data || !Array.isArray(data.data.products)) {
                console.warn("Carrito vacío o no válido, asignando array vacío.");
                setUserCart([]); // Si el carrito no tiene productos, lo dejamos vacío
                return [];
            }
    
            setUserCart(data.data); // ✅ Asignamos los productos al estado del carrito
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
            setUserCart([]); // Si hay un error en la petición, dejamos el carrito vacío
            return [];
        }
    };

    const fetchDeliveryForm = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/deliveryForm');
            const deliveryForm = await response.json();
            if (response.ok) {
                setDeliveryForms(deliveryForm.data)
            } else {
                toast('Error al cargar el formulario de entrega', {
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
            setIsLoadingDeliveryForm(false)
        }
    };

    const fetchSellerAddresses = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/sellerAddresses');
            const data = await response.json();
            if (response.ok) {
                setSellerAddresses(data.data); 
            } else {
                toast('Error al cargar domicilios', {
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
            setIsLoadingSellerAddresses(false)
        }
    };

    useEffect(() => {
        if( userCart && sellerAddresses && total && totalQuantity) {
            setIsLoadingGeneralData(false)
        }
        const matchedAddress = deliveryForms?.find(item => 
            item.street === user.selected_addresses?.street &&
            item.street_number === user.selected_addresses?.street_number &&
            item.locality === user.selected_addresses?.locality
        );

        if (matchedAddress) {
            setFormShippingAddressData({
                street: user.selected_addresses.street || "",
                street_number: user.selected_addresses.street_number || "",
                locality: user.selected_addresses.locality || "",
                province: user.selected_addresses.province || "",
                postal_code: user.selected_addresses.postal_code || ""
            });
        } else {
            setFormShippingAddressData({
                street: "",
                street_number: "",
                locality: "",
                province: "",
                postal_code: ""
            });
        }

    }, [user,userCart,sellerAddresses,total,totalQuantity]);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/sessions/current', {
                method: 'GET',
                credentials: 'include', // MUY IMPORTANTE para enviar cookies
            });
            const data = await response.json();
            if(data.error === 'jwt must be provided') { 
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
        fetchCurrentUser()
        fetchDeliveryForm();
        fetchStoreSettings();
        fetchSellerAddresses();
    }, []);

    const handleSelectSellerAddressChange = (event) => {
        setSelectedSellerAddress(event.target.value);
    };

    const handleInputCoupon = (e) => {
        setInputCoupon(e.target.value)
    }

    const handleBtnChangeCoupon = () => {
        setShowInputCouponContainer(true)
        setShowLabelAddCoupon(true)
        setShowLabelValidatedCoupon(false)
    }

    const handleBtnAddCoupon = () => {
        if(showInputCouponContainer) {
            setShowInputCouponContainer(false)
        } else {
            setShowInputCouponContainer(true)
        }
    }

    const handleBtnValidateCoupon = async () => {
        if(!inputCoupon) {
            toast('Debes ingresar el código del cupón', {
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
        try {
            setIsLoadingValidateCoupon(true)
            const response = await fetch("http://localhost:8081/api/coupons/validate-coupon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codeCoupon: inputCoupon }),
            });
            const data = await response.json();
            if (response.ok) {
                toast('Cupón válido', {
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
                setValidatedCoupon(data.data)
                setShowLabelAddCoupon(false)
                setShowInputCouponContainer(false)
                setShowLabelValidatedCoupon(true)
            } else if(data.error === 'coupon has expired') {
                toast('El cupón ya expiró!', {
                    position: "top-right",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
            } else {
                toast('Cupón inválido', {
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
            toast('Error al validar el cupón', {
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
            setIsLoadingValidateCoupon(false)
        }
    }

    const handleBtnContinuePurchase = async () => {
        if(metodoEntrega == 'domicilio' && formShippingAddressData.street == '') {
            toast('Debes añadir o seleccionar un domicilio de entrega!', {
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
        if(metodoEntrega == 'vendedor' && sellerAddresses.length == 0) {
            toast('No es posible retirar en el domicilio del vendedor, seleccione enviar a domicilio!', {
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
        if(metodoEntrega == 'vendedor' && (sellerAddressData.street == '') && (selectedSellerAddress == 'Selecciona una opción' || selectedSellerAddress == '')) {
            toast('Debes seleccionar un domicilio del vendedor!', {
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
        handleCheckout()
    }

    return (

        <>

            <div className='headerPurchase'>

                <Link to={"/"} className='headerPurchase__logo'>
                    {storeSettings?.siteImages?.logoStore && 
                        <img
                        className='headerPurchase__logo__prop'
                        src={`http://localhost:8081/${storeSettings?.siteImages?.logoStore}`}
                        alt="logo_tienda"
                        />
                    }
                </Link>
                
            </div>

            <div className="shippingContainer">

                {
                    isLoadingGeneralData ?
                        <div className="shippingContainer__spinner">
                            <Spinner/>
                        </div>
                    :

                    <>

                <div className="shippingContainer__deliveryMethodContainer">

                    <div className="shippingContainer__deliveryMethodContainer__title">
                        <div className="shippingContainer__deliveryMethodContainer__title__prop">Elegí la forma de entrega</div>
                    </div>

                    <div onClick={() => setMetodoEntrega("domicilio")} className="shippingContainer__deliveryMethodContainer__deliveryMethod">

                        <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__grid">

                            <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__grid__radio">
                                <input type="radio" name="metodoEntrega" value='domicilio' checked={metodoEntrega === "domicilio"} onChange={(e) => setMetodoEntrega(e.target.value)} />
                            </div>

                            <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__grid__option">Enviar a domicilio</div>

                            <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__grid__state"></div>

                        </div>

                        <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__addressContainer">
                            {
                                isLoadingDeliveryForm ?
                                <div className='shippingContainer__deliveryMethodContainer__deliveryMethod__addressContainer__address'>
                                    <Spinner/>
                                </div>
                                : formShippingAddressData.street == '' ?
                                <div className='shippingContainer__deliveryMethodContainer__deliveryMethod__addressContainer__address'>Aún no hay un domicilio seleccionado</div>
                                :
                                <>
                                <div className='shippingContainer__deliveryMethodContainer__deliveryMethod__addressContainer__address'>{corregirCapitalizacion(formShippingAddressData.street)} {corregirCapitalizacion(formShippingAddressData.street_number)}, {corregirCapitalizacion(formShippingAddressData.locality)}</div>
                                </>
                            }
                        </div>

                        <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__editAddressContainer">
                            <Link to={"/deliveryForm"} className='shippingContainer__deliveryMethodContainer__deliveryMethod__editAddressContainer__btn'>
                                Editar o elegir otro domicilio
                            </Link>
                        </div>

                    </div>

                    <div onClick={() => setMetodoEntrega("vendedor")} className="shippingContainer__deliveryMethodContainer__deliveryMethod">

                        <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__grid">

                            <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__grid__radio">
                                <input type="radio" name="metodoEntrega" value='vendedor' checked={metodoEntrega === "vendedor"} onChange={(e) => setMetodoEntrega(e.target.value)} />
                            </div>

                            <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__grid__option">Retirar en el domicilio del vendedor</div>

                            <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__grid__state">Gratis</div>

                        </div>

                        <div className="shippingContainer__deliveryMethodContainer__deliveryMethod__addressContainer">
                            {
                                <select className='shippingContainer__deliveryMethodContainer__deliveryMethod__addressContainer__select' id="addressSelect" value={selectedSellerAddress} onChange={handleSelectSellerAddressChange}>
                                    {
                                        sellerAddresses.length > 1 ?
                                            <>
                                                <option value="">Selecciona una opción</option>
                                                {sellerAddresses.map((address, index) => (
                                                    <option key={index} value={`${address.street} ${address.street_number}, ${address.locality}, ${address.province}, ${address.postal_code}`}>
                                                        {address.street} {address.street_number}, {address.locality}, {address.province}
                                                    </option>
                                                ))}
                                            </>
                                        : sellerAddresses.length == 1 ?
                                            <>
                                                {sellerAddresses.map((address, index) => (
                                                    <option key={index} value={`${address.street} ${address.street_number}, ${address.locality}, ${address.province}, ${address.postal_code}`}>
                                                        {address.street} {address.street_number}, {address.locality}, {address.province}
                                                    </option>
                                                ))}
                                            </>
                                        : 
                                        <>
                                            <option>
                                                Aún no existe ningun domicilio del vendedor!
                                            </option>
                                        </>
                                    }
                                </select>
                            }
                        </div>

                    </div>

                    <div className='shippingContainer__deliveryMethodContainer__btnContinue'>
                        {
                            loadingCheckOut ?
                                <button 
                                    disabled={loadingCheckOut}
                                    className='shippingContainer__deliveryMethodContainer__btnContinue__propRedirectBtn'
                                >
                                Redirigiendo a Mercado Pago&nbsp;&nbsp;<Spinner/>
                                </button>
                            :
                                <button 
                                    onClick={handleBtnContinuePurchase}
                                    disabled={loadingCheckOut}
                                    className='shippingContainer__deliveryMethodContainer__btnContinue__prop'
                                >
                                Ir a pagar
                                </button>
                        }

                    </div>

                </div>

                <div className="shippingContainer__accountSummaryContainer">

                    <div className="shippingContainer__accountSummaryContainer__accountSummary">

                        <div className="shippingContainer__accountSummaryContainer__accountSummary__title">

                            <div className="shippingContainer__accountSummaryContainer__accountSummary__title__prop">Resumen de compra</div>

                        </div>

                        <div className="shippingContainer__accountSummaryContainer__accountSummary__item">

                            {
                                totalQuantity == 1 ?
                                <>
                                    <Link to={"/cart"} className='shippingContainer__accountSummaryContainer__accountSummary__item__label'>
                                        Producto
                                    </Link>
                                    <div className="shippingContainer__accountSummaryContainer__accountSummary__item__value">$ {total}</div>
                                </>
                                :
                                <>
                                    <Link to={"/cart"} className='shippingContainer__accountSummaryContainer__accountSummary__item__label'>
                                        Productos ({totalQuantity})
                                    </Link>
                                    <div className="shippingContainer__accountSummaryContainer__accountSummary__item__value">$ {total}</div>
                                </>
                            }

                        </div>

                        {
                            showLabelAddCoupon &&
                            <div className='shippingContainer__accountSummaryContainer__accountSummary__itemCoupon'>
                                <div onClick={handleBtnAddCoupon} className='shippingContainer__accountSummaryContainer__accountSummary__itemCoupon__labelCoupon'>Ingresar código de cupón</div>
                            </div>
                        }

                        {
                            showInputCouponContainer &&
                            <div className='shippingContainer__accountSummaryContainer__accountSummary__inputCouponContainer'>
                                <input placeholder='Código cupón' value={inputCoupon} onChange={handleInputCoupon} className='shippingContainer__accountSummaryContainer__accountSummary__inputCouponContainer__input' type="text" />
                                
                                <button onClick={handleBtnValidateCoupon} className='shippingContainer__accountSummaryContainer__accountSummary__inputCouponContainer__btn'>
                                    {isLoadingValidateCoupon ? (
                                        <>
                                            <Spinner />
                                        </>
                                    ) : (
                                        'Validar'
                                    )}
                                </button>
                            </div>
                        }

                        {
                            showLabelValidatedCoupon &&
                            <>
                            <div className='shippingContainer__accountSummaryContainer__accountSummary__itemCoupon'>
                                <div className='shippingContainer__accountSummaryContainer__accountSummary__itemCoupon__labelCoupon'>Cupón válido con {validatedCoupon.discount}% de descuento</div>
                            </div>
                            <div className='shippingContainer__accountSummaryContainer__accountSummary__itemCoupon'>
                                <div onClick={handleBtnChangeCoupon} className='shippingContainer__accountSummaryContainer__accountSummary__itemCoupon__labelCoupon'>Cambiar cupón</div>
                            </div>
                            </>
                        }

                        {
                            showLabelValidatedCoupon ?
                            <>
                                <div className='shippingContainer__accountSummaryContainer__accountSummary__itemGrid'>

                                    <div className='shippingContainer__accountSummaryContainer__accountSummary__itemGrid__labelTotalBefore'></div>

                                    <div className='shippingContainer__accountSummaryContainer__accountSummary__itemGrid__valueTotal'><span style={{fontSize:'14px',alignSelf:'center'}}>antes</span> <span style={{textDecoration:'line-through'}}>$ {total}</span></div>

                                </div>
                                <div className='shippingContainer__accountSummaryContainer__accountSummary__itemGrid'>

                                    <div className='shippingContainer__accountSummaryContainer__accountSummary__itemGrid__labelTotal'>TOTAL <span style={{fontSize:'14px'}}>(con descuento)</span></div>

                                    <div className='shippingContainer__accountSummaryContainer__accountSummary__itemGrid__valueTotal'>$ {totalWithDiscount}</div>

                                </div>
                            </>
                            :
                            <>
                                <div className="shippingContainer__accountSummaryContainer__accountSummary__item">

                                    <div className="shippingContainer__accountSummaryContainer__accountSummary__item__label">Pagás</div>
                                    <div className="shippingContainer__accountSummaryContainer__accountSummary__item__value">$ {total}</div>

                                </div>
                            </>
                        }

                    </div>

                </div>
                </>

                }

            </div>

        </>

    )

}

export default Shipping