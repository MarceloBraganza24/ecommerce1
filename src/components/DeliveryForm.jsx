import React, { useState,useEffect,useRef,useContext  } from 'react';
import {GoogleMap, useJsApiLoader, StandaloneSearchBox} from '@react-google-maps/api'
import NavBar from './NavBar'
import DeliveryAddress from './DeliveryAddress'
import Footer from './Footer'
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const DeliveryForm = () => {
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [user, setUser] = useState('');
    const [loadingDeleteId, setLoadingDeleteId] = useState(null);
    const [loadingSaveDeliveryForm, setLoadingSaveDeliveryForm] = useState(false);
    const [deliveryForms, setDeliveryForms] = useState([]);
    const [deliveryFormsById, setDeliveryFormsById] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isLoadingDeliveryForm, setIsLoadingDeliveryForm] = useState(true);
    const [userCart, setUserCart] = useState({});
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const [isLoadingSellerAddresses, setIsLoadingSellerAddresses] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [deliveryAddressFormData, setDeliveryAddressFormData] = useState({
        street: "",
        street_number: "",
        locality: "",
    });
    const [formData, setFormData] = useState({
        street: "",
        street_number: "",
        locality: "",
        province: "",
        country: "",
        postal_code: "",
        dpto: "",
        indications: "",
        name: "",
        phone: "",
        owner: ""
    });

    const inputRef = useRef(null)
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyCypLLA0vWKs_lvw5zxCuGJC28iEm9Rqk8',
        libraries:["places"]
    })

    useEffect(() => {
        if(user && deliveryForms) {
            const deliveryFormsById = deliveryForms.filter(deliveryForm => deliveryForm.owner == user.email)
            setDeliveryFormsById(deliveryFormsById)
            
        }
        const matchedAddress = deliveryForms?.find(item => 
            item.street === user.selected_addresses?.street &&
            item.street_number === user.selected_addresses?.street_number &&
            item.locality === user.selected_addresses?.locality
        );

        if (matchedAddress) {
            setSelectedAddress(matchedAddress);
            setDeliveryAddressFormData({
                street: user.selected_addresses.street,
                street_number: user.selected_addresses.street_number,
                locality: user.selected_addresses.locality
            })
        } else {
            setSelectedAddress(user.selected_addresses); // Usa la dirección guardada
        }


    }, [user, deliveryForms]);

    useEffect(() => {
        if(user.isLoggedIn) {
            setShowLogOutContainer(true)
        }
    }, [user.isLoggedIn]);

    function esColorClaro(hex) {
        if (!hex) return true;

        // Elimina el símbolo #
        hex = hex.replace("#", "");

        // Convierte a RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Fórmula de luminancia percibida
        const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;
        return luminancia > 186; // Umbral típico: > 186 es claro
    }

    useEffect(() => {
        if (storeSettings?.primaryColor) {
            const claro = esColorClaro(storeSettings.primaryColor);
            setCartIcon(claro ? '/src/assets/cart_black.png' : '/src/assets/cart_white.png');
        }
    }, [storeSettings]);

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

    const handleSelectAddress = async (address) => {
        setSelectedAddress(address);
        const { _id, __v, ...cleanAddress } = address;
        try {
            const response = await fetch(`http://localhost:8081/api/users/address-selected/${user._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ selected_addresses: cleanAddress }),
            });
            if (response.ok) {
                toast('Domicilio actualizado con éxito', {
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
                fetchUser(cookieValue)
            } else {
                toast('Error al actualizar el domicilio', {
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
            console.error("Error al actualizar la dirección:", error);
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

    const fetchDeliveryForm = async () => {
        try {
            setIsLoadingDeliveryForm(true)
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

    const handleOnPlacesChanged = () => {
        let address = inputRef.current.getPlaces()
        const desglocedAddress = address.map(dm => dm.address_components)
        const prop = desglocedAddress[0]
        const street = prop.find(dm => dm.types[0] == "route")
        const street_number = prop.find(dm => dm.types[0] == "street_number")
        const locality = prop.find(dm => dm.types[0] == "locality")
        const province = prop.find(dm => dm.types[0] == "administrative_area_level_1")
        const postal_code = prop.find(dm => dm.types[0] == "postal_code")
        const country = prop.find(dm => dm.types[0] == "country")
        setFormData({
            street: street.long_name || "",
            street_number: street_number.long_name || "",
            locality: locality.long_name || "",
            province: province.long_name || "",
            country: country.long_name || "",
            postal_code: postal_code.long_name || "",
            dpto: "",
            indications: "",
            name: "",
            phone: "",
        });
    }

    const handleBtnSaveDeliveryForm = async() => {
        if(formData.street == '') {
            toast('Debes ingresar una dirección', {
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
        if(formData.street != '' && (formData.name == '' || formData.phone == '')) {
            toast('Debes ingresar los datos de contacto', {
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
            setLoadingSaveDeliveryForm(true)
            const formattedData = {
                ...formData,
                phone: Number(formData.phone) || 0, // Convierte a número
                owner: user.email
            };
            const response = await fetch(`http://localhost:8081/api/deliveryForm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indicamos que estamos enviando datos JSON
                },
                body: JSON.stringify(formattedData),
            });
            const data = await response.json();
            console.log(data)
            if (response.ok) {
                toast('Formulario cargado con éxito', {
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
                setFormData({
                    street: "",
                    street_number: "",
                    locality: "",
                    province: "",
                    country: "",
                    postal_code: "",
                    dpto: "",
                    indications: "",
                    name: "",
                    phone: "",
                });
                document.getElementById('inputSearchAddress').value = '';
                fetchDeliveryForm();
                handleSelectAddress(data.data);
                setDeliveryAddressFormData({
                    street: data.data.street,
                    street_number: data.data.street_number,
                    locality: data.data.locality
                })
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast('Error al cargar formulario', {
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
            console.error('Error al enviar el formulario:', error);
        } finally {
            setLoadingSaveDeliveryForm(false)
        }
    }

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
        fetchCategories();
        fetchStoreSettings();
        fetchDeliveryForm();
        window.scrollTo(0, 0);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        setFormData((prevData) => ({
            ...prevData,
            [name]: value, // Elimina caracteres no numéricos
        }));
    };

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
    
    const handleDeleteAddress = async (addressId) => {
        try {
            
            setLoadingDeleteId(addressId);
            const response = await fetch(`http://localhost:8081/api/deliveryForm/${addressId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast('Domicilio eliminado', {
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
                fetchDeliveryForm();
                setDeliveryAddressFormData({
                    street: '',
                    street_number: '',
                    locality: ''
                })
            } else {
                toast('Error al eliminar el domicilio', {
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
            setLoadingDeleteId(null);
        }
    };

    const disabledInputAddress = {
        backgroundColor: 'white',
        color: 'black',
        cursor: 'not-allowed'
    }

    function hexToRgba(hex, opacity) {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

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
            <DeliveryAddress
            deliveryAddressFormData={deliveryAddressFormData}
            isLoadingDeliveryForm={isLoadingDeliveryForm}
            />

            <div className='deliveryFormContainer'>

                <div className='deliveryFormContainer__deliveryForm'>

                    <div className='deliveryFormContainer__deliveryForm__title'>
                        <div className='deliveryFormContainer__deliveryForm__title__prop'>Formulario de entrega</div>
                    </div>

                    <div className="deliveryFormContainer__deliveryForm__existingAddresses">
                        <h2 className='deliveryFormContainer__deliveryForm__existingAddresses__title'>Domicilios</h2>
                        {
                            isLoading ? 
                            <>
                                <div className="deliveryFormContainer__deliveryForm__existingAddresses__loadingAddresses">
                                    Cargando domicilios&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        :
                            deliveryFormsById.length === 0 ?
                            (
                                <p className='deliveryFormContainer__deliveryForm__existingAddresses__withOutAddressesLabel'>
                                    No hay domicilios aún
                                </p>
                            ) 
                        :
                            (
                            <ul className="deliveryFormContainer__deliveryForm__existingAddresses__itemAddress">
                                {deliveryFormsById.map((item) => (
                                    <li 
                                        key={item._id} 
                                        className={`deliveryFormContainer__deliveryForm__existingAddresses__itemAddress__addressContainer 
                                            ${selectedAddress && selectedAddress._id === item._id ? "selected" : ""}`}
                                    >
                                        <label className="deliveryFormContainer__deliveryForm__existingAddresses__itemAddress__addressContainer__label">
                                            <input
                                                type="radio"
                                                name="selectedAddress"
                                                value={item._id}
                                                checked={selectedAddress && selectedAddress._id === item._id} // Comparación correcta
                                                onChange={() => handleSelectAddress(item)} // Ejecuta petición en cada selección
                                                className="deliveryFormContainer__deliveryForm__existingAddresses__itemAddress__addressContainer__radio"
                                            />
                                            <span className="deliveryFormContainer__deliveryForm__existingAddresses__itemAddress__addressContainer__address">
                                                {corregirCapitalizacion(item.street)} {corregirCapitalizacion(item.street_number)}, {corregirCapitalizacion(item.locality)}
                                            </span>
                                        </label>
                                        <button
                                            className="deliveryFormContainer__deliveryForm__existingAddresses__itemAddress__addressContainer__btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAddress(item._id);
                                            }}
                                            disabled={loadingDeleteId === item._id}
                                        >
                                            {loadingDeleteId === item._id ? <Spinner/> : "Eliminar"}
                                        </button>
                                    </li>
                                ))}
                            </ul>


                        )}
                    </div>

                    <div className='deliveryFormContainer__deliveryForm__labelInputLoadStreet'>
                        <div className='deliveryFormContainer__deliveryForm__labelInputLoadStreet__prop'>Busca tu dirección aquí!</div>
                    </div>

                    {
                        isLoaded && 
                        <StandaloneSearchBox onLoad={(ref) => inputRef.current = ref} onPlacesChanged={handleOnPlacesChanged}>
                            <input id='inputSearchAddress' className='deliveryFormContainer__deliveryForm__inputStreet' type="text" placeholder='Buscar dirección' />
                        </StandaloneSearchBox>
                    }

                    <div className='deliveryFormContainer__deliveryForm__gridLabelInput'>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>Calle:</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <input value={formData.street} onChange={handleInputChange} className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__input' style={disabledInputAddress} disabled name='street' type="text" placeholder='Calle' />
                            </div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>Número:</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <input value={formData.street_number} onChange={handleInputChange} className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__input' style={disabledInputAddress} disabled name='street_number' type="text" placeholder='Número' />
                            </div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>Localidad:</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <input value={formData.locality} onChange={handleInputChange} className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__input' style={disabledInputAddress} disabled name='locality' type="text" placeholder='Localidad' />
                            </div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>Provincia:</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <input value={formData.province} onChange={handleInputChange} className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__input' style={disabledInputAddress} disabled name='province' type="text" placeholder='Provincia' />
                            </div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>País:</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <input value={formData.country} onChange={handleInputChange} className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__input' style={disabledInputAddress} disabled name='country' type="text" placeholder='País' />
                            </div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>Código postal:</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <input value={formData.postal_code} onChange={handleInputChange} className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__input' style={disabledInputAddress} disabled name='postal_code' type="text" placeholder='Código postal' />
                            </div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>Departamento (opcional):</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <input value={formData.dpto} onChange={handleInputChange} className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__input' name='dpto' type="text" placeholder='Departamento' />
                            </div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>Indicaciones (opcional):</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <textarea className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__textArea' value={formData.indications} onChange={handleInputChange} placeholder='Mensaje' name="indications" id=""></textarea>
                            </div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__labelContactData'>Datos de contacto</div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'></div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>Nombre completo:</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <input value={formData.name} onChange={handleInputChange} className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__input' name='name' type="text" placeholder='Nombre' />
                            </div>
                        </div>
                        <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput'>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__label'>Teléfono:</div>
                            <div className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer'>
                                <input value={formData.phone} onChange={handleInputChange} className='deliveryFormContainer__deliveryForm__gridLabelInput__labelInput__inputContainer__input' name='phone' type="number" placeholder='Teléfono'/>
                            </div>
                        </div>
                        
                    </div>

                    <div className='deliveryFormContainer__deliveryForm__btnContainer'>
                        <button
                            className="deliveryFormContainer__deliveryForm__btnContainer__btn"
                            onClick={handleBtnSaveDeliveryForm}
                            disabled={loadingSaveDeliveryForm}
                        >
                            {loadingSaveDeliveryForm ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                    

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

export default DeliveryForm