import {useEffect,useState,useContext,useRef} from 'react'
import ItemProduct from './ItemProduct'
import { useParams,useNavigate, Link } from 'react-router-dom'
import NavBar from './NavBar';
import Footer from './Footer';
import DeliveryAddress from './DeliveryAddress';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { useFavorites } from '../context/FavoritesContext';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useAuth } from '../context/AuthContext';

const Favorites = () => {
    const firstRender = useRef(true);
    const SERVER_URL = import.meta.env.VITE_API_URL;
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useAuth();
    const [loadingClearAll, setLoadingClearAll] = useState(false);
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_white.png');
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);
    const [userCart, setUserCart] = useState({});
    const [products, setProducts] = useState([]);
    const [isLoadingDeliveryForm, setIsLoadingDeliveryForm] = useState(true);
    const [deliveryForms, setDeliveryForms] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const { favorites, fetchContextFavorites,isLoadingFavorites,clearAllFavorites  } = useFavorites();
    const [isLoadingSellerAddresses, setIsLoadingSellerAddresses] = useState(true);
    const [deliveryAddressFormData, setDeliveryAddressFormData] = useState({
        street: "",
        street_number: "",
        locality: "",
    });
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    });  
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    
    const {category} = useParams()

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
        if (user?.isLoggedIn) {
            fetchCartByUserId(user._id)
        }
    }, [user]);

    useEffect(() => {
        if (user?.selected_addresses) {
            // Buscar la dirección en deliveryForms para asegurarnos de que tenga un _id
            const matchedAddress = deliveryForms.find(item => 
                item.street === user.selected_addresses.street &&
                item.street_number === user.selected_addresses.street_number &&
                item.locality === user.selected_addresses.locality
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
        }
    }, [user, deliveryForms]);

    const fetchSellerAddresses = async () => {
        try {
            const response = await fetch(`${SERVER_URL}api/sellerAddresses`);
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

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${SERVER_URL}api/categories`);
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
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pageInfo.page]);

    const fetchDeliveryForm = async () => {
        try {
            const response = await fetch(`${SERVER_URL}api/deliveryForm`);
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

    const fetchProducts = async (page = 1) => {
        try {
            const url = new URL(`${SERVER_URL}api/products/by`, window.location.origin);
            const params = new URLSearchParams();

            if (category) params.append("category", category);
            if (sortOrder) params.append("sort", sortOrder);
            if (priceRange) {
                params.append("minPrice", priceRange.min);
                params.append("maxPrice", priceRange.max);
            }

            params.append("page", page);
            params.append("limit", 8);

            url.search = params.toString();
            
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setProducts(data.data.docs);
                setPageInfo({
                    page,
                    totalPages: data.data.totalPages,
                    hasNextPage: data.data.hasNextPage,
                    hasPrevPage: data.data.hasPrevPage,
                    nextPage: data.data.nextPage,
                    prevPage: data.data.prevPage
                });
            } else {
                console.error("Error al obtener productos:", data.message);
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const fetchStoreSettings = async () => {
        try {
            setIsLoadingStoreSettings(true)
            const response = await fetch(`${SERVER_URL}api/settings`);
            const data = await response.json();
            //console.log(data)
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

    useEffect(() => {
        fetchCurrentUser();
        fetchCategories();
        fetchProducts();
        fetchSellerAddresses();
        fetchDeliveryForm();
        fetchStoreSettings();
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

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };
    
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' para ascendente, 'desc' para descendente

    useEffect(() => {
        fetchProducts(1); // 👈 Reinicia en la página 1 al cambiar filtros
    }, [category, priceRange, sortOrder]);

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
                logo_store={storeSettings?.siteImages?.logoStore || ""}
                primaryColor={storeSettings?.primaryColor || ""}
                cartIcon={cartIcon}
                storeName={storeSettings?.storeName || ""}
                />
            </div>

            <div className='favoritesContiner'>
                {isLoadingAuth ? (
                    <div className="favoritesContiner__isLoadingLabel">
                        <Spinner />
                    </div>
                ) : !user ? (
                    <div className="favoritesContiner__isLoadingLabel">
                        Debes iniciar sesión para ver tus favoritos
                    </div>
                ) : isLoadingFavorites ? (
                    <div className="favoritesContiner__isLoadingLabel">
                        Cargando favoritos&nbsp;&nbsp;<Spinner />
                    </div>
                ) : (
                    <>
                        {favorites?.length > 0 ? (
                            <div className='favoritesContiner__gridContainer'>
                                <div className='favoritesContiner__gridContainer__btn'>
                                    <button
                                        onClick={async () => {
                                            setLoadingClearAll(true);
                                            await clearAllFavorites(user._id);
                                            setLoadingClearAll(false);
                                        }}
                                        className='favoritesContiner__gridContainer__btn__prop'
                                        disabled={loadingClearAll}
                                    >
                                        {loadingClearAll ? <Spinner /> : 'Eliminar todos'}
                                    </button>
                                </div>
                                <div className='favoritesContiner__gridContainer__grid'>
                                    {favorites?.map((product) => (
                                        <ItemProduct
                                            key={product._id}
                                            fetchContextFavorites={fetchContextFavorites}
                                            fetchCartByUserId={fetchCartByUserId}
                                            id={product._id}
                                            stock={product.stock}
                                            images={product.images}
                                            title={product.title}
                                            description={product.description}
                                            price={product.price}
                                            variantes={product.variantes}
                                            userCart={userCart}
                                            user={user}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className='favoritesContiner__nonProductsYet'>
                                <div className='favoritesContiner__nonProductsYet__label'>
                                    Aún no tienes favoritos guardados
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>




            <Footer
            isLoggedIn={user?.isLoggedIn}
            logo_store={storeSettings?.siteImages?.logoStore || ""}
            aboutText={storeSettings?.footerLogoText || ""}
            phoneNumbers={storeSettings?.phoneNumbers}
            contactEmail={storeSettings?.contactEmail}
            socialNetworks={storeSettings?.socialNetworks}
            copyrightText={storeSettings?.copyrightText}
            sellerAddresses={sellerAddresses}
            isLoadingSellerAddresses={isLoadingSellerAddresses}
            isLoadingStoreSettings={isLoadingStoreSettings}
            />
            
        </>

    )

}

export default Favorites