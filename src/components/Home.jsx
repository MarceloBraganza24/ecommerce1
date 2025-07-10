import { useEffect,useState,useContext,useRef } from "react";
import NavBar from './NavBar'
import ItemProduct from './ItemProduct';
import { Link, useLocation,useNavigate } from "react-router-dom";
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

const Home = () => {
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useContext(IsLoggedContext);
    const firstRender = useRef(true);
    const [isScrollForced, setIsScrollForced] = useState(false);
    const [shouldScrollToHash, setShouldScrollToHash] = useState(false);
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_black.png');
    const [inputFilteredProducts, setInputFilteredProducts] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const [isLoadingSellerAddresses, setIsLoadingSellerAddresses] = useState(true);
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [isLoadingProductsByCategory, setIsLoadingProductsByCategory] = useState(true);
    const [products, setProducts] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState([]);
    const [totalProducts, setTotalProducts] = useState("");
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
    const [categories, setCategories] = useState([]);
    const [userCart, setUserCart] = useState({});
    const SERVER_URL = "http://localhost:8081/";
    const [selectedField, setSelectedField] = useState('title');
    
    const location = useLocation();

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        setIsScrollForced(true);
        const el = document.getElementById('catalogContainer');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
        const timeout = setTimeout(() => {
            setIsScrollForced(false);
        }, 1500);

        return () => clearTimeout(timeout);
    }, [pageInfo.page]);

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

    const fetchProducts = async (page = 1, search = "",field = "") => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/byPage?page=${page}&search=${search}&field=${field}`)
            const productsAll = await response.json();
            setTotalProducts(productsAll.data.totalDocs)
            setProducts(productsAll.data.docs)
            setPageInfo({
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

    const fetchProductsByCategory = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/products/grouped-by-category');
            const data = await response.json();
            if (response.ok) {
                setProductsByCategory(data.data); 
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
            setIsLoadingProductsByCategory(false)
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProductsByCategory();
        fetchCurrentUser();
        fetchProducts();
        fetchStoreSettings();
        fetchSellerAddresses();
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
            
            <div className="homeContainer" /* style={{backgroundImage: `url(http://localhost:8081/${storeSettings?.siteImages?.homeImage || ''})`}} */>
                <div className="homeContainer__img">
                    <img className="homeContainer__img__prop" src={`http://localhost:8081/${storeSettings?.siteImages?.homeImage}`} alt="" />
                </div>
            </div>

            {
                storeSettings?.sliderLogos?.length != 0 &&

                <div className="slider-logos">

                    <div className="slider-logos__logo-slider">
                        <div className="slider-logos__logo-slider__slider-track">
                            {storeSettings?.sliderLogos?.concat(storeSettings?.sliderLogos).map((logo, index) => (
                                <div key={index} className="slider-logos__logo-slider__slider-track__slide">
                                <img className="slider-logos__logo-slider__slider-track__slide__img" src={`${SERVER_URL}${logo}`} alt={logo.alt} />
                            </div>
                            ))}
                        </div>
                    </div>

                </div>
            }

            <div className='catalogContainer' id="catalogContainer">

                <div className="catalogContainer__titleContainer">
                    <div className='catalogContainer__titleContainer__title'>
                        <div className='catalogContainer__titleContainer__title__prop'>CATÁLOGO</div>
                    </div>
                </div>

                <div className="catalogContainer__gridCategoriesProducts">

                    <div className="catalogContainer__gridCategoriesProducts__categoriesContainer">

                        <div className="catalogContainer__gridCategoriesProducts__categoriesContainer__categories">

                            <div className="catalogContainer__gridCategoriesProducts__categoriesContainer__categories__title">Categorías</div>
                            {
                                categories.map((category) => (
                                <Link
                                    key={category._id}
                                    to={`/category/${category.name.toLowerCase()}`}
                                    className='catalogContainer__gridCategoriesProducts__categoriesContainer__categories__itemCategory'
                                >
                                    - {category.name.toUpperCase()}
                                </Link>
                                ))
                            }
                        </div>

                    </div>

                    <div className="catalogContainer__gridCategoriesProducts__productsContainer">

                        <div className="catalogContainer__gridCategoriesProducts__productsContainer__productsList">
                            {
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
                                    onClick={() => fetchProducts(pageInfo.prevPage, inputFilteredProducts, selectedField)}
                                    >
                                    Anterior
                                </button>
                                
                                <span>Página {pageInfo.page} de {pageInfo.totalPages}</span>

                                <button className='cPanelProductsContainer__btnsPagesContainer__btn'
                                    disabled={!pageInfo.hasNextPage}
                                    onClick={() => fetchProducts(pageInfo.nextPage, inputFilteredProducts, selectedField)}
                                    >
                                    Siguiente
                                </button>
                            </div>
                        </div>

                    </div>
                
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

export default Home