import { useEffect,useState,useContext,useRef } from "react";
import NavBar from './NavBar'
import ItemProduct from './ItemProduct';
import { Link, useLocation,useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { toast } from 'react-toastify';

import BtnGoUp from "./BtnGoUp";
import Spinner from "./Spinner";
import { useAuth } from '../context/AuthContext';
import CategoriesPage from './CategoriesPage.jsx';
import OffersSlider from './OffersSlider.jsx';

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/grid";
import { Navigation, Pagination,Autoplay,Grid  } from "swiper/modules";

const Home = () => {
    const [brands, setBrands] = useState([]);
    const [activeBrand, setActiveBrand] = useState("");
    const [brandProducts, setBrandProducts] = useState([]);

    const scrollRef = useRef(null);
    const scrollRefLatestNews = useRef(null);
    const scrollRefBrands = useRef(null);
    const navigate = useNavigate();

    const [featured, setFeatured] = useState({});
    const [activeTab, setActiveTab] = useState("");
    const [latestNews, setLatestNews] = useState({});
    const [activeTabLatestNews, setActiveTabLatestNews] = useState("");
    
    const [rootCategories, setRootCategories] = useState([]);
    const [rootCategoriesTree, setRootCategoriesTree] = useState([]);
    const [categoriesTree, setCategoriesTree] = useState([]);

    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useAuth();
    const firstRender = useRef(true);
    const [isScrollForced, setIsScrollForced] = useState(false);
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
    const [isLoadingLatestNews, setIsLoadingLatestNews] = useState(false);
    const [cartIcon, setCartIcon] = useState('/src/assets/cart_white.png');
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
    const SERVER_URL = import.meta.env.VITE_API_URL;
    
    const location = useLocation();

    const fetchBrands = async () => {
        const res = await fetch(`${SERVER_URL}api/products/brands`);
        const data = await res.json();
        if (res.ok) {
            setBrands(data.payload || []);
            setActiveBrand(data.payload[0] || ""); // primera marca activa
        }
    };

    const fetchProductsByBrand = async (brand) => {
        const res = await fetch(`${SERVER_URL}api/products/by-brand/${encodeURIComponent(brand)}`);
        const data = await res.json();
        if (res.ok) setBrandProducts(data.payload || []);
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    useEffect(() => {
        if (activeBrand) fetchProductsByBrand(activeBrand);
    }, [activeBrand]);

    useEffect(() => {
        if (categoriesTree && categoriesTree.length > 0) {
            // Tomamos SOLO categorías raíz
            const roots = categoriesTree.filter(cat => !cat.parent);
            setRootCategoriesTree(roots);
        }
    }, [categoriesTree]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${SERVER_URL}api/categories/combined`);
            const data = await res.json();

            if (res.ok && data.status === "success") {
            setCategoriesTree(data.payload || []); // 🔹 ahora usamos payload en vez de tree
            } else {
            console.error("Error al cargar categorías:", data.message || data);
            }
        } catch (err) {
            console.error("Error al cargar categorías:", err);
        }
    };

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

    const fetchProducts = async (page = 1, search = "",field = "") => {
        try {
            const response = await fetch(`${SERVER_URL}api/products/byPage?page=${page}&search=${search}&field=${field}`)
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

    const fetchFeatured = async () => {
        try {
            setIsLoadingFeatured(true);
            const response = await fetch(`${SERVER_URL}api/products/featured`)
            const productsAll = await response.json();
            if(response.ok) {
                setFeatured(productsAll.payload)
                setActiveTab(Object.keys(productsAll.payload)[0] || "");
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        } finally {
            setIsLoadingFeatured(false);
        }
    };

    const fetchLatestNews = async () => {
        setIsLoadingLatestNews(true);
        try {
            const response = await fetch(`${SERVER_URL}api/products/latest-news`);

            // Intentamos parsear JSON aunque sea un error
            const data = await response.json().catch(() => ({}));

            if (response.ok && data.status === "success") {
            setLatestNews(data.payload);
            setActiveTabLatestNews(Object.keys(data.payload)[0] || "");
            } else {
            console.error("Error al obtener productos:", data.message || data);
            }
        } catch (error) {
            console.error('Error de fetch o network:', error);
        } finally {
            setIsLoadingLatestNews(false);
        }
    };

    // Función para dividir productos en grupos de 9
    const chunkArray = (arr, chunkSize) => {
        const result = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    };

    useEffect(() => {
        if (featured && Object.keys(featured).length > 0) {
            const roots = [];
            Object.keys(featured).forEach((key) => {
            const catProducts = featured[key];
            if (catProducts && catProducts.length > 0) {
                const category = catProducts[0].category;
                if (!category.parent) { // solo categorías raíz
                roots.push(category);
                }
            }
            });
            setRootCategories(roots);
        }
    }, [featured]);

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

    const fetchStoreSettings = async () => {
        try {
            const response = await fetch(`${SERVER_URL}api/settings`);
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
            const response = await fetch(`${SERVER_URL}api/products/grouped-by-category`);
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
        fetchFeatured();
        fetchLatestNews();
        fetchCurrentUser();
        fetchProducts();
        fetchStoreSettings();
        fetchSellerAddresses();
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

    function ProductCard({ product }) {
        const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

        const handleRedirectToItemDetailProduct = () => {
            window.location.href = `/item/${product._id}`
        }

        // Obtener precio y stock según variante o producto simple
        const price =
            product.variantes && product.variantes.length > 0
            ? product.variantes[selectedVariantIndex].price
            : product.price;

        const stock =
            product.variantes && product.variantes.length > 0
            ? product.variantes[selectedVariantIndex].stock
            : product.stock;

        return (
            <div className="product-card">

                <div className="product-card__img">
                    <img
                    src={`${SERVER_URL}${product.images[0]}`}
                    alt={product.title}
                    className="product-card__img__prop"
                    onClick={handleRedirectToItemDetailProduct}
                    />
                </div>

                <div className="product-card__props">

                    <div className="product-card__props__title" onClick={handleRedirectToItemDetailProduct}>
                        <div className="product-card__props__title__prop">{product.title}</div>
                    </div>

                    <div className="product-card__props__select">
                        {product.variantes && product.variantes.length > 0 && (
                            <select
                            className="product-card__props__select__prop"
                            value={selectedVariantIndex}
                            onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
                            >
                            {product.variantes.map((v, idx) => {
                                const label = Object.entries(v.campos || {})
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(" | ");
                                return (
                                    <option key={idx} value={idx}>
                                    {label || "Sin variante"}
                                </option>
                                );
                            })}
                            </select>
                        )}
                    </div>

                    <div className="product-card__props__labels" onClick={handleRedirectToItemDetailProduct}>Precio: ${price}</div>
                    <div className="product-card__props__labels" onClick={handleRedirectToItemDetailProduct}>
                        Stock disponible: {stock}
                    </div>

                </div>

            </div>

        );
    }

    const handleRedirectToProducts = (category) => {
        navigate("/products", { state: { category } });
    }

    const handleRedirectToBrand = (brand) => {
        navigate("/products", { state: { brand } });
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

            <OffersSlider />

            {
                storeSettings?.sliderLogos?.length != 0 &&

                <div className="slider-logos">

                    <div className="slider-logos__logo-slider">
                        <div className="slider-logos__logo-slider__slider-track">
                            {storeSettings?.sliderLogos?.concat(storeSettings?.sliderLogos).map((logo, index) => (
                                <div key={index} className="slider-logos__logo-slider__slider-track__slide">
                                <img className="slider-logos__logo-slider__slider-track__slide__img" src={`${logo}`} alt={logo.alt} />
                            </div>
                            ))}
                        </div>
                    </div>

                </div>
            }

            {

                isLoadingFeatured ? 
                <>
                    <div style={{backgroundColor:'#EFEFEF',padding:'10vh 0vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <Spinner/>
                    </div>
                </>
                :
                <>
                    <div className="featured-products">
                        <div className="featured-products__title">
                            <div className="featured-products__title__prop">Conocé nuestros <strong>productos destacados</strong></div>
                        </div>
                        <div className="tabsContainer">

                            <div className="tabsContainer__tabs">

                                <button
                                    style={{paddingRight:'1.5vh'}}
                                    className="tabsContainer__tabs__scrollButton left"
                                    onClick={() => {
                                    scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
                                    }}
                                >
                                    ◀
                                </button>

                                <div className="tabsContainer__tabs__buttonContainer" ref={scrollRef}>
                                    {Object.keys(featured).map((category) => (
                                    <button
                                        key={category}
                                        className={activeTab === category ? "active" : ""}
                                        onClick={() => setActiveTab(category)}
                                    >
                                        {category}
                                    </button>
                                    ))}
                                </div>

                                <button
                                    style={{paddingLeft:'1.5vh'}}
                                    className="tabsContainer__tabs__scrollButton right"
                                    onClick={() => {
                                    scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
                                    }}
                                >
                                    ▶
                                </button>
                                
                            </div>

                        </div>

                        <div className="product-grid-container">
                            <div className="product-grid-container__product-grid">
                                {activeTab && featured[activeTab] && (
                                    <Swiper
                                    modules={[Navigation, Pagination, Grid, Autoplay]}
                                    navigation
                                    autoplay={{ delay: 3000, disableOnInteraction: true }}
                                    pagination={{ clickable: true }}
                                    spaceBetween={15}
                                    slidesPerView={3}        // 🔹 mostramos 9 categorías a la vez
                                    slidesPerGroup={1}       // 🔹 que avance de a 1
                                    grid={{ rows: 2, fill: "row" }} // 🔹 grid de 3 filas
                                    >
                                    {chunkArray(featured[activeTab], 1).map((page, idx) => (
                                        <SwiperSlide key={idx}>
                                            <div>
                                                {page.map((product) => (
                                                    <ProductCard key={product._id} product={product} />
                                                ))}
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                    </Swiper>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="linkToAboutPagContainer">
                        <div
                            className="linkToAboutPagContainer__imgContainer"
                            style={{
                                backgroundImage: `url("${storeSettings?.siteImages?.aboutImage}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}
                        >
                            <div className="linkToAboutPagContainer__imgContainer__phrase">
                                <div onClick={()=>window.location.href='/about'} className='linkToAboutPagContainer__imgContainer__phrase__prop'>
                                    Conocé más sobre nosotros
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="categoriesExplored">

                        <div className="categoriesExplored__title">
                            <div className="categoriesExplored__title__prop">Explorá nuestras <strong>categorías</strong></div>
                        </div>

                        <div className="categoriesExplored__grid">

                            <div className="categoriesExplored__grid__left">
                                <div className="categoriesExplored__grid__left__categoryImg">
                                    <img className="categoriesExplored__grid__left__categoryImg__prop" onClick={()=>handleRedirectToProducts(rootCategories[0])} src={`${rootCategories[0]?.image}`} alt="category" />
                                </div>
                            </div>

                            <div className="categoriesExplored__grid__right">
                                {rootCategoriesTree.length > 1 && (
                                    <>
                                    <Swiper
                                        modules={[Navigation, Pagination, Grid, Autoplay]}
                                        navigation
                                        autoplay={{ delay: 3000, disableOnInteraction: true }}
                                        pagination={{ clickable: true }}
                                        spaceBetween={20}
                                        slidesPerView={4}        // 🔹 mostramos 9 categorías a la vez
                                        slidesPerGroup={1}       // 🔹 que avance de a 1
                                        grid={{ rows: 2, fill: "row" }} // 🔹 grid de 3 filas
                                        >
                                        {rootCategoriesTree.slice(1).map((category) => (
                                            <SwiperSlide key={category._id}>
                                            <div className="categoriesExplored__grid__right__category">
                                                <img
                                                className="categoriesExplored__grid__right__category__img"
                                                src={`${category.image}`}
                                                alt={category.name}
                                                onClick={()=>handleRedirectToProducts(category)}
                                                />
                                            </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    </>
                                )}
                            </div>

                        </div>
                    
                    </div>

                    <div className="informationStrip">

                        <div className="informationStrip__grid">

                            {storeSettings?.storeInfoBoxes?.map((box, i) => (
                            <div key={i} className="informationStrip__grid__box">

                                <div className="informationStrip__grid__box__img">
                                    {box.icon && <img className="informationStrip__grid__box__img__prop" src={`${box.icon}`} alt="" />}
                                </div>
                                <div className="informationStrip__grid__box__info">
                                    <h4 className="informationStrip__grid__box__info__h4">{box.title}</h4>
                                    <p className="informationStrip__grid__box__info__p">{box.description}</p>
                                </div>

                            </div>
                            ))}

                        </div>

                    </div>

                    <div className="featured-products">
                        <div className="featured-products__title">
                            <div className="featured-products__title__prop">Conocé nuestras <strong>últimas novedades</strong></div>
                        </div>
                        <div className="tabsContainer">

                            <div className="tabsContainer__tabs">

                                <button
                                    style={{paddingRight:'1.5vh'}}
                                    className="tabsContainer__tabs__scrollButton left"
                                    onClick={() => {
                                    scrollRefLatestNews.current.scrollBy({ left: -200, behavior: "smooth" });
                                    }}
                                >
                                    ◀
                                </button>

                                <div className="tabsContainer__tabs__buttonContainer" ref={scrollRefLatestNews}>
                                    {Object.keys(latestNews).map((category) => (
                                    <button
                                        key={category}
                                        className={activeTabLatestNews === category ? "active" : ""}
                                        onClick={() => setActiveTabLatestNews(category)}
                                    >
                                        {category}
                                    </button>
                                    ))}
                                </div>

                                <button
                                    style={{paddingLeft:'1.5vh'}}
                                    className="tabsContainer__tabs__scrollButton right"
                                    onClick={() => {
                                    scrollRefLatestNews.current.scrollBy({ left: 200, behavior: "smooth" });
                                    }}
                                >
                                    ▶
                                </button>
                                
                            </div>

                        </div>

                        <div className="product-grid-container">
                            <div className="product-grid-container__product-grid">
                                {activeTabLatestNews && latestNews[activeTabLatestNews] && (
                                    <Swiper
                                    modules={[Navigation, Pagination, Grid, Autoplay]}
                                    navigation
                                    autoplay={{ delay: 3000, disableOnInteraction: true }}
                                    pagination={{ clickable: true }}
                                    spaceBetween={15}
                                    slidesPerView={3}        // 🔹 mostramos 9 categorías a la vez
                                    slidesPerGroup={1}       // 🔹 que avance de a 1
                                    grid={{ rows: 2, fill: "row" }} // 🔹 grid de 3 filas
                                    >
                                    {chunkArray(latestNews[activeTabLatestNews], 1).map((page, idx) => (
                                        <SwiperSlide key={idx}>
                                            <div>
                                                {page.map((product) => (
                                                    <ProductCard key={product._id} product={product} />
                                                ))}
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                    </Swiper>
                                )}
                            </div>
                        </div>

                        <div className="separatorWhite"></div>

                        <div className="brandsExplored">

                            <div className="brandsExplored__title">
                                <div className="brandsExplored__title__prop">Descubrí las <strong>mejores marcas</strong></div>
                            </div>

                            <div className="tabsContainer">

                                <div className="tabsContainer__tabs">

                                    <button
                                        style={{paddingRight:'1.5vh'}}
                                        className="tabsContainer__tabs__scrollButton left"
                                        onClick={() => {
                                        scrollRefBrands.current.scrollBy({ left: -200, behavior: "smooth" });
                                        }}
                                    >
                                        ◀
                                    </button>

                                    <div className="tabsContainer__tabs__buttonContainer" ref={scrollRefBrands}>
                                        {brands.map((brand) => (
                                        <button
                                            key={brand}
                                            className={activeBrand === brand ? "active" : ""}
                                            onClick={() => setActiveBrand(brand)}
                                        >
                                            {brand}
                                        </button>
                                        ))}
                                    </div>

                                    <button
                                        style={{paddingLeft:'1.5vh'}}
                                        className="tabsContainer__tabs__scrollButton right"
                                        onClick={() => {
                                        scrollRefBrands.current.scrollBy({ left: 200, behavior: "smooth" });
                                        }}
                                    >
                                        ▶
                                    </button>
                                    
                                </div>

                            </div>

                            <div className="brandsExplored__grid">

                                <div className="brandsExplored__grid__left">
                                    <div className="brandsExplored__grid__left__categoryImg">
                                        <img className="brandsExplored__grid__left__categoryImg__prop" onClick={() => handleRedirectToBrand(activeBrand)} src={`${SERVER_URL}${brandProducts[0]?.images?.[0]}`} alt={brandProducts[0]?.title || "producto"} />
                                    </div>
                                </div>

                                <div className="brandsExplored__grid__right">
                                    {brandProducts.length > 0 && (
                                        <Swiper
                                        modules={[Navigation, Pagination, Autoplay]}
                                        navigation
                                        autoplay={{ delay: 3000, disableOnInteraction: true }}
                                        pagination={{ clickable: true }}
                                        spaceBetween={150}
                                        slidesPerView={4}    // cantidad de productos visibles
                                        slidesPerGroup={1}   // avanza de a 1
                                        >
                                        {brandProducts.map((product) => (
                                            <SwiperSlide key={product._id}>
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
                                            </SwiperSlide>
                                        ))}
                                        </Swiper>
                                    )}
                                </div>


                            </div>
                        
                        </div>

                    </div>

                </>
            }

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

export default Home