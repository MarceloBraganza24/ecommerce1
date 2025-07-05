import React, {useState,useEffect,useContext,useRef} from 'react'
import {useJsApiLoader, StandaloneSearchBox} from '@react-google-maps/api'
import NavBar from './NavBar'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'
import Spinner from './Spinner';

import { useUnsavedChangesPrompt } from '../hooks/useUnsavedChangesPrompt';
//import { useBlockNavigation } from '../hooks/useBlockNavigation';
import isEqual from 'lodash.isequal';
import {IsLoggedContext} from '../context/IsLoggedContext';

const CPanel = () => {
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [deletingIdCategory, setDeletingIdCategory] = useState(null);
    const [creatingAddress, setCreatingAddress] = useState(false);
    const [deletingIdAddress, setDeletingIdAddress] = useState(null);
    const [creatingCoupon, setCreatingCoupon] = useState(false);
    const [deletingIdCoupon, setDeletingIdCoupon] = useState(null);
    // const [user, setUser] = useState(undefined);
    // const isLoadingAuth = user === undefined;
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useContext(IsLoggedContext);
    const [admins, setAdmins] = useState([]);
    const [adminsEdited, setAdminsEdited] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [codeCoupon, setCodeCoupon] = useState('');
    const [discount, setDiscount] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [categories, setCategories] = useState([]);
    const [userCart, setUserCart] = useState({});
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [loadingCoupons, setLoadingCoupons] = useState(false);
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [userCredentials, setUserCredentials] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'user',
    });
    const navigate = useNavigate();

    const SERVER_URL = "http://localhost:8081/";

    useEffect(() => {
        if (user?.isLoggedIn) {
            fetchCartByUserId(user._id)
        }
    }, [user]);

    const handleUserCredentialsChange = (event) => {
        const { name, value } = event.target;
        
        if ((name === "first_name" || name === "last_name") && !/^[a-zA-Z\s]*$/.test(value)) {
          return; // No actualiza el estado si el valor tiene caracteres no permitidos
        }
        setUserCredentials({ ...userCredentials, [name]: value });
    };

    const validateUserRegisterForm = () => {
        const { first_name,last_name,email,password,role } = userCredentials;
    
        if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim() || !role.trim()) {
            toast('Debes completar todos los campos!', {
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
            return false;
        }
    
        return true;
    };

    const handleUserRegisterSubmit = async (e) => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        const user_datetime = currentDate;
        e.preventDefault();
        if (!validateUserRegisterForm()) return;
        try {
            const response = await fetch(`http://localhost:8081/api/sessions/signInAdmin`, {
                method: 'POST',         
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: userCredentials.first_name,
                    last_name: userCredentials.last_name,
                    email: userCredentials.email,
                    password: userCredentials.password,
                    role: userCredentials.role,
                    user_datetime
                })
            })
            const data = await response.json();
            if(data.error === 'There is already a user with that email') {
                toast('Ya existe un usuario con ese email!', {
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
            } else if (response.ok) {
                toast('Has registrado un usuario exitosamente!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
                setUserCredentials({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    role: 'user',
                });
                fetchAdmins()
            } else {
                toast('Ha ocurrido un error, intente nuevamente!', {
                    position: "top-right",
                    autoClose: 3000,
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
            toast('Error en la conexión!', {
                position: "top-right",
                autoClose: 3000,
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

    function esColorClaro(hex) {
        if (!hex) return true;

        hex = hex.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return brightness > 128; // <-- usar el mismo umbral que en getContrastingTextColor
    }

    const couponsByExpirationDate = coupons.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));

    const [addressData, setAddressData] = useState({
        street: "",
        street_number: "",
        locality: "",
        province: "",
        postal_code: "",
    });

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
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
                setLoadingAddresses(false)
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
            setLoadingAddresses(false)
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
                setLoadingCategories(false)
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
            setLoadingCategories(false)
        }
    };

    const fetchCoupons = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/coupons');
            const data = await response.json();
            if (response.ok) {
                setCoupons(data.data); 
            } else {
                toast('Error al cargar los cupones', {
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
            setLoadingCoupons(false)
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
            setLoadingCoupons(false)
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            setDeletingIdCategory(categoryId);
            const response = await fetch(`http://localhost:8081/api/categories/${categoryId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast('Categoría eliminada', {
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
                fetchCategories();
            } else {
                toast('Error al eliminar la categoría', {
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
            setDeletingIdCategory(null);
        }
    };

    const handleDeleteSellerAddress = async (sellerAddressId) => {
        try {
            setDeletingIdAddress(sellerAddressId)
            const response = await fetch(`http://localhost:8081/api/sellerAddresses/${sellerAddressId}`, {
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
                fetchSellerAddresses();
            } else {
                toast('Error al eliminar la domicilio', {
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
            setDeletingIdAddress(false)
        }
    };

    const handleDeleteCoupons = async (couponId) => {
        try {
            setDeletingIdCoupon(couponId)
            const response = await fetch(`http://localhost:8081/api/coupons/${couponId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast('Cupón eliminado', {
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
                fetchCoupons();
            } else {
                toast('Error al eliminar el cupón', {
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
            setDeletingIdCoupon(null)
        }
    }; 

    const handleSubmitCategory = async () => {
        setCreatingCategory(true);
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const category_datetime = `${year}-${month}-${day} ${hours}:${minutes}`;

        if (!categoryName) {
            toast("Por favor, ingresa un nombre para la categoría", {
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
            setCreatingCategory(false);
            return;
        }

        try {
            await new Promise(res => setTimeout(res, 500));
            const response = await fetch('http://localhost:8081/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: categoryName, category_datetime: category_datetime}),
            });
            const data = await response.json();
            if(data.error === 'There is already a category with that name') {
                toast('Ya existe una categoría con ese nombre!', {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
            } else if (response.ok) {
                toast('Categoría creada con éxito', {
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
                setCategoryName('');
                fetchCategories()
            } 
        } catch (error) {
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
            setCreatingCategory(false);
        }
    };

    const handleSubmitAddress = async () => {
        if(!addressData.street || !addressData.street_number || !addressData.locality || !addressData.province) {
            toast('Debes ingresar un domicilio', {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
        }

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const sellerAddress_datetime = `${year}-${month}-${day} ${hours}:${minutes}`;


        try {
            setCreatingAddress(true)
            const sellerAddress = {
                street: addressData.street,
                street_number: addressData.street_number,
                locality: addressData.locality,
                province: addressData.province,
                postal_code: addressData.postal_code,
                sellerAddress_datetime 
            }
            const response = await fetch('http://localhost:8081/api/sellerAddresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sellerAddress),
            });
            const data = await response.json();
            if(data.error === 'There is already an address with that street') {
                toast('Ya existe una domicilio con esa calle!', {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
            } else if (response.ok) {
                toast('Domicilio creado con éxito', {
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
                setAddressData({
                    street: '',
                    street_number: '',
                    locality: '',
                    province: '',
                    postal_code: '',
                });
                document.getElementById('inputCreateAddress').value = ''
                fetchSellerAddresses()
            } 
        } catch (error) {
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
            setCreatingAddress(false)
        }
    };

    const handleSubmitCoupon = async () => {
        if (!codeCoupon.trim() || !discount || !expirationDate) {
            toast('Todos los campos son obligatorios', {
                position: "top-right",
                autoClose: 1500,
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
        if (isNaN(discount) || discount <= 0) {
            toast('El descuento debe ser un número válido', {
                position: "top-right",
                autoClose: 1500,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const coupon_datetime = `${year}-${month}-${day} ${hours}:${minutes}`;

        try {
            setCreatingCoupon(true)
            const coupon = {
                code: codeCoupon,
                discount: Number(discount),
                expiration_date: new Date(expirationDate).toISOString(),
                coupon_datetime 
            }
            const response = await fetch('http://localhost:8081/api/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(coupon),
            });
            const data = await response.json();
            if(data.error === 'There is already a coupon with that code') {
                toast('Ya existe un cupón con ese código!', {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
            } else if (response.ok) {
                toast('Cupón creado con éxito', {
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
                setCodeCoupon('')
                setDiscount('')
                setExpirationDate('');
                fetchCoupons()
            } 
        } catch (error) {
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
            setCreatingCoupon(false)
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
        setAddressData({
            street: street.long_name || "",
            street_number: street_number.long_name || "",
            locality: locality.long_name || "",
            province: province.long_name || "",
            postal_code: postal_code.long_name || "",
        });
    }

    const inputRef = useRef(null)
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyCypLLA0vWKs_lvw5zxCuGJC28iEm9Rqk8',
        libraries:["places"]
    })

    const fetchStoreSettings = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/settings');
            const data = await response.json();
            if (response.ok) {
                const transformedConfig = {
                    ...data,
                    socialNetworks: Array.isArray(data.socialNetworks)
                        ? data.socialNetworks.map(item => ({
                            name: item.name || '',
                            url: item.url || '',
                            logo: typeof item.logo === 'string' ? SERVER_URL + item.logo : null,
                            prevLogoPath: typeof item.logo === 'string' ? item.logo : null,
                        }))
                        : [],
                };

                const newFormData = {
                    ...configurationSiteformData,
                    ...transformedConfig,
                };
                setConfigurationSiteformData(newFormData);
                
                setColorSelectFormData((prev) => ({
                    ...prev,
                    primaryColor: data.primaryColor || prev.primaryColor,
                    secondaryColor: data.secondaryColor || prev.secondaryColor,
                    accentColor: data.accentColor || prev.accentColor,
                }));
                const siteImagesData = {
                    favicon: data.siteImages.favicon ? SERVER_URL + data.siteImages.favicon : null,
                    logoStore: data.siteImages.logoStore ? SERVER_URL + data.siteImages.logoStore : null,
                    homeImage: data.siteImages.homeImage ? SERVER_URL + data.siteImages.homeImage : null,
                    aboutImage: data.siteImages.aboutImage ? SERVER_URL + data.siteImages.aboutImage : null,
                    contactImage: data.siteImages.contactImage ? SERVER_URL + data.siteImages.contactImage : null,
                };
                setSiteImages(siteImagesData);
                
                setInitialConfiguration(newFormData);
                setInitialColorSelect({
                    primaryColor: data.primaryColor || '',
                    secondaryColor: data.secondaryColor || '',
                    accentColor: data.accentColor || '',
                    colorInputMode: 'pallete'
                });
                setInitialSiteImages(siteImagesData);
                setInitialConfigLoaded(true);
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

    const fetchAdmins = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/users/getAdmins', {
                method: 'GET',
                credentials: 'include', // MUY IMPORTANTE para enviar cookies
            });
            const data = await response.json();
            if(data.error === 'jwt must be provided') { 
                setIsLoading(false)
                navigate('/')
                setUser(null)
            } else if(response.ok) {
                setAdmins(data.data)
                setAdminsEdited(data.data.map(admin => ({ ...admin })));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchAdmins();
        fetchCategories();
        fetchStoreSettings();
        fetchSellerAddresses();
        fetchCoupons();
    }, []);

    const [siteImages, setSiteImages] = useState({
        favicon: null,
        logoStore: null,
        homeImage: null,
        aboutImage: null,
        contactImage: null
    });

    const handleImageChange = (e, name) => {
        const file = e.target.files[0];
        if (file) {
            setSiteImages((prev) => ({ ...prev, [name]: file }));
        }
    };

    const [initialConfigLoaded, setInitialConfigLoaded] = useState(false);
    const [initialConfiguration, setInitialConfiguration] = useState(null);
    const [initialColorSelect, setInitialColorSelect] = useState({
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        accentColor: '#fccf03',
        colorInputMode: 'pallete'
    });
    const [initialSiteImages, setInitialSiteImages] = useState(null);
    const [configurationSiteformData, setConfigurationSiteformData] = useState({
        storeName: '',
        contactEmail: [
            {
                email: '',
                label: 'General',
                selected: true
            }
        ],
        primaryColor: '',
        secondaryColor: '',
        accentColor: '',
        phoneNumbers: [
            { 
                number: '',
                selected: true 
            }
        ],
        aboutText: '',
        footerLogoText: '',
        copyrightText: '', 
        sliderLogos: [],
        socialNetworks: []
    });
    const [colorSelectFormData, setColorSelectFormData] = useState({
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        accentColor: '#fccf03',
        colorInputMode: 'pallete'
    });

    const shouldBlockNavigation =
        initialConfigLoaded && (
            !isEqual(configurationSiteformData, initialConfiguration) ||
            !isEqual(colorSelectFormData, initialColorSelect) ||
            !isEqual(siteImages, initialSiteImages)
    );

    useUnsavedChangesPrompt(shouldBlockNavigation);

    useEffect(() => {
        if (configurationSiteformData?.primaryColor) {
            const claro = esColorClaro(configurationSiteformData.primaryColor);
            setCartIcon(claro ? '/src/assets/cart_black.png' : '/src/assets/cart_white.png');
        }
    }, [configurationSiteformData]);

    const handleSocialChange = (index, field, value) => {
        setConfigurationSiteformData(prev => {
            const updatedNetworks = [...prev.socialNetworks];
            const current = updatedNetworks[index];

            updatedNetworks[index] = {
                ...current,
                [field]: value,
                // Asegura que se mantenga prevLogoPath si ya existía
                prevLogoPath: current.prevLogoPath || current.logo || ''
            };

            return { ...prev, socialNetworks: updatedNetworks };
        });
    };


    const handleSocialLogoChange = (index, file) => {
        setConfigurationSiteformData(prev => {
            const updatedNetworks = [...prev.socialNetworks];
            updatedNetworks[index] = {
            ...updatedNetworks[index],
            logo: file,
            // prevLogoPath no se toca aquí
            };
            return { ...prev, socialNetworks: updatedNetworks };
        });
    };

    const addSocialNetwork = () => {
        setConfigurationSiteformData(prev => ({
            ...prev,
            socialNetworks: [
            ...prev.socialNetworks,
            { name: '', url: '', logo: null }
            ]
        }));
    };

    const removeSocialNetwork = (index) => {
        setConfigurationSiteformData(prev => {
            const updatedNetworks = [...prev.socialNetworks];
            updatedNetworks.splice(index, 1);
            return { ...prev, socialNetworks: updatedNetworks };
        });
    };

    const handleSliderImagesUpload = (e) => {
        const files = Array.from(e.target.files);
        const currentCount = configurationSiteformData.sliderLogos.length;

        const allowedFiles = files.slice(0, 10 - currentCount);

        if (currentCount + files.length > 10) {
            toast('Solo se permiten hasta 10 imágenes!', {
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

        setConfigurationSiteformData(prev => ({
            ...prev,
            sliderLogos: [...prev.sliderLogos, ...allowedFiles]
        }));
    };  


    const removeLogo = (indexToRemove) => {
        setConfigurationSiteformData(prev => ({
            ...prev,
            sliderLogos: prev.sliderLogos.filter((_, index) => index !== indexToRemove)
        }));
    };

    const colorOptions = ['#000000', '#ffffff', '#FF5733', '#3498db', '#2ecc71', '#ffe100'];

    

    const handleColorSelect = (field, color) => {
        setColorSelectFormData((prev) => ({
            ...prev,
            [field]: color
        }));
    };
    
    const handleColorSelectChange = (e) => {
        const { name, value } = e.target;
        setColorSelectFormData((prev) => ({
        ...prev,
        [name]: value
        }));
    };

    const handleChange = (e, index = null) => {
        const { name, value } = e.target;
        if (name === 'phoneNumbers') {
            const updatedPhones = [...configurationSiteformData.phoneNumbers];
            updatedPhones[index] = value;
            setConfigurationSiteformData(prev => ({ ...prev, phoneNumbers: updatedPhones }));
        } else {
            setConfigurationSiteformData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhoneNumberChange = (index, field, value) => {
        const updatedPhones = configurationSiteformData.phoneNumbers.map((phone, i) => {
            if (i === index) {
                return {
                    ...phone,
                    [field]: value
                };
            }
            return phone;
        });
        setConfigurationSiteformData(prev => ({
            ...prev,
            phoneNumbers: updatedPhones
        }));
    };


    const handleSelectPrimaryPhone = (index) => {
        const updatedPhones = configurationSiteformData.phoneNumbers.map((phone, i) => ({
            ...phone,
            selected: i === index // solo el seleccionado tiene `true`
        }));

        setConfigurationSiteformData(prev => ({
            ...prev,
            phoneNumbers: updatedPhones
        }));
    };

    const addPhoneNumber = () => {
        setConfigurationSiteformData(prev => ({
            ...prev,
            phoneNumbers: [...prev.phoneNumbers, { number: '', selected: false }]
        }));
    };

    const removePhoneNumber = (index) => {
        if (configurationSiteformData.phoneNumbers.length === 1) return;

        let updatedPhones = configurationSiteformData.phoneNumbers.filter((_, i) => i !== index);
        const hadSelected = configurationSiteformData.phoneNumbers[index].selected;
        
        if (hadSelected && updatedPhones.length > 0) {
            updatedPhones = updatedPhones.map((phone, i) => ({
                ...phone,
                selected: i === 0
            }));
        }

        setConfigurationSiteformData(prev => ({
            ...prev,
            phoneNumbers: updatedPhones
        }));
    };

    const validatePhoneNumbers = () => {
        const selectedPhones = configurationSiteformData.phoneNumbers.filter(phone => phone.selected);
        
        if (selectedPhones.length !== 1) {
            toast('Debés seleccionar un número de teléfono como principal para WhatsApp.', {
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
            return false;
        }

        return true;
    };


    const handleSubmitConfigSite = async () => {
        
        if (!validatePhoneNumbers()) return;

        const hasEmptyPhone = configurationSiteformData.phoneNumbers.some(phoneObj =>
            phoneObj.number.trim() === ''
        );

        if (hasEmptyPhone) {
            toast('Debes completar todos los campos de teléfono antes de guardar', {
                position: "top-right",
                autoClose: 3000,
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

        const hasEmptyContactEmail = configurationSiteformData.contactEmail.some(emailObj =>
            emailObj.email.trim() === '' || emailObj.label.trim() === ''
        );

        if (hasEmptyContactEmail) {
            toast('Debes completar todos los campos de los emails de contacto', {
                position: "top-right",
                autoClose: 3000,
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

        const configToCompare = {
            ...configurationSiteformData,
            primaryColor: colorSelectFormData.primaryColor,
            secondaryColor: colorSelectFormData.secondaryColor,
            accentColor: colorSelectFormData.accentColor,
            siteImages: siteImages, // También incluímos esto si lo vas a comparar
        };

        const initialDataToCompare = {
            ...initialConfiguration,
            primaryColor: initialColorSelect.primaryColor,
            secondaryColor: initialColorSelect.secondaryColor,
            accentColor: initialColorSelect.accentColor,
            siteImages: initialSiteImages,
        };

        if (isEqual(configToCompare, initialDataToCompare)) {
            toast('No tienes cambios para guardar!', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        const formData = new FormData();

        Object.entries(siteImages).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value); // se envía como archivo
            } else if (typeof value === 'string') {
                // Enviar la URL de imagen existente usando el mismo nombre del campo
                formData.append(`siteImages.${key}`, value); // ✅ Este nombre coincide con lo que espera el backend
            }
        });


        configurationSiteformData.sliderLogos.forEach((logo) => {
            if (logo instanceof File) {
                formData.append('sliderLogos', logo);
            } else if (typeof logo === 'string' && logo.trim().startsWith('uploads/')) {
                formData.append('sliderLogosUrls[]', logo);
            }
        });

        const processedSocialNetworks = configurationSiteformData.socialNetworks.map((network, index) => {
            if (network.logo instanceof File) {
                formData.append('socialNetworkLogos', network.logo);
                return {
                ...network,
                logo: `__upload__${index}`,
                prevLogoPath: network.prevLogoPath || null,
                };
            }
            return {
                ...network,
                prevLogoPath: network.prevLogoPath || null,
            };
        });

        // Armar el objeto completo con los demás campos
        const configData = {
            ...configurationSiteformData,
            primaryColor: colorSelectFormData.primaryColor,
            secondaryColor: colorSelectFormData.secondaryColor,
            accentColor: colorSelectFormData.accentColor,
            sliderLogos: configurationSiteformData.sliderLogos.filter(logo => typeof logo === 'string' && logo.trim() !== ''),
            socialNetworks: processedSocialNetworks
        };

        // Convertir a JSON y añadirlo
        formData.append('data', JSON.stringify(configData));

        formData.forEach((value, key) => {
            console.log(`${key}:`, value);
        });

        try {
            const response = await fetch('http://localhost:8081/api/settings', {
                method: 'PUT',
                body: formData
            });

            const result = await response.json();
            if(response.ok) {
                toast('Has guardado los cambios', {
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
                setInitialConfiguration(configData);
                setConfigurationSiteformData(configData);
                setInitialColorSelect(colorSelectFormData);
                setInitialSiteImages(siteImages);
                //console.log('Resultado:', result);
            } else {
                toast('ha ocurrido un error al guardar, intente nuevamente', {
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
            console.error('Error al enviar la configuración:', error);
        }
    };

    const handleAdminChange = (index, field, value) => {
        const updatedAdmins = [...adminsEdited];
        updatedAdmins[index][field] = value;
        setAdminsEdited(updatedAdmins);
    };

    // Función para comparar si hubo cambios entre original y editado
    const isChanged = (index) => {
        const original = admins[index];
        const edited = adminsEdited[index];
        return (
            original.first_name !== edited.first_name ||
            original.last_name !== edited.last_name ||
            original.email !== edited.email ||
            original.role !== edited.role
        );
    };

    const isAnyAdminChanged = () => {
        return admins.some((admin, i) => {
            return (
                admin.first_name !== adminsEdited[i].first_name ||
                admin.last_name !== adminsEdited[i].last_name ||
                admin.email !== adminsEdited[i].email ||
                admin.role !== adminsEdited[i].role
            );
        });
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isAnyAdminChanged()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [admins, adminsEdited]);

    // Guardar cambios
    const handleSaveAdmin = async (index) => {
        const adminToSave = adminsEdited[index];
        try {
            const response = await fetch(`http://localhost:8081/api/users/${adminToSave._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: adminToSave.first_name,
                    last_name: adminToSave.last_name,
                    email: adminToSave.email,
                    role: adminToSave.role,
                }),
            });
            if (response.ok) {
                const updatedAdmin = await response.json();

                toast('Has guardado los cambios', {
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

                const updatedAdmins = [...admins];
                updatedAdmins[index] = { ...adminToSave }; // actualizar admins
                setAdmins(updatedAdmins);

                const updatedAdminsEdited = [...adminsEdited];
                updatedAdminsEdited[index] = { ...adminToSave }; // resetear adminsEdited
                setAdminsEdited(updatedAdminsEdited);
                fetchAdmins()

            } else {
                toast('Error al guardar cambios', {
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

    // Borrar usuario
    const handleDeleteAdmin = async (index) => {
        const adminToDelete = adminsEdited[index];
        if (!window.confirm(`¿Eliminar al usuario ${adminToDelete.first_name} ${adminToDelete.last_name}?`)) return;

        try {
            const response = await fetch(`http://localhost:8081/api/users/delete-one/${adminToDelete._id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast('Has eliminado el usuario con éxito', {
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
                const updatedAdmins = admins.filter(a => a._id !== adminToDelete._id);
                const updatedAdminsEdited = adminsEdited.filter(a => a._id !== adminToDelete._id);
                setAdmins(updatedAdmins);
                setAdminsEdited(updatedAdminsEdited);
                fetchAdmins()
            } else {
                toast('Error al eliminar usuario', {
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

    const ColorInput = ({
        label,
        name,
        value,
        inputMode,
        onChange,
        colorOptions = []
        }) => {
        const [localHex, setLocalHex] = useState(value.replace("#", ""));

        useEffect(() => {
            setLocalHex(value.replace("#", ""));
        }, [value]);

        const handleHexChange = (e) => {
            const val = e.target.value;
            if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
            setLocalHex(val);
            }
        };

        const handleHexBlur = () => {
            if (localHex.length === 6) {
            onChange(name, `#${localHex}`);
            }
        };

        return (
            <div className="cPanelContainer__siteConfiguration__form__gridColor">
                <label className='cPanelContainer__siteConfiguration__form__gridColor__label'>{label}</label>

                {inputMode === "hex" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span className='cPanelContainer__siteConfiguration__form__gridColor__labelInput'>#</span>
                    <input
                    className='cPanelContainer__siteConfiguration__form__gridColor__inputHex'
                        type="text"
                        value={localHex}
                        onChange={handleHexChange}
                        onBlur={handleHexBlur}
                        maxLength={6}
                        placeholder="000000"
                    />
                    </div>
                ) : (
                    <div className="cPanelContainer__siteConfiguration__form__gridColor">
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(name, e.target.value)}
                        />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {colorOptions.map((color) => (
                            <button
                                key={color}
                                type="button"
                                style={{
                                backgroundColor: color,
                                width: 30,
                                height: 30,
                                border: value === color ? "2px solid black" : "1px solid #ccc",
                                borderRadius: "50%",
                                cursor: "pointer"
                                }}
                                onClick={() => onChange(name, color)}
                                title={color}
                            />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const handleContactEmailChange = (index, field, value) => {
        const updatedEmails = configurationSiteformData.contactEmail.map((email, i) => {
            if (i === index) {
                return {
                    ...email,
                    [field]: value
                };
            }
            return email;
        });
        setConfigurationSiteformData(prev => ({
            ...prev,
            contactEmail: updatedEmails
        }));
    };

    const addContactEmail = () => {
        setConfigurationSiteformData(prev => ({
            ...prev,
            contactEmail: [...prev.contactEmail, { email: '', label: '', isDefault: false }]
        }));
    };

    const removeContactEmail = (index) => {
        const updatedEmails = configurationSiteformData.contactEmail.filter((_, i) => i !== index);
        setConfigurationSiteformData(prev => ({
            ...prev,
            contactEmail: updatedEmails
        }));
    };

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
                isLoadingAuth={isLoadingAuth}
                user={user}
                isLoggedIn={user?.isLoggedIn || false}
                role={user?.role || null}
                first_name={user?.first_name || ''}
                categories={categories}
                userCart={userCart}
                showLogOutContainer={showLogOutContainer}
                hexToRgba={hexToRgba}
                primaryColor={configurationSiteformData?.primaryColor || ""}
                logo_store={configurationSiteformData?.siteImages?.logoStore || ""}
                cartIcon={cartIcon}
                storeName={configurationSiteformData?.storeName || ""}
                />
            </div>

            <div className="cPanelContainer">

                <div className="cPanelContainer__title">

                    <div className="cPanelContainer__title__prop">Panel de control</div>

                </div>

                <div className='cPanelContainer__siteConfiguration'>

                    <div className="cPanelContainer__siteConfiguration__form">

                        <div className='cPanelContainer__siteConfiguration__form__grid'>

                            <div className="cPanelContainer__siteConfiguration__form__grid__label">Nombre de la tienda:</div>

                            <input
                                className='cPanelContainer__siteConfiguration__form__grid__input'
                                type="text"
                                name="storeName"
                                value={configurationSiteformData.storeName}
                                onChange={handleChange}
                                placeholder='Nombre'
                            />
                            
                        </div>

                        <label className='cPanelContainer__siteConfiguration__form__gridColor__labelTitle' style={{marginTop: '2vh'}}>Emails:</label>

                        {configurationSiteformData.contactEmail.map((item, index) => (
                        <div key={index} className='cPanelContainer__siteConfiguration__form__gridPhone'>
                            
                            <div className="cPanelContainer__siteConfiguration__form__gridPhone__label">
                            Email de contacto {index + 1}:
                            </div>

                            <div className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn'>
                            <input
                                type="email"
                                className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn__input'
                                value={item.email}
                                onChange={(e) => handleContactEmailChange(index, 'email', e.target.value)}
                                placeholder="Ej: contacto@tienda.com"
                            />
                            </div>

                            <div className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn'>
                            <input
                                type="text"
                                className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn__input'
                                value={item.label}
                                onChange={(e) => handleContactEmailChange(index, 'label', e.target.value)}
                                placeholder="Etiqueta (Ej: Soporte, Ventas)"
                            />
                            </div>

                            <div className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn'>
                            <label className='cPanelContainer__siteConfiguration__form__gridPhone__checkboxLabel'>
                                <input
                                type="checkbox"
                                checked={item.selected || false}
                                onChange={(e) => handleContactEmailChange(index, 'selected', e.target.checked)}
                                />
                                Recibir mensajes de contacto
                            </label>
                            </div>

                            {configurationSiteformData.contactEmail.length > 1 && (
                            <div className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn'>
                                <button
                                type="button"
                                onClick={() => removeContactEmail(index)}
                                className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn__btnDeletePhone'
                                >
                                Eliminar
                                </button>
                            </div>
                            )}
                        </div>
                        ))}

                        <div className='cPanelContainer__siteConfiguration__form__gridPhone'>
                        <button
                            type="button"
                            onClick={addContactEmail}
                            className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn__btnDeletePhone'
                        >
                            Agregar otro email
                        </button>
                        </div>

                        <label className='cPanelContainer__siteConfiguration__form__gridColor__labelTitle' style={{marginTop: '2vh'}}>Teléfonos:</label>
                        
                        {configurationSiteformData.phoneNumbers.map((phone, index) => (
                            <div key={index} className='cPanelContainer__siteConfiguration__form__gridPhone'>
                                <div className="cPanelContainer__siteConfiguration__form__gridPhone__label">
                                Teléfono {index + 1}:
                                </div>

                                <div className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn'>
                                    <input
                                        className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn__input'
                                        type="tel"
                                        name="phoneNumbers"
                                        value={phone.number}
                                        onChange={(e) => handlePhoneNumberChange(index, 'number', e.target.value)}
                                        placeholder="Ej: +5491123456789"
                                    />

                                    {configurationSiteformData.phoneNumbers.length > 1 && (
                                        <button
                                        className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn__btnDeletePhone'
                                        type="button"
                                        onClick={() => removePhoneNumber(index)}
                                        >
                                        Eliminar
                                        </button>
                                    )}

                                    <label className='cPanelContainer__siteConfiguration__form__gridPhone__checkboxLabel'>
                                        <input
                                            type="radio"
                                            name="selectedPhone"
                                            checked={phone.selected || false}
                                            onChange={() => handleSelectPrimaryPhone(index)}
                                        />
                                        Usar para WhatsApp
                                    </label>
                                </div>
                            </div>
                            ))}

                            <div className='cPanelContainer__siteConfiguration__form__gridPhone'>
                            <button
                                className='cPanelContainer__siteConfiguration__form__gridPhone__inputBtn__btnDeletePhone'
                                type="button"
                                onClick={addPhoneNumber}
                            >
                                Agregar otro teléfono
                            </button>
                        </div>


                        <div className='cPanelContainer__siteConfiguration__form__gridColor' style={{marginTop: '2vh'}}>
                            <label className='cPanelContainer__siteConfiguration__form__gridColor__labelTitle'>Modo de selección de color:</label>
                            <select
                            className='cPanelContainer__siteConfiguration__form__gridColor__select'
                            name="colorInputMode"
                            value={colorSelectFormData.colorInputMode}
                            onChange={handleColorSelectChange}
                            >
                                <option value="palette">Usar paleta de colores</option>
                                <option value="hex">Ingresar código hexadecimal</option>
                            </select>
                        </div>

                        <ColorInput
                        label="Color primario ('Navbar', 'Footer', 'Fondo botones')"
                        name="primaryColor"
                        value={colorSelectFormData.primaryColor}
                        inputMode={colorSelectFormData.colorInputMode}
                        onChange={handleColorSelect}
                        colorOptions={colorOptions}
                        />

                        <ColorInput
                        label="Color secundario ('Combinación de color primario')"
                        name="secondaryColor"
                        value={colorSelectFormData.secondaryColor}
                        inputMode={colorSelectFormData.colorInputMode}
                        onChange={handleColorSelect}
                        colorOptions={colorOptions}
                        />

                        <div className="cPanelContainer__siteConfiguration__form__images" style={{marginTop: '2vh'}}>
                            <div className="cPanelContainer__siteConfiguration__form__images__title">Imágenes del sitio</div>
                            {[
                                { name: 'favicon', label: 'Favicon' },
                                { name: 'logoStore', label: 'Logo de la tienda' },
                                { name: 'homeImage', label: 'Fondo "Home"' },
                                { name: 'aboutImage', label: 'Fondo "Sobre nosotros"' },
                                { name: 'contactImage', label: 'Fondo "Contacto"' },
                            ].map(({ name, label }) => (
                                <div key={name} className="cPanelContainer__siteConfiguration__form__images__grid">
                                    <label className="cPanelContainer__siteConfiguration__form__images__grid__label">{label}:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, name)}
                                        className="cPanelContainer__siteConfiguration__form__images__grid__input"
                                    />
                                    <div className='cPanelContainer__siteConfiguration__form__images__grid__img'>
                                        {siteImages[name] && (
                                            <img
                                            className='cPanelContainer__siteConfiguration__form__images__grid__img__prop'
                                            src={typeof siteImages[name] === 'string' ? siteImages[name] : URL.createObjectURL(siteImages[name])}
                                            alt={label}
                                            style={{ maxWidth: 150, marginTop: 8 }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='cPanelContainer__siteConfiguration__form__gridImages' style={{marginTop: '2vh'}}>
                            <label className='cPanelContainer__siteConfiguration__form__gridImages__label'>
                                Imágenes del slider de logos:
                            </label>
                            
                            <input
                                type="file"
                                name="sliderLogos"
                                accept="image/*"
                                multiple
                                className="cPanelContainer__siteConfiguration__form__gridImages__input"
                                onChange={handleSliderImagesUpload}
                            />

                            <div className="cPanelContainer__siteConfiguration__form__gridImages__preview">
                                {configurationSiteformData.sliderLogos.map((logo, index) => (
                                <div key={index} className="cPanelContainer__siteConfiguration__form__gridImages__preview__imgBtn">
                                    <img
                                        className='cPanelContainer__siteConfiguration__form__gridImages__preview__imgBtn__img'
                                        src={
                                            typeof logo === 'string'
                                            ? `${SERVER_URL}${logo}` // Agregás la URL base
                                            : URL.createObjectURL(logo)
                                        }
                                        alt={`logo-${index}`}
                                    />
                                    <button className='cPanelContainer__siteConfiguration__form__gridImages__preview__imgBtn__btn' type="button" onClick={() => removeLogo(index)}>Eliminar</button>
                                </div>
                                ))}
                            </div>
                        </div>

                        <div className="cPanelContainer__siteConfiguration__form__aboutText" style={{marginTop: '2vh'}}>
                            <label className="cPanelContainer__siteConfiguration__form__aboutText__label">Texto sección Sobre Nosotros:</label>
                            <textarea
                                className="cPanelContainer__siteConfiguration__form__aboutText__textArea"
                                name="aboutText"
                                value={configurationSiteformData.aboutText}
                                onChange={handleChange}
                                placeholder="Escribí aquí el texto que aparecerá en la sección Sobre Nosotros..."
                                rows={5}
                            />
                        </div>

                        <div className="cPanelContainer__siteConfiguration__form__aboutText" style={{marginTop: '2vh'}}>
                            <label className="cPanelContainer__siteConfiguration__form__aboutText__label">Texto logo footer:</label>
                            <textarea
                                className="cPanelContainer__siteConfiguration__form__aboutText__textArea"
                                name="footerLogoText"
                                value={configurationSiteformData.footerLogoText}
                                onChange={handleChange}
                                placeholder="Escribí aquí el texto que aparecerá abajo del logo en el footer"
                                rows={5}
                            />
                        </div>

                        <div className='cPanelContainer__siteConfiguration__form__socialNetworks'>

                            <div className="cPanelContainer__siteConfiguration__form__socialNetworks__title">Redes sociales</div>

                            {configurationSiteformData?.socialNetworks?.map((network, index) => (
                                <div key={index} className="cPanelContainer__siteConfiguration__form__socialNetworks__grid">
                                    <div className="cPanelContainer__siteConfiguration__form__socialNetworks__grid__inputContainer">
                                        <input
                                        type="text"
                                        placeholder="(ej: nombre usuario)"
                                        value={network.name}
                                        onChange={(e) => handleSocialChange(index, 'name', e.target.value)}
                                        className="cPanelContainer__siteConfiguration__form__socialNetworks__grid__inputContainer__input"
                                        />
                                    </div>

                                    <div className="cPanelContainer__siteConfiguration__form__socialNetworks__grid__inputContainer">
                                        <input
                                        type="url"
                                        placeholder="URL (ej. https://instagram.com/tu-cuenta)"
                                        value={network.url}
                                        onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                                        className="cPanelContainer__siteConfiguration__form__socialNetworks__grid__inputContainer__input"
                                        />
                                    </div>
                                    
                                    <div className='cPanelContainer__siteConfiguration__form__socialNetworks__grid__imgContainer'>
                                        {/* Vista previa de la imagen si ya se subió */}
                                        {network.logo ? (
                                            <img
                                                src={typeof network.logo === 'string' ? network.logo : URL.createObjectURL(network.logo)}
                                                alt="Logo de red social"
                                                className='cPanelContainer__siteConfiguration__form__socialNetworks__grid__imgContainer__img'
                                            />
                                        )
                                        :
                                            <div>Logo</div>
                                        }
                                        <div className="cPanelContainer__siteConfiguration__form__socialNetworks__grid__imgContainer__inputContainer">
                                            <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleSocialLogoChange(index, e.target.files[0])}
                                            className="cPanelContainer__siteConfiguration__form__socialNetworks__grid__imgContainer__inputContainer__input"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className='cPanelContainer__siteConfiguration__form__socialNetworks__grid__btnContainer'>
                                        <button className='cPanelContainer__siteConfiguration__form__socialNetworks__grid__btnContainer__btn' type="button" onClick={() => removeSocialNetwork(index)}>Eliminar</button>
                                    </div>
                                </div>
                            ))}
                            <div className='cPanelContainer__siteConfiguration__form__socialNetworks__btnAddSocialNetworkContianer'>
                                <button type="button" className='cPanelContainer__siteConfiguration__form__socialNetworks__btnAddSocialNetworkContianer__btn' onClick={addSocialNetwork}>Agregar red social</button>
                            </div>

                        </div>

                        <div className="cPanelContainer__siteConfiguration__form__copyrightText" style={{marginTop: '2vh'}}>
                            <label className="cPanelContainer__siteConfiguration__form__copyrightText__label">
                                Copyright (footer):
                            </label>
                            <input
                            type="text"
                            placeholder="Ej: © 2025 Mi Tienda. Todos los derechos reservados."
                            name="copyrightText"
                            value={configurationSiteformData.copyrightText}
                            onChange={handleChange}
                            className="cPanelContainer__siteConfiguration__form__copyrightText__input"
                            />
                        </div>


                        <div className='cPanelContainer__siteConfiguration__form__btnContainer'>
                            <button onClick={handleSubmitConfigSite} className='cPanelContainer__siteConfiguration__form__btnContainer__btn'>Guardar configuración</button>
                        </div>

                    </div>

                </div>

                {
                    loadingCategories ?
                        <>
                            <div className="cPanelContainer__existingCategories__loadingProps">
                                Cargando categorías&nbsp;&nbsp;<Spinner/>
                            </div>
                        </>
                    :
                
                        <>
                            <div className="cPanelContainer__existingCategories">
                                <div className='cPanelContainer__existingCategories__title'>Categorías</div>
                                {categories.length === 0 ? (
                                    <p className='cPanelContainer__existingCategories__withOutCategoriesLabel'>No hay categorías aún</p>
                                    ) 
                                    :
                                    (
                                    <ul className='cPanelContainer__existingCategories__itemCategory'>
                                        {categories.map((category) => (
                                            <li className='cPanelContainer__existingCategories__itemCategory__category' key={category._id}>
                                                <span className='cPanelContainer__existingCategories__itemCategory__category__name'>{capitalizeFirstLetter(category.name)}</span>
                                                <button
                                                    className='cPanelContainer__existingCategories__itemCategory__category__btn'
                                                    onClick={() => handleDeleteCategory(category._id)}
                                                    disabled={deletingIdCategory === category._id}
                                                    >
                                                    {deletingIdCategory === category._id ? <Spinner/> : 'Eliminar'}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="cPanelContainer__newCategoryForm">
                                    <div className='cPanelContainer__newCategoryForm__title'>Crear nueva categoría</div>
                                    <div className='cPanelContainer__newCategoryForm__form'>
                                        <input
                                        className='cPanelContainer__newCategoryForm__form__input'
                                        type="text"
                                        id="categoryName"
                                        placeholder='Nombre categoría'
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        />
                                        <button
                                            className='cPanelContainer__newCategoryForm__form__btn'
                                            disabled={creatingCategory}
                                            onClick={() => handleSubmitCategory()}
                                            >
                                            {creatingCategory ? <Spinner/> : 'Crear categoría'}
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </>
                }

                {
                    loadingAddresses ?
                        <>
                            <div className="cPanelContainer__existingCategories__loadingProps">
                                Cargando domicilios&nbsp;&nbsp;<Spinner/>
                            </div>
                        </>
                    :
                        <>

                            <div className="cPanelContainer__existingSellerAddresses">
                                <div className='cPanelContainer__existingSellerAddresses__title'>Domicilios del vendedor</div>
                                {sellerAddresses.length === 0 ? (
                                    <p className='cPanelContainer__existingSellerAddresses__withOutSellerAddressesLabel'>No hay domicilios aún</p>
                                    ) 
                                    :
                                    (
                                    <ul className='cPanelContainer__existingSellerAddresses__itemSellerAddress'>
                                        {sellerAddresses.map((item) => (
                                            <li className='cPanelContainer__existingSellerAddresses__itemSellerAddress__sellerAddress' key={item._id}>
                                                <span className='cPanelContainer__existingSellerAddresses__itemSellerAddress__sellerAddress__address'>{capitalizeFirstLetter(item.street)} {capitalizeFirstLetter(item.street_number)}, {capitalizeFirstLetter(item.locality)}, {item.province}</span>
                                                <button
                                                    className='cPanelContainer__existingSellerAddresses__itemSellerAddress__sellerAddress__btn'
                                                    onClick={() => handleDeleteSellerAddress(item._id)}
                                                    disabled={deletingIdAddress == item._id}
                                                    >
                                                    {deletingIdAddress == item._id ? <Spinner/> : 'Eliminar'}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="cPanelContainer__createNewSellerAddress">

                                    <div className='cPanelContainer__createNewSellerAddress__title'>Crear nuevo domicilio</div>
                                    {
                                        isLoaded && 
                                        <StandaloneSearchBox onLoad={(ref) => inputRef.current = ref} onPlacesChanged={handleOnPlacesChanged}>
                                            <input id='inputCreateAddress' className='cPanelContainer__createNewSellerAddress__input' type="text" placeholder='Buscar dirección' />
                                        </StandaloneSearchBox>
                                    }
                                    <div className='cPanelContainer__createNewSellerAddress__label'>Calle: {addressData.street}</div>
                                    <div className='cPanelContainer__createNewSellerAddress__label'>Número: {addressData.street_number}</div>
                                    <div className='cPanelContainer__createNewSellerAddress__label'>Localidad: {addressData.locality}</div>
                                    <div className='cPanelContainer__createNewSellerAddress__label'>Provincia: {addressData.province}</div>
                                    <button
                                        className='cPanelContainer__createNewSellerAddress__btn'
                                        disabled={creatingAddress}
                                        onClick={() => handleSubmitAddress()}
                                        >
                                        {creatingAddress ? <Spinner/> : 'Guardar'}
                                    </button>
                                    
                                </div>

                            </div>

                        </>
                }

                {
                    loadingCoupons ?
                        <>
                            <div className="cPanelContainer__existingCategories__loadingProps">
                                Cargando cupones&nbsp;&nbsp;<Spinner/>
                            </div>
                        </>
                    :
                    <>
                    

                        <div className="cPanelContainer__existingCoupons">
                            <div className='cPanelContainer__existingCoupons__title'>Cupones</div>
                            {couponsByExpirationDate.length === 0 ? (
                                <p className='cPanelContainer__existingCoupons__withOutCouponsLabel'>No hay cupones aún</p>
                                ) 
                                :
                                (
                                    <ul className='cPanelContainer__existingCoupons__itemCoupons'>
                                        <li className='cPanelContainer__existingCoupons__itemCoupons__couponsHeader'>
                                            <span className='cPanelContainer__existingCoupons__itemCoupons__couponsHeader__coupon'>Código</span>
                                            <span className='cPanelContainer__existingCoupons__itemCoupons__couponsHeader__coupon'>Descuento (%)</span>
                                            <span className='cPanelContainer__existingCoupons__itemCoupons__couponsHeader__coupon'>Fecha de expiración</span>
                                        </li>
                                    {couponsByExpirationDate.map((item) => {
                                        const fechaUTC = new Date(item.expiration_date);
                                        const fechaLocal = new Date(fechaUTC.getTime() + fechaUTC.getTimezoneOffset() * 60000);
                                        
                                        return (
                                            <li className='cPanelContainer__existingCoupons__itemCoupons__coupons' key={item._id}>
                                                <span className='cPanelContainer__existingCoupons__itemCoupons__coupons__coupon'>{item.code}</span>
                                                <span className='cPanelContainer__existingCoupons__itemCoupons__coupons__coupon'>{item.discount}%</span>
                                                <span className='cPanelContainer__existingCoupons__itemCoupons__coupons__coupon'>
                                                    {fechaLocal.toLocaleDateString("es-AR", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit"
                                                    })}
                                                </span>
                                                <button
                                                    className='cPanelContainer__existingCoupons__itemCoupons__coupons__btn'
                                                    onClick={() => handleDeleteCoupons(item._id)}
                                                    disabled={deletingIdCoupon == item._id}
                                                    >
                                                    {deletingIdCoupon == item._id ? <Spinner/> : 'Eliminar'}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                                
                            )}

                            <div className="cPanelContainer__createNewCoupons">

                                <div className='cPanelContainer__createNewCoupons__title'>Crear nuevo cupón</div>
                                <div>Código</div>
                                <input
                                className='cPanelContainer__createNewCoupons__input'
                                type="text"
                                placeholder='Código cupón'
                                value={codeCoupon}
                                onChange={(e) => setCodeCoupon(e.target.value)}
                                required
                                />
                                <div>Descuento</div>
                                <input
                                    className='cPanelContainer__createNewCoupons__input'
                                    type="number"
                                    placeholder='Descuento (%)'
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    required
                                    />
                                <div>Fecha de expiración</div>
                                <input
                                    className='cPanelContainer__createNewCoupons__input'
                                    type="date"
                                    placeholder='Fecha de expiración'
                                    value={expirationDate}
                                    onChange={(e) => setExpirationDate(e.target.value)}
                                    required
                                    />
                                <button
                                    className='cPanelContainer__createNewCoupons__btn'
                                    disabled={creatingCoupon}
                                    onClick={() => handleSubmitCoupon()}
                                    >
                                    {creatingCoupon ? <Spinner/> : 'Guardar'}
                                </button>
                                
                            </div>

                        </div>

                    </>
                }

                <div className='cPanelContainer__adminsList'>
                    <div className='cPanelContainer__adminsList__title'>Usuarios administradores</div>
                    {adminsEdited.map((admin, index) => (
                        <div
                        key={admin._id}
                        className='cPanelContainer__adminsList__item'
                        >
                            <div className='cPanelContainer__adminsList__item__input'>
                                <input
                                    className='cPanelContainer__adminsList__item__input__prop'
                                    type="text"
                                    value={admin.first_name}
                                    onChange={(e) => handleAdminChange(index, 'first_name', e.target.value)}
                                    placeholder="Nombre"
                                />
                            </div>
                            <div className='cPanelContainer__adminsList__item__input'>
                                <input
                                    className='cPanelContainer__adminsList__item__input__prop'
                                    type="text"
                                    value={admin.last_name}
                                    onChange={(e) => handleAdminChange(index, 'last_name', e.target.value)}
                                    placeholder="Apellido"
                                />
                            </div>
                            <div className='cPanelContainer__adminsList__item__input'>
                                <input
                                    className='cPanelContainer__adminsList__item__input__prop'
                                    type="email"
                                    value={admin.email}
                                    onChange={(e) => handleAdminChange(index, 'email', e.target.value)}
                                    placeholder="Email"
                                />
                            </div>
                            <div className='cPanelContainer__adminsList__item__input'>
                                <div className='cPanelContainer__adminsList__item__input'>
                                    <input
                                        className='cPanelContainer__adminsList__item__input__prop'
                                        type="text"
                                        value={admin.role}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className='cPanelContainer__adminsList__item__btns'>
                                <button
                                    className='cPanelContainer__adminsList__item__btns__btn'
                                    onClick={() => handleSaveAdmin(index)}
                                    disabled={!isChanged(index)}
                                >
                                    Actualizar
                                </button>
                                <button
                                    className='cPanelContainer__adminsList__item__btns__btn'
                                    onClick={() => handleDeleteAdmin(index)}
                                    >
                                    Borrar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='cPanelContainer__userRegisterContainer'>

                    <div className='cPanelContainer__userRegisterContainer__title'>
                        <div className='cPanelContainer__userRegisterContainer__title__prop'>Registro de usuario</div>
                    </div>

                    <div className="cPanelContainer__userRegisterContainer__form">

                        <div className='cPanelContainer__userRegisterContainer__form__input'>
                            <div className='cPanelContainer__userRegisterContainer__form__input__label'>Nombre:</div>
                            <input className='cPanelContainer__userRegisterContainer__form__input__prop' type="text" value={userCredentials.first_name} onChange={handleUserCredentialsChange} placeholder='Nombre' name="first_name" id="" />
                        </div>

                        <div className='cPanelContainer__userRegisterContainer__form__input'>
                            <div className='cPanelContainer__userRegisterContainer__form__input__label'>Apellido:</div>
                            <input className='cPanelContainer__userRegisterContainer__form__input__prop' type="text" value={userCredentials.last_name} onChange={handleUserCredentialsChange} placeholder='Apellido' name="last_name" id="" />
                        </div>

                        <div className='cPanelContainer__userRegisterContainer__form__input'>
                            <div className='cPanelContainer__userRegisterContainer__form__input__label'>Email:</div>
                            <input className='cPanelContainer__userRegisterContainer__form__input__prop' type="email" value={userCredentials.email} onChange={handleUserCredentialsChange} placeholder='Email' name="email" id="" />
                        </div>

                        <div className='cPanelContainer__userRegisterContainer__form__input'>
                            <div className='cPanelContainer__userRegisterContainer__form__input__label'>Contraseña:</div>
                            <input className='cPanelContainer__userRegisterContainer__form__input__prop' type="password" value={userCredentials.password} onChange={handleUserCredentialsChange} placeholder='Contraseña' name="password" id="" />
                        </div>

                        <div className='cPanelContainer__userRegisterContainer__form__select'>
                            <div className='cPanelContainer__userRegisterContainer__form__select__label'>Rol:</div>
                            <div className='cPanelContainer__userRegisterContainer__form__select__selectContainer'>
                                <select
                                    className='cPanelContainer__userRegisterContainer__form__select__selectContainer__prop'
                                    name="role"
                                    value={userCredentials.role}
                                    onChange={handleUserCredentialsChange}
                                    >
                                    <option value="user">User</option>
                                    <option value="admin">Administrador</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                        </div>

                        <div className='cPanelContainer__userRegisterContainer__form__btn'>
                            <button onClick={handleUserRegisterSubmit} className='cPanelContainer__userRegisterContainer__form__btn__prop'>Registrar usuario</button>
                        </div>

                    </div>

                </div>

            </div>

        </>

    )

}

export default CPanel