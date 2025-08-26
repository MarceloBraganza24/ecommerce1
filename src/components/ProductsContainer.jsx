import { useEffect,useState,useContext,useRef } from "react";
import NavBar from './NavBar'
import ItemProduct from './ItemProduct';
import { Link, useLocation,useParams } from "react-router-dom";
import Footer from "./Footer";
import { toast } from 'react-toastify';

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination,Autoplay  } from "swiper/modules";
import BtnGoUp from "./BtnGoUp";
import Spinner from "./Spinner";
import { IsLoggedContext } from '../context/IsLoggedContext'; // ⚠️ ajustá la ruta según tu estructura
import { useAuth } from '../context/AuthContext';
import CategoriesPage from './CategoriesPage.jsx';
import CategorySidebar from "./CategorySidebar";
import Slider from 'rc-slider';

const ProductsContainer = () => {
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useAuth();
    const firstRender = useRef(true);
    const [isScrollForced, setIsScrollForced] = useState(false);
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [inputFilteredProducts, setInputFilteredProducts] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const [isLoadingSellerAddresses, setIsLoadingSellerAddresses] = useState(true);
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    });  
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [userCart, setUserCart] = useState({});
    const SERVER_URL = "http://localhost:8081/";
    const [selectedField, setSelectedField] = useState('title');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [sortOrder, setSortOrder] = useState('desc'); 
    const [selectedDynamicFilters, setSelectedDynamicFilters] = useState({}); // { talle: ["38"], Material: ["cargo"] }
    const [allCategoryFilters, setAllCategoryFilters] = useState({});
    const location = useLocation();
    const { category } = useParams();

    
    const [products, setProducts] = useState([]);
    //console.log(products)
    const [availableFilters, setAvailableFilters] = useState({});
    const [categories, setCategories] = useState([]);

    // 📌 Estados para filtros
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [appliedFilters, setAppliedFilters] = useState({});
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState("asc");

    // 📌 Paginación
    const [page, setPage] = useState(1);
    const [limit] = useState(8);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCategoriesTree = async () => {
        try {
            const res = await fetch("http://localhost:8081/api/categories/combined");
            const data = await res.json();
            if (res.ok) setCategories(data.tree || []);
        } catch (err) {
            console.error("Error al cargar categorías:", err);
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

    useEffect(() => {
        if (storeSettings?.primaryColor) {
            const claro = esColorClaro(storeSettings.primaryColor);
            setCartIcon(claro ? '/src/assets/cart_black.png' : '/src/assets/cart_white.png');
        }
    }, [storeSettings]);

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

    const fetchProducts = async () => {
        try {
            setIsLoadingProducts(true);
            const body = {
                category: selectedCategory,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                filters: appliedFilters,
                sort,
                page,
                limit,
            };

            const res = await fetch("http://localhost:8081/api/products/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            setProducts(data.docs);
            setTotalPages(data.totalPages);
            setAvailableFilters(data.availableFilters);
        } catch (err) {
            console.error("Error al traer productos:", err);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleFilterChange = (filterName, value, checked) => {
        setAppliedFilters((prev) => {
        const prevValues = prev[filterName] || [];

        let newValues;
        if (checked) {
            newValues = [...prevValues, value];
        } else {
            newValues = prevValues.filter((v) => v !== value);
        }

        if (newValues.length === 0) {
            const { [filterName]: _, ...rest } = prev;
            return rest;
        }

        return { ...prev, [filterName]: newValues };
        });
    };

    // 🔹 Refrescar productos cada vez que cambia categoría, filtros, precio o sort
    useEffect(() => {
        fetchProducts(1);
    }, [selectedCategory, appliedFilters, priceRange, sortOrder]);

    // 🎯 Al seleccionar categoría
    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        //setSelectedDynamicFilters({});
        setPriceRange({ min: 0, max: 100000 });
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

    useEffect(() => {
        fetchCurrentUser();
        fetchProducts();
        fetchStoreSettings();
        fetchSellerAddresses();
        fetchCategoriesTree();
        window.scrollTo(0, 0);
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
              setIsVisible(true);
            } else {
              setIsVisible(false);
            }
        };
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    useEffect(() => {
        if (user?.isLoggedIn) {
            fetchCartByUserId(user._id)
        }
    }, [user]);

    const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
    };

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

    const handleResetFilters = () => {
        setSelectedCategory(null); // limpiar categoría
        setPriceRange({ min: 0, max: 100000 }); // rango de precios inicial
        setSortOrder('desc'); // orden por defecto
        setAvailableFilters({}); // filtros dinámicos vacíos
    };

    return (

        <>

            <BtnGoUp
            isVisible={isVisible}
            scrollToTop={scrollToTop}
            />

            <NavBar
            products={products}
            isScrollForced={isScrollForced}
            isLoading={isLoading}
            isLoadingAuth={isLoadingAuth}
            user={user}
            isLoggedIn={user?.isLoggedIn || false}
            role={user?.role || null}
            first_name={user?.first_name || ''}
            storeName={storeSettings?.storeName || ""}
            categories={categories}
            userCart={userCart}
            showLogOutContainer={showLogOutContainer}
            hexToRgba={hexToRgba}
            cartIcon={cartIcon}
            logo_store={storeSettings?.siteImages?.logoStore || ""}
            primaryColor={storeSettings?.primaryColor || ""}
            />

            {<div className='productsContainer' id="catalogContainer">

                <div className="productsContainer__gridCategoriesProducts">

                    <div className="productsContainer__gridCategoriesProducts__categoriesContainer">

                        <div className="productsContainer__gridCategoriesProducts__categoriesContainer__categories">

                            <div>
                                <button onClick={handleResetFilters}>Borrar filtros</button>
                            </div>

                            <div>
                                <CategorySidebar onSelectCategory={handleSelectCategory} />
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

                            {Object.entries(availableFilters).map(([filterName, values]) => (
                            <div key={filterName} style={{display:'flex',flexDirection:'column',paddingLeft:'2vh'}}>
                                <h4>{capitalizeFirstLetter(filterName)}</h4>
                                {Object.keys(values).map((val) => (
                                    <label style={{paddingLeft:'1vh'}} key={val}>
                                        <input
                                        type="checkbox"
                                        checked={appliedFilters[filterName]?.includes(val) || false}
                                        onChange={(e) =>
                                            handleFilterChange(filterName, val, e.target.checked)
                                        }
                                        />
                                        {val} ({values[val]})
                                    </label>
                                ))}
                            </div>
                            ))}


                        </div>

                    </div>

                    <div className="productsContainer__gridCategoriesProducts__productsContainer">

                        <div className="productsContainer__gridCategoriesProducts__productsContainer__productsList">
                            {
                                isLoadingProducts ?
                                 <>
                                    <div className="catalogContainer__grid__catalog__isLoadingLabel">
                                        Cargando productos&nbsp;&nbsp;<Spinner/>
                                    </div>
                                </>
                                :
                                products.map((product) => (
                                    <ItemProduct
                                    user={user} 
                                    fetchCartByUserId={fetchCartByUserId}
                                    id={product._id}
                                    stock={product.stock}
                                    images={product.images}
                                    title={product.title}
                                    description={product.description}
                                    price={product.price}
                                    variantes={product.variantes}
                                    userCart={userCart}
                                    />
                                ))
                            }
                            <div className='cPanelProductsContainer__btnsPagesContainer'>
                                <button className='cPanelProductsContainer__btnsPagesContainer__btn'
                                    disabled={!pageInfo.hasPrevPage}
                                    onClick={() => fetchProducts(pageInfo.prevPage)}
                                    >
                                    Anterior
                                </button>
                                
                                <span>Página {pageInfo.page} de {pageInfo.totalPages}</span>

                                <button className='cPanelProductsContainer__btnsPagesContainer__btn'
                                    disabled={!pageInfo.hasNextPage}
                                    onClick={() => fetchProducts(pageInfo.nextPage)}
                                    >
                                    Siguiente
                                </button>
                            </div>
                        </div>

                    </div>
                
                </div>

            </div>}

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

export default ProductsContainer