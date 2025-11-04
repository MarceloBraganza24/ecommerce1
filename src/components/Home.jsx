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
import NavbarMobile from "./NavbarMobile.jsx";
import FeaturedProducts from "./FeaturedProducts.jsx";
import BrandsSection from "./BrandsSection.jsx";
import cartWhiteIcon from '../assets/cart_white.png';
import cartBlackIcon from '../assets/cart_black.png';

const Home = () => {
    const [brands, setBrands] = useState([]);
    const [activeBrand, setActiveBrand] = useState("");
    const [brandProducts, setBrandProducts] = useState([]);

    const scrollRefLatestNews = useRef(null);
    const scrollRefBrands = useRef(null);
    const navigate = useNavigate();

    const [latestNews, setLatestNews] = useState({});
    const [activeTabLatestNews, setActiveTabLatestNews] = useState("");
    
    const [rootCategories, setRootCategories] = useState([]);
    const [rootCategoriesTree, setRootCategoriesTree] = useState([]);
    const [categoriesTree, setCategoriesTree] = useState([]);

    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useAuth();
    const firstRender = useRef(true);
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
    const [isLoadingLatestNews, setIsLoadingLatestNews] = useState(false);
    const [cartIcon, setCartIcon] = useState(`${cartWhiteIcon}`);
    const [isVisible, setIsVisible] = useState(false);
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const [isLoadingSellerAddresses, setIsLoadingSellerAddresses] = useState(true);
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [isLoadingProductsByCategory, setIsLoadingProductsByCategory] = useState(true);
    const [products, setProducts] = useState([]);
    const [isScrollForced, setIsScrollForced] = useState(false);
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

            if (res.ok) {
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
            setCartIcon(claro ? `${cartBlackIcon}` : `${cartWhiteIcon}`);
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

    const fetchRootCategories = async () => {
        try {
            const res = await fetch(`${SERVER_URL}api/categories/flat`);
            const categories = await res.json();
            const rootCats = categories.filter(cat => !cat.parent); // solo padres
            setRootCategories(rootCats);
        } catch (error) {
            console.error(error);
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
        fetchRootCategories();
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
        //console.log(product.images)
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
                    src={`${product.images[0]?.trim()}`}
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

                    <div className="product-card__props__labels" onClick={handleRedirectToItemDetailProduct}>Precio: <strong className="product-card__props__labels__price">${price}</strong></div>
                    <div className="product-card__props__labels" onClick={handleRedirectToItemDetailProduct}>
                        {
                            stock === 0 ? (
                                <strong>Sin stock</strong>
                            ) : (
                                <>
                                Stock disponible: <span>{stock <= 10 ? stock : '+10'}</span>
                                </>
                            )
                        }
                    </div>

                </div>

            </div>

        );
    }

    const handleRedirectToProducts = (categoryId) => {
        navigate("/products", { state: { categoryId } });
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

            <NavbarMobile
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

            <FeaturedProducts/>

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
                            <img className="categoriesExplored__grid__left__categoryImg__prop" onClick={()=>handleRedirectToProducts(rootCategories[0]._id)} src={`${rootCategories[0]?.image}`} alt={rootCategories[0]?.name} />
                            <div className="categoriesExplored__grid__left__categoryImg__label">
                                {rootCategories[0]?.name}
                            </div>
                        </div>
                    </div>

                    <div className="categoriesExplored__grid__right">
                        {rootCategories.length > 1 && (
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
                                style={{padding: "1vh 1vh"}}
                                >
                                {rootCategoriesTree.slice(1).map((category) => (
                                    <>
                                    <SwiperSlide key={category._id} >
                                    <div className="categoriesExplored__grid__right__category">
                                        <div className="categoriesExplored__grid__right__category__img">
                                            <img
                                            className="categoriesExplored__grid__right__category__img__prop"
                                            src={`${category.image}`}
                                            alt={category.name}
                                            onClick={()=>handleRedirectToProducts(category._id)}
                                            />
                                        </div>
                                        <div className="categoriesExplored__grid__right__category__name">
                                            <div className="categoriesExplored__grid__right__category__name__prop">{category.name}</div>
                                        </div>
                                    </div>
                                    </SwiperSlide>
                                    </>
                                ))}
                            </Swiper>
                            </>
                        )}
                    </div>

                </div>

                <div className="categoriesExplored__gridMobile">

                    <div className="categoriesExplored__gridMobile__left">
                        <div className="categoriesExplored__gridMobile__left__categoryImg">
                            <img className="categoriesExplored__gridMobile__left__categoryImg__prop" onClick={()=>handleRedirectToProducts(rootCategories[0]._id)} src={`${rootCategories[0]?.image}`} alt={rootCategories[0]?.name} />
                            <div className="categoriesExplored__gridMobile__left__categoryImg__label">
                                {rootCategories[0]?.name}
                            </div>
                        </div>
                    </div>

                    <div className="categoriesExplored__gridMobile__right">
                        {rootCategories.length > 1 && (
                            <>
                            <Swiper
                                modules={[Navigation, Pagination, Grid, Autoplay]}
                                navigation
                                autoplay={{ delay: 3000, disableOnInteraction: true }}
                                pagination={{ clickable: true }}
                                spaceBetween={20}
                                slidesPerView={2}        // 🔹 mostramos 9 categorías a la vez
                                slidesPerGroup={1}       // 🔹 que avance de a 1
                                grid={{ rows: 1, fill: "row" }} // 🔹 grid de 3 filas
                                style={{padding: "1vh 1vh"}}
                                >
                                {rootCategoriesTree.slice(1).map((category) => (
                                    <SwiperSlide key={category._id} >
                                    <div className="categoriesExplored__gridMobile__right__category">
                                        <div className="categoriesExplored__gridMobile__right__category__img">
                                            <img
                                            className="categoriesExplored__gridMobile__right__category__img__prop"
                                            src={`${category.image}`}
                                            alt={category.name}
                                            onClick={()=>handleRedirectToProducts(category._id)}
                                            />
                                        </div>
                                        <div className="categoriesExplored__gridMobile__right__category__name">
                                            <div className="categoriesExplored__gridMobile__right__category__name__prop">{category.name}</div>
                                        </div>
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

            <div className="informationStripMobile">

                <Swiper
                    modules={[Pagination]}
                    pagination={{ clickable: true }}
                    spaceBetween={10}
                    slidesPerView={1}       // ✅ solo un slide por vista
                    >
                    {storeSettings?.storeInfoBoxes?.map((box, i) => (
                        <SwiperSlide key={i} className="informationStripMobile__swipper">
                        <div className="informationStripMobile__grid__box">
                            <div className="informationStripMobile__grid__box__img">
                            {box.icon && (
                                <img
                                className="informationStripMobile__grid__box__img__prop"
                                src={box.icon}
                                alt=""
                                />
                            )}
                            </div>
                            <div className="informationStripMobile__grid__box__info">
                            <h4 className="informationStripMobile__grid__box__info__h4">{box.title}</h4>
                            <p className="informationStripMobile__grid__box__info__p">{box.description}</p>
                            </div>
                        </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

            </div>
            

            <div className="latestNews-products">
                <div className="latestNews-products__title">
                    <div className="latestNews-products__title__prop">Conocé nuestras <strong>últimas novedades</strong></div>
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

                <div className="product-grid-containerMobile">
                    <div className="product-grid-containerMobile__product-grid">
                        {activeTabLatestNews && latestNews[activeTabLatestNews] && (
                            <Swiper
                            modules={[Navigation, Pagination, Grid, Autoplay]}
                            navigation
                            autoplay={{ delay: 3000, disableOnInteraction: true }}
                            pagination={{ clickable: true }}
                            spaceBetween={12}
                            slidesPerView={1}        // 🔹 mostramos 9 categorías a la vez
                            slidesPerGroup={1}       // 🔹 que avance de a 1
                            grid={{ rows: 2, fill: "row" }} // 🔹 grid de 3 filas
                            style={{padding: "1vh 1vh"}}
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

                <div className="product-grid-container">
                    <div className="product-grid-container__product-grid">
                        {activeTabLatestNews && latestNews[activeTabLatestNews] && (
                            <Swiper
                            modules={[Navigation, Pagination, Grid, Autoplay]}
                            navigation
                            autoplay={{ delay: 3000, disableOnInteraction: true }}
                            pagination={{ clickable: true }}
                            spaceBetween={12}
                            slidesPerView={3}        // 🔹 mostramos 9 categorías a la vez
                            slidesPerGroup={1}       // 🔹 que avance de a 1
                            grid={{ rows: 2, fill: "row" }} // 🔹 grid de 3 filas
                            style={{padding: "1vh 1vh"}}
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

                <div className="product-grid-containerTablet">
                    <div className="product-grid-containerTablet__product-grid">
                        {activeTabLatestNews && latestNews[activeTabLatestNews] && (
                            <Swiper
                            modules={[Navigation, Pagination, Grid, Autoplay]}
                            navigation
                            autoplay={{ delay: 3000, disableOnInteraction: true }}
                            pagination={{ clickable: true }}
                            spaceBetween={12}
                            slidesPerView={2}        // 🔹 mostramos 9 categorías a la vez
                            slidesPerGroup={1}       // 🔹 que avance de a 1
                            grid={{ rows: 2, fill: "row" }} // 🔹 grid de 3 filas
                            style={{padding: "1vh 1vh"}}
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

                <BrandsSection/>

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

export default Home