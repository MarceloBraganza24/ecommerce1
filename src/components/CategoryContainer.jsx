import {useEffect,useState,useContext} from 'react'
import ItemProduct from './ItemProduct'
import { useParams,useNavigate, Link } from 'react-router-dom'
import NavBar from './NavBar';
import Footer from './Footer';
import DeliveryAddress from './DeliveryAddress';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const CategoryContainer = () => {
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [user, setUser] = useState('');
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);
    const [userCart, setUserCart] = useState({});
    const [products, setProducts] = useState([]);
    const [isLoadingDeliveryForm, setIsLoadingDeliveryForm] = useState(true);
    const [deliveryForms, setDeliveryForms] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [sellerAddresses, setSellerAddresses] = useState([]);
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
        if(user.isLoggedIn) {
            setShowLogOutContainer(true)
        }
    }, [user.isLoggedIn]);

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
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pageInfo.page]);

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

    const fetchProducts = async (page = 1) => {
        try {
            const url = new URL(`http://localhost:8081/api/products/by`, window.location.origin);
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

    const fetchStoreSettings = async () => {
        try {
            setIsLoadingStoreSettings(true)
            const response = await fetch('http://localhost:8081/api/settings');
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
            {
                user && (user.role != 'admin') &&
                <DeliveryAddress
                deliveryAddressFormData={deliveryAddressFormData}
                isLoadingDeliveryForm={isLoadingDeliveryForm}
                />
            }
            <div className="categoryContainer__grid">

                <div className='categoryContainer__grid__categoriesListContainer'>
                    
                    <div className='categoryContainer__grid__categoriesListContainer__categoriesList'>
                        <div className='categoryContainer__grid__categoriesListContainer__categoriesList__label'>Categorías</div>
                        {
                            categories.map(category => (
                                <Link className='categoryContainer__grid__categoriesListContainer__categoriesList__category' to={`/category/${category.name}`}>
                                    - {capitalizeFirstLetter(category.name)}
                                </Link>
                            ))
                        }
                    </div>

                    <div className='categoryContainer__grid__categoriesListContainer__pricesRangeContainer'>
                        <label>Filtrar por precio</label>
                        <Slider
                            range
                            min={0}
                            max={100000}
                            value={[priceRange.min, priceRange.max]}
                            onChange={([min, max]) => setPriceRange({ min, max })}
                        />
                        <p>Desde ${priceRange.min} hasta ${priceRange.max}</p>
                    </div>

                    <div className='categoryContainer__grid__categoriesListContainer__sortSelectContainer'>
                        <select className='categoryContainer__grid__categoriesListContainer__sortSelectContainer__select' value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="asc" className='categoryContainer__grid__categoriesListContainer__sortSelectContainer__select__option'>Precio: menor a mayor</option>
                            <option value="desc" className='categoryContainer__grid__categoriesListContainer__sortSelectContainer__select__option'>Precio: mayor a menor</option>
                        </select>
                    </div>

                </div>
                             
                {
                    <div className="categoryContainer__grid__catalog">

                        <div className='categoryContainer__grid__catalog__categorieContainer__title'>
                            <h2 className='categoryContainer__grid__catalog__categorieContainer__title__prop'>{category}</h2>
                        </div>

                        <div className='categoryContainer__grid__catalog__categorieContainer__productsContainer'>

                            {isLoadingProducts ? (
                                <div className="catalogContainer__grid__catalog__isLoadingLabel">
                                    Cargando productos&nbsp;&nbsp;<Spinner />
                                </div>
                            ) : products.length !== 0 ? (
                                <>
                                {products.map((product) => (
                                    <ItemProduct
                                    key={product._id}
                                    user_id={user._id}
                                    fetchCartByUserId={fetchCartByUserId}
                                    id={product._id}
                                    stock={product.stock}
                                    images={product.images}
                                    title={product.title}
                                    description={product.description}
                                    price={product.price}
                                    userCart={userCart}
                                    />
                                ))}
                                <div className='cPanelProductsContainer__btnsPagesContainer'>
                                    <button
                                    className='cPanelProductsContainer__btnsPagesContainer__btn'
                                    disabled={!pageInfo.hasPrevPage}
                                    onClick={() => fetchProducts(pageInfo.prevPage)}
                                    >
                                    Anterior
                                    </button>

                                    <span>Página {pageInfo.page} de {pageInfo.totalPages}</span>

                                    <button
                                    className='cPanelProductsContainer__btnsPagesContainer__btn'
                                    disabled={!pageInfo.hasNextPage}
                                    onClick={() => fetchProducts(pageInfo.nextPage)}
                                    >
                                    Siguiente
                                    </button>
                                </div>
                                </>
                            ) : (
                                <div className='categoryContainer__grid__catalog__categorieContainer__productsContainer__nonProductsYet'>
                                <div className='categoryContainer__grid__catalog__categorieContainer__productsContainer__nonProductsYet__label'>
                                    No se encontraron productos que coincidan con los filtros
                                </div>
                                {user.role === 'admin' && (
                                    <Link
                                    to={`/cpanel/products`}
                                    className="categoryContainer__grid__catalog__categorieContainer__productsContainer__nonProductsYet__link"
                                    >
                                    Agregar productos
                                    </Link>
                                )}
                                </div>
                            )}

                        </div>
                        
                    </div>
                }


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

export default CategoryContainer