import {useEffect,useState,useContext,useRef} from 'react'
import ItemProduct from './ItemProduct'
import { useParams,useNavigate, Link } from 'react-router-dom'
import NavBar from './NavBar';
import Footer from './Footer';
import DeliveryAddress from './DeliveryAddress';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { IsLoggedContext } from '../context/IsLoggedContext'; // ⚠️ ajustá la ruta según tu estructura

const CategoryContainer = () => {
    const [dynamicFilters, setDynamicFilters] = useState({}); // { talle: ["38", "40"], Material: ["jean", "cargo"] }
    const [selectedDynamicFilters, setSelectedDynamicFilters] = useState({}); // { talle: ["38"], Material: ["cargo"] }
    const [allCategoryFilters, setAllCategoryFilters] = useState({});
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useContext(IsLoggedContext);
    const firstRender = useRef(true);
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
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

    const handleDynamicFilterChange = (filterName, value) => {
        setSelectedDynamicFilters(prev => {
            const currentValues = prev[filterName] || [];
            const isSelected = currentValues.includes(value);
            const updatedValues = isSelected
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

            return {
            ...prev,
            [filterName]: updatedValues
            };
        });
    };

    useEffect(() => {
        setSelectedDynamicFilters({});
        setSortOrder('desc');
        setPriceRange({ min: 0, max: 100000 });
    }, [category]);

    useEffect(() => {
        if (category) {
            fetchAvailableFilters(category);
        }
    }, [category]);

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

    const fetchAvailableFilters = async (category) => {
        try {
            const res = await fetch(`http://localhost:8081/api/products/availableFilters?category=${category}`);
            const data = await res.json();
            //console.log(data.data)
            if (res.ok) {
                setAllCategoryFilters(data.data);
            }
        } catch (error) {
            console.error("Error al obtener filtros globales:", error);
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

            Object.entries(selectedDynamicFilters).forEach(([key, values]) => {
                values.forEach(value => params.append(key, value));
            });

            params.append("page", page);
            params.append("limit", 8);

            url.search = params.toString();
            
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                //console.log(data.data)
                setProducts(data.data.docs);
                if (data.data.docs.length > 0) {
                    setDynamicFilters(data.data.availableFilters || {});
                }
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
        fetchSellerAddresses();
        fetchDeliveryForm();
        fetchStoreSettings();
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
        fetchProducts(1); 
    }, [category, priceRange, sortOrder,selectedDynamicFilters]);

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
            <div className='categoryContainer'>
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
                            <label className='categoryContainer__grid__categoriesListContainer__pricesRangeContainer__title'>Filtrar por precio</label>
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

                        {Object.entries(allCategoryFilters).length > 0 && (
                        <div className='categoryContainer__grid__categoriesListContainer__dynamicFiltersContainer'>
                            <label className='categoryContainer__grid__categoriesListContainer__dynamicFiltersContainer__title'>
                            Filtrar por atributos
                            </label>

                            {Object.entries(allCategoryFilters).map(([filterName, valuesObj]) => (
                            <div
                                key={filterName}
                                className='categoryContainer__grid__categoriesListContainer__dynamicFiltersContainer__labelCheckBoxContainer'
                            >
                                <div className='categoryContainer__grid__categoriesListContainer__dynamicFiltersContainer__labelCheckBoxContainer__label'>
                                {capitalizeFirstLetter(filterName)}
                                </div>

                                {Object.entries(valuesObj).map(([value, count]) => (
                                <div
                                    className='categoryContainer__grid__categoriesListContainer__dynamicFiltersContainer__labelCheckBoxContainer__checkBoxLabelContainer'
                                    key={value}
                                >
                                    <div className='categoryContainer__grid__categoriesListContainer__dynamicFiltersContainer__labelCheckBoxContainer__checkBoxLabelContainer__checkBox'>
                                    <input
                                        type="checkbox"
                                        id={`${filterName}-${value}`}
                                        checked={selectedDynamicFilters[filterName]?.includes(value) || false}
                                        onChange={() => handleDynamicFilterChange(filterName, value)}
                                        disabled={count === 0} // opcional: deshabilitar si no hay productos con ese filtro
                                    />
                                    </div>
                                    <label
                                    className='categoryContainer__grid__categoriesListContainer__dynamicFiltersContainer__labelCheckBoxContainer__checkBoxLabelContainer__label'
                                    htmlFor={`${filterName}-${value}`}
                                    >
                                    {capitalizeFirstLetter(value)} ({count})
                                    </label>
                                </div>
                                ))}
                            </div>
                            ))}
                        </div>
                        )}

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
                                    {user?.role === 'admin' && (
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

export default CategoryContainer