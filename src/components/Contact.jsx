import {useEffect,useState,useContext} from 'react'
import NavBar from './NavBar'
import Footer from './Footer'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const Contact = () => {
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [user, setUser] = useState('');
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userCart, setUserCart] = useState({});
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const [isLoadingSellerAddresses, setIsLoadingSellerAddresses] = useState(true);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        message: ''
    });
    
    const [selectedAddress, setSelectedAddress] = useState(null);

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
        if (sellerAddresses.length > 0 && !selectedAddress) {
            setSelectedAddress(sellerAddresses[0]);
        }
    }, [sellerAddresses]);
    
    const buildFullAddress = (address) => {
        if (!address) return '';
        const { street, street_number, locality, province } = address;
        return `${street} ${street_number}, ${locality}, ${province}`;
    };

    const generateMapUrl = (address) => {
        if (!address) return '';
        const fullAddress = buildFullAddress(address);
        const encodedAddress = encodeURIComponent(fullAddress);
        return `https://www.google.com/maps/embed/v1/place?key=AIzaSyCypLLA0vWKs_lvw5zxCuGJC28iEm9Rqk8&q=${encodedAddress}`;
    };


    useEffect(() => {
        if(user.isLoggedIn) {
            setShowLogOutContainer(true)
        }
    }, [user.isLoggedIn]);

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
    
    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/sessions/current', {
                method: 'GET',
                credentials: 'include', // MUY IMPORTANTE para enviar cookies
            });
            const data = await response.json();
            if(data.error === 'jwt must be provided') { 
                setIsLoading(false)
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
        fetchCurrentUser();
        fetchSellerAddresses();
        fetchStoreSettings();
        fetchCategories();
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

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (response.ok) {
                toast('Consulta enviada con éxito', {
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
                setFormData({ first_name: '', last_name: '', email: '', message: '' }); // Limpiar campos
            } else {
                toast('Error al enviar la consulta', {
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
            console.error("Error enviando el formulario:", error);
            toast('Error de conexión', {
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
            <div className="contactContainer" style={{backgroundImage: `url(http://localhost:8081/${storeSettings?.siteImages?.contactImage || ''})`}}>

                <div className='contactContainer__title'>
                    <div className='contactContainer__title__prop'>Contacto</div>
                </div>

                <div className='contactContainer__formMap'>

                    <div className='contactContainer__formMap__formContainer'>

                        <div className='contactContainer__formMap__formContainer__form'>

                            <div className='contactContainer__formMap__formContainer__form__prop'>

                                <div className='contactContainer__formMap__formContainer__form__prop__title'>
                                    <div className='contactContainer__formMap__formContainer__form__prop__title__prop'>Dejanos tu consulta aquí!</div>
                                </div>

                                <div className='contactContainer__formMap__formContainer__form__prop__input'>
                                    <input className='contactContainer__formMap__formContainer__form__prop__input__prop' type="text" placeholder='Nombre' value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                                </div>

                                <div className='contactContainer__formMap__formContainer__form__prop__input'>
                                    <input className='contactContainer__formMap__formContainer__form__prop__input__prop' type="text" placeholder='Apellido' value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                                </div>

                                <div className='contactContainer__formMap__formContainer__form__prop__input'>
                                    <input className='contactContainer__formMap__formContainer__form__prop__input__prop' type="email" placeholder='Email' value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>

                                <div className='contactContainer__formMap__formContainer__form__prop__input'>
                                    <textarea className='contactContainer__formMap__formContainer__form__prop__input__textArea' name="" id="" placeholder='Mensaje'  value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}></textarea>
                                </div>

                                <div className='contactContainer__formMap__formContainer__form__prop__btn'>
                                    <button
                                        className='contactContainer__formMap__formContainer__form__prop__btn__prop'
                                        onClick={handleSubmit}
                                        >
                                        Enviar
                                    </button>
                                </div>

                            </div>

                        </div>

                    </div>

                    {
                        isLoadingSellerAddresses ?

                        <div className="contactContainer__formMap__spinnerContainer">
                            <Spinner/>
                        </div>

                        :
                        <div className='contactContainer__formMap__mapContainer'>

                            <div className='contactContainer__formMap__mapContainer__map'>

                                {selectedAddress ? (
                                    <iframe
                                        className='contactContainer__formMap__mapContainer__map__prop'
                                        src={generateMapUrl(selectedAddress)}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                ) : (
                                    <p className='contactContainer__formMap__mapContainer__map__label'>Aún no existen direcciones físicas del vendedor</p>
                                )}

                                {
                                    sellerAddresses.length == 1 ?
                                    <div className='contactContainer__formMap__mapContainer__map__label'>Sucursal</div>
                                    : sellerAddresses.length > 1 &&
                                    <div className='contactContainer__formMap__mapContainer__map__label'>Sucursales</div>
                                }

                                {
                                    sellerAddresses.length >= 1 &&
                                    <select
                                    className='contactContainer__formMap__mapContainer__map__select'
                                    value={selectedAddress ? selectedAddress._id : ''}
                                    onChange={(e) => {
                                            const selected = sellerAddresses.find(addr => addr._id === e.target.value);
                                            setSelectedAddress(selected);
                                        }}
                                        >
                                        {sellerAddresses.map(addr => (
                                            <option key={addr._id} value={addr._id}>
                                            {buildFullAddress(addr)}
                                            </option>
                                        ))}
                                    </select>
                                }

                            </div>

                        </div>
                    }

                </div>

            </div>

            <Footer
            logo_store={storeSettings?.siteImages?.logoStore || ""}
            aboutText={storeSettings?.footerLogoText || ""}
            phoneNumbers={storeSettings.phoneNumbers}
            contactEmail={storeSettings.contactEmail}
            socialNetworks={storeSettings.socialNetworks}
            sellerAddresses={sellerAddresses}
            isLoadingSellerAddresses={isLoadingSellerAddresses}
            isLoadingStoreSettings={isLoadingStoreSettings}
            />

        </>

    )

}

export default Contact