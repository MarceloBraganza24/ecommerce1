import {useEffect,useState,useContext} from 'react'
import NavBar from './NavBar'
import { useParams } from 'react-router-dom'
import ItemCount from './ItemCount';
import Footer from './Footer';
import DeliveryAddress from './DeliveryAddress';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { useFavorites } from '../context/FavoritesContext';
import { IsLoggedContext } from '../context/IsLoggedContext'; // ⚠️ ajustá la ruta según tu estructura

const ItemDetailContainer = () => {
    const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const [favoriteInitialized, setFavoriteInitialized] = useState(false);
    const [loadingVariant, setLoadingVariant] = useState(false);
    const [localFavorite, setLocalFavorite] = useState(false);
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useContext(IsLoggedContext);
    //console.log(user)
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);
    const [userCart, setUserCart] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isLoadingProductById, setIsLoadingProductById] = useState(true);
    const {id} = useParams()
    const [productById, setProductById] = useState({ images: [] });
    const [stockDisponible, setStockDisponible] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState({});
    console.log(selectedVariant)
    const [products, setProducts] = useState([]);
    const [deliveryForms, setDeliveryForms] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const [isLoadingSellerAddresses, setIsLoadingSellerAddresses] = useState(true);
    const [deliveryAddressFormData, setDeliveryAddressFormData] = useState({
        street: "",
        street_number: "",
        locality: "",
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [categories, setCategories] = useState([]);
    const [isLoadingDeliveryForm, setIsLoadingDeliveryForm] = useState(true);

    const [zoomActive, setZoomActive] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: "50%", y: "50%" });

    const allOptionsSelected = productById?.camposExtras &&
        Object.keys(productById.camposExtras).every((campo) => {
            const selected = selectedOptions[campo];
            return selected && selected !== campo; // ⚠️ ignorar si value === key
        });

    const handleSelectChange = (key, value) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    useEffect(() => {
        if (user && favorites.length > 0) {
            const isFavorite = favorites.some(fav => String(fav._id) === String(id));
            setLocalFavorite(isFavorite);
            setFavoriteInitialized(true);
        } else if (user && favorites.length === 0) {
            setLocalFavorite(false);
        }
    }, [favorites, id, user]);
    
    useEffect(() => {
        setLoadingVariant(true)
        setTimeout(() => {
            setLoadingVariant(false)
        }, 500);
    }, [selectedVariant,selectedOptions]);

    useEffect(() => {
        if (user?.isLoggedIn) {
            fetchCartByUserId(user._id)
        }
    }, [user]);

    useEffect(() => {
        if (
            productById?.variantes?.length &&
            selectedOptions &&
            Object.keys(productById.camposExtras || {}).every(
            (key) => selectedOptions[key] && selectedOptions[key] !== ''
            )
        ) {
            const varianteSeleccionada = productById.variantes.find(vari =>
            Object.entries(selectedOptions).every(([key, val]) => vari.campos[key] === val)
            );

            if (varianteSeleccionada) {
            setSelectedVariant(varianteSeleccionada);
            setStockDisponible(varianteSeleccionada.stock);
            } else {
            setSelectedVariant(null);
            setStockDisponible(0);
            }
        } else {
            // No todos los selects fueron elegidos todavía
            setSelectedVariant(null);
            setStockDisponible(0);
        }
    }, [selectedOptions, productById]);


    useEffect(() => {
        setSelectedOptions({});
        setSelectedVariant(null);
    }, [productById?._id]);

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

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.target.getBoundingClientRect();
        let x = ((e.clientX - left) / width) * 100;
        let y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x: `${x}%`, y: `${y}%` });
    };

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    useEffect(() => {
        if (productById) {
            const images = Array.isArray(productById.images)
                ? productById.images
                : productById.images
                    ? [productById.images]
                    : [];

            if (images.length > 0) {
                setSelectedImage(`http://localhost:8081/${images[0]}`);
            } else {
                setSelectedImage('/default-image.jpg');
            }
        }
    }, [productById]);


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

    const fetchProducts = async (page = 1, search = "",field = "") => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/byPage?page=${page}&search=${search}&field=${field}`)
            const productsAll = await response.json();
            setProducts(productsAll.data.docs)
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoadingProducts(false)
        }
    };
    
    const fetchProductById = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/${id}`)
            const productById = await response.json();
            if(response.ok) {
                setProductById(productById.data)
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoadingProductById(false);  
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
        fetchCurrentUser();
        fetchCategories();
        fetchProductById();
        fetchProducts();
        fetchStoreSettings();
        fetchSellerAddresses();
        fetchDeliveryForm();
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

    useEffect(() => {
        fetchProductById();
    }, [id]);

    const toggleFavorite = async () => {
        if(!user) {
            toast('Debes iniciar sesión para guardar favoritos!', {
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
        setLoadingFavorite(true);
        try {
            if (localFavorite) {
                await removeFromFavorites(user._id, id);
                setLocalFavorite(false);
            } else {
                await addToFavorites(user._id, id);
                setLocalFavorite(true);
            }
        } catch (err) {
            console.error("Error al actualizar favoritos", err);
        } finally {
            setLoadingFavorite(false);
        }
    };

    return (

        <>
            <div className='navbarContainer'>
                <NavBar
                isLoading={isLoading}
                products={products}
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
            <div className='itemDetailContainer'>
                    {
                        user && (user.role != 'admin') &&
                        <DeliveryAddress
                        deliveryAddressFormData={deliveryAddressFormData}
                        isLoadingDeliveryForm={isLoadingDeliveryForm}
                        />
                    }
                
                    <div className='itemDetailContainer__itemDetail'>

                        {
                        
                            isLoadingProductById ? 
                            <>
                                <div className="itemDetailContainer__itemDetail__loadingProducts">
                                    Cargando producto&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                            : productById ?
                            <>

                                <div className='itemDetailContainer__itemDetail__imgContainer'>
                                
                                    <div onMouseEnter={() => setZoomActive(true)} onMouseMove={handleMouseMove} onMouseLeave={() => setZoomActive(false)} className="itemDetailContainer__itemDetail__imgContainer__img">
                                        <img style={{transform: zoomActive ? "scale(1.5)" : "scale(1)", transformOrigin: `${zoomPosition.x} ${zoomPosition.y}`}} className='itemDetailContainer__itemDetail__imgContainer__img__prop' src={selectedImage} alt="img_product" />
                                    </div>

                                    <div className='itemDetailContainer__itemDetail__imgContainer__galery'>

                                        {productById?.images.slice(0, 6).map((img, index) => (
                                            
                                            <div className='itemDetailContainer__itemDetail__imgContainer__galery__imgContainer'>
                                                <img
                                                key={index}
                                                src={`http://localhost:8081/${img}`}
                                                alt={`Miniatura ${index + 1}`}
                                                className='itemDetailContainer__itemDetail__imgContainer__galery__imgContainer__prop'
                                                onClick={() => setSelectedImage(`http://localhost:8081/${img}`)}
                                                />
                                            </div>

                                        ))}

                                    </div>

                                </div>

                                <div className='itemDetailContainer__itemDetail__infoContainer'>


                                    <div className='itemDetailContainer__itemDetail__infoContainer__info'>

                                        <div className='itemDetailContainer__itemDetail__infoContainer__info__stateContainer'>
                                            <div className='itemDetailContainer__itemDetail__infoContainer__info__stateContainer__state'>{capitalizeFirstLetter(`${productById?.state}`)}</div>
                                            {productById?.number_sales > 10 && (
                                                <div className='itemDetailContainer__itemDetail__infoContainer__info__stateContainer__salesQuantity'>
                                                    {productById.number_sales > 500
                                                        ? '+500 Vendidos'
                                                        : productById.number_sales > 400
                                                        ? '+400 Vendidos'
                                                        :productById.number_sales > 300
                                                        ? '+300 Vendidos'
                                                        : productById.number_sales > 200
                                                        ? '+200 Vendidos'
                                                        : productById.number_sales > 100
                                                        ? '+100 Vendidos'
                                                        : productById.number_sales > 75
                                                        ? '+75 Vendidos'
                                                        : productById.number_sales > 50
                                                        ? '+50 Vendidos'
                                                        : productById.number_sales > 25
                                                        ? '+25 Vendidos'
                                                        : '+10 Vendidos'}
                                                </div>
                                            )}
                                            
                                            {favoriteInitialized && (
                                            <button
                                                onClick={toggleFavorite}
                                                className="itemDetailContainer__itemDetail__infoContainer__info__stateContainer__favoriteIcon"
                                                disabled={loadingFavorite}
                                            >
                                                <span className="itemDetailContainer__itemDetail__infoContainer__info__stateContainer__favoriteIcon">
                                                {localFavorite ? "💖" : "🤍"}
                                                </span>
                                            </button>
                                            )}
                                            
                                        </div>

                                        <div className='itemDetailContainer__itemDetail__infoContainer__info__title'>
                                            <div className='itemDetailContainer__itemDetail__infoContainer__info__title__prop'>{capitalizeFirstLetter(`${productById?.title}`)}</div>
                                        </div>

                                        <div className='itemDetailContainer__itemDetail__infoContainer__info__description'>
                                            <div className='itemDetailContainer__itemDetail__infoContainer__info__description__prop'>{capitalizeFirstLetter(`${productById?.description}`)}</div>
                                        </div>

                                        {/* === STOCK === */}
                                        <div className='itemDetailContainer__itemDetail__infoContainer__info__price'>
                                        {productById?.variantes?.length > 0 ? (
                                            allOptionsSelected ? (
                                            selectedVariant && selectedVariant.stock > 0 ? (
                                                <div className='itemDetailContainer__itemDetail__infoContainer__info__stock__label'>
                                                Stock disponible
                                                </div>
                                            ) : (
                                                <div className='itemDetailContainer__itemDetail__infoContainer__info__stock__label'>
                                                Sin stock
                                                </div>
                                            )
                                            ) : null
                                        ) : (
                                            productById.stock > 0 ? (
                                            <div className='itemDetailContainer__itemDetail__infoContainer__info__stock__label'>
                                                Stock disponible
                                            </div>
                                            ) : (
                                            <div className='itemDetailContainer__itemDetail__infoContainer__info__stock__label'>
                                                Sin stock
                                            </div>
                                            )
                                        )}
                                        </div>

                                        {/* === PRICE === */}
                                        <div className='itemDetailContainer__itemDetail__infoContainer__info__price'>
                                        <div className='itemDetailContainer__itemDetail__infoContainer__info__price__prop'>
                                            {productById?.variantes?.length > 0 ? (
                                            !allOptionsSelected
                                                ? 'Elija una variante'
                                                : selectedVariant
                                                ? `$ ${selectedVariant.price}`
                                                : 'Elija otra variante'
                                            ) : (
                                            `$ ${productById.price}`
                                            )}
                                        </div>
                                        </div>


                                        {
                                            productById?.camposExtras &&
                                            Object.entries(productById.camposExtras).map(([key, value], index) => {
                                                const opciones = value.split(',').map(op => op.trim()); // Generamos el array de opciones
                                                
                                                return (
                                                    <div key={index} className='itemDetailContainer__itemDetail__infoContainer__info__campoExtra'>
                                                    <label 
                                                    className='itemDetailContainer__itemDetail__infoContainer__info__campoExtra__label'
                                                    htmlFor={`campoExtra-${index}`}
                                                    >
                                                    {capitalizeFirstLetter(key)}:
                                                    </label>

                                                    <select
                                                    id={`campoExtra-${index}`}
                                                    className='itemDetailContainer__itemDetail__infoContainer__info__campoExtra__select'
                                                    value={selectedOptions[key] || ''} // valor seleccionado o vacío
                                                    onChange={(e) => handleSelectChange(key, e.target.value)}
                                                    >
                                                    <option value={key}>{key}</option>
                                                    {opciones.map((opcion, i) => (
                                                        <option key={i} value={opcion}>
                                                        {capitalizeFirstLetter(opcion)}
                                                        </option>
                                                    ))}
                                                    </select>
                                                </div>
                                                );
                                            })
                                        }

                                        <ItemCount
                                        loadingVariant={loadingVariant} 
                                        user_id={user?._id} 
                                        roleUser={user?.role} 
                                        id={productById?._id}
                                        images={productById?.images}
                                        title={productById?.title}
                                        description={productById?.description}
                                        price={productById?.price}
                                        stock={productById?.stock}
                                        selectedVariant={selectedVariant}
                                        variantes={productById?.variantes}
                                        fetchCartByUserId={fetchCartByUserId}
                                        userCart={userCart}
                                        />

                                    </div>
                                    
                                </div>
                            </>
                            :
                            <>
                                <div className="itemDetailContainer__itemDetail__loadingProducts">
                                    Cargando producto&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        }
                    </div>

            </div>

            <Footer
            isLoggedIn={user?.isLoggedIn}
            logo_store={storeSettings?.siteImages?.logoStore || ""}
            aboutText={storeSettings?.footerLogoText || ""}
            phoneNumbers={storeSettings.phoneNumbers}
            contactEmail={storeSettings.contactEmail}
            socialNetworks={storeSettings.socialNetworks}
            copyrightText={storeSettings.copyrightText}
            sellerAddresses={sellerAddresses}
            isLoadingSellerAddresses={isLoadingSellerAddresses}
            isLoadingStoreSettings={isLoadingStoreSettings}
            />

        </>
        
    )

}

export default ItemDetailContainer