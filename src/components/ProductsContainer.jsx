import { useEffect,useState,useContext,useRef } from "react";
import NavBar from './NavBar'
import ItemProduct from './ItemProduct';
import { Link, useLocation,useParams } from "react-router-dom";
import Footer from "./Footer";
import { toast } from 'react-toastify';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import BtnGoUp from "./BtnGoUp";
import Spinner from "./Spinner";
import { useAuth } from '../context/AuthContext';
import CategorySidebar from "./CategorySidebar";
import NavbarMobile from "./NavbarMobile.jsx";
import cartWhiteIcon from '../assets/cart_white.png';
import cartBlackIcon from '../assets/cart_black.png';

const ProductsContainer = () => {
    const location = useLocation();
    
    const DEFAULT_MIN = 0;
    const DEFAULT_MAX = 5000000;

    const [priceRange, setPriceRange] = useState({ min: DEFAULT_MIN, max: DEFAULT_MAX });
    const [sortOrder, setSortOrder] = useState("desc");
    
    const [sort, setSort] = useState("asc"); // asc | desc
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);

    //const initialCategoryId = location.state?.filters?.category || null;
    const initialCategoryId = location.state?.categoryId || null;
    const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);

    const [appliedFilters, setAppliedFilters] = useState(() => {
        if (location.state?.filters) {
            const filters = { ...location.state.filters };
            // Si venía category, lo sacamos de filters
            if (filters.category) delete filters.category;
            return filters;
        }
        return {};
    });

    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useAuth();
    const [isScrollForced, setIsScrollForced] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [cartIcon, setCartIcon] = useState(`${cartWhiteIcon}`);
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
    const SERVER_URL = import.meta.env.VITE_API_URL;

    
    const [products, setProducts] = useState([]);
    const [availableFilters, setAvailableFilters] = useState({});
    
    const [categories, setCategories] = useState([]);

    // 📌 Paginación
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);

    const [breadcrumb, setBreadcrumb] = useState([]);
    //console.log(breadcrumb)
   
    function findCategoryPath(tree, targetId, path = []) {
        for (const node of tree) {
            const newPath = [...path, node];
            if (String(node._id) === String(targetId)) {
            return newPath;
            }
            if (node.children && node.children.length > 0) {
            const found = findCategoryPath(node.children, targetId, newPath);
            if (found) return found;
            }
        }
        return null;
    }

    useEffect(() => {
        if (selectedCategory && categories.length > 0) {
            const path = findCategoryPath(categories, selectedCategory);
            setBreadcrumb(path || []);
        }
    }, [selectedCategory, categories]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pageInfo.page]);

    useEffect(() => {
        fetchProducts();
    }, [sort, minPrice, maxPrice]);

    const fetchCategoriesTree = async () => {
        try {
            const res = await fetch(`${SERVER_URL}api/categories/combined`);
            const data = await res.json();

            if (res.ok && data.status === "success") {
            setCategories(data.payload || []); // 🔹 ahora usamos payload en vez de tree
            } else {
            console.error("Error al cargar categorías:", data.message || data);
            }
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

    const fetchProducts = async (pageNumber = 1) => {
        try {
            setIsLoadingProducts(true);

            const body = {
                category: selectedCategory || null, // categoría por separado
                minPrice: priceRange.min,
                maxPrice: priceRange.max,
                sort: sortOrder || null,
                page: pageNumber,
                limit: limit,
                filters: appliedFilters,
                //brand: appliedFilters?.marca || null, 
            };

            const res = await fetch(`${SERVER_URL}api/products/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                setProducts(data.docs || []);
                setTotalPages(data.totalPages || 1);
                setAvailableFilters(data.availableFilters || {});
                setPageInfo({
                    page: data.page,
                    hasNextPage: data.hasNextPage,
                    hasPrevPage: data.hasPrevPage,
                    nextPage: data.nextPage,
                    prevPage: data.prevPage,
                    totalPages: data.totalPages,
                });
            } else {
                console.error("Error en la búsqueda:", data.error);
            }
        } catch (error) {
            console.error("Error en fetchProducts:", error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleFilterChange = (filterName, value, checked) => {
        setAppliedFilters((prev) => {
            const prevValues = prev[filterName] || [];

            let newValues;
            if (checked) {
                newValues = [...prevValues, value];  // 👈 sin toLowerCase
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

    const handleSelectCategory = (category) => {
        setSelectedCategory(category._id);
        setPriceRange({ min: 0, max: 5000000 });
    };

    const handleBtnShowFilters = () => {
        if(showFilters) {
            setShowFilters(false)
        } else {
            setShowFilters(true)
        }
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
        setSelectedCategory(null);
        setPriceRange({ min: DEFAULT_MIN, max: DEFAULT_MAX });
        setSortOrder("desc");
        setAppliedFilters({});
        setBreadcrumb([]);
    };

    const activeFiltersCount =
        Object.values(appliedFilters).reduce(
            (count, values) => count + (values?.length || 0),
            0
        ) +
        (selectedCategory ? 1 : 0) +
        (priceRange.min !== DEFAULT_MIN || priceRange.max !== DEFAULT_MAX ? 1 : 0);


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

            {<div className='productsContainer' id="catalogContainer">

                <div className="productsContainer__title">
                    Productos
                </div>

                
                <div className="productsContainer__routeSelect">

                    <div className="productsContainer__routeSelect__route">
                        {
                            breadcrumb.length > 0 &&
                            <span 
                            onClick={handleResetFilters} 
                            className="productsContainer__routeSelect__route__item"
                            >
                                Inicio
                            </span>
                        }
                        
                        {breadcrumb.map((cat, index) => (
                            <>
                            <span key={cat._id} className="productsContainer__routeSelect__route__item">
                                <span style={{ margin: "0 4px" }}>{'>'}</span>
                                <span
                                    className="breadcrumb__link"
                                    // 👇 pasar el objeto completo al hacer click
                                    onClick={() => setSelectedCategory(cat._id)}
                                    >
                                    {cat.name}
                                </span>
                            </span>
                            </>
                        ))}
                    </div>

                </div>

                <div className="productsContainer__gridCategoriesProducts">


                    <div className="productsContainer__gridCategoriesProducts__categoriesContainer">

                        <div className="productsContainer__gridCategoriesProducts__categoriesContainer__categories">

                            <div className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__btnDeleteFilters">
                                <button className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__btnDeleteFilters__btn" onClick={handleResetFilters}>Borrar filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</button>
                            </div>

                            <div>
                                <CategorySidebar onSelectCategory={handleSelectCategory} />
                            </div>

                            <div className="productsContainer__gridCategoriesProducts__btnShowFilters">
                                <div onClick={handleBtnShowFilters} className="productsContainer__gridCategoriesProducts__btnShowFilters__btn">{!showFilters?"Mostrar filtros":"Ocultar filtros"}</div>
                            </div>

                            {
                                showFilters &&

                                <>
                            
                                    <div className='productsContainer__gridCategoriesProducts__categoriesContainer__categories__priceFilter'> 
                                        <div className='productsContainer__gridCategoriesProducts__categoriesContainer__categories__priceFilter__title'>Filtrar por precio</div>
                                        <div className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__priceFilter__inputs">

                                            <input
                                            className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__priceFilter__inputs__input"
                                            type="number"
                                            placeholder="Precio mínimo"
                                            value={priceRange.min}
                                            onChange={(e) =>
                                                setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) || DEFAULT_MIN }))
                                            }
                                            />

                                            <input
                                            className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__priceFilter__inputs__input"
                                            type="number"
                                            placeholder="Precio máximo"
                                            value={priceRange.max}
                                            onChange={(e) =>
                                                setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) || DEFAULT_MAX }))
                                            }
                                            />
                                            
                                        </div>
                                        <p className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__priceFilter__label">Desde ${priceRange.min} hasta ${priceRange.max}</p>
                                    </div>

                                    {Object.entries(availableFilters || {}).map(([filterName, values]) => (
                                    <div key={filterName} className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__filters">
                                        <div className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__filters__label">{capitalizeFirstLetter(filterName)}</div>
                                        {Object.keys(values).map((val) => (
                                        <label className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__filters__labelInput" key={val}>
                                            <input
                                            className="productsContainer__gridCategoriesProducts__categoriesContainer__categories__filters__labelInput__input"
                                            type="checkbox"
                                            checked={appliedFilters[filterName]?.includes(val) || false}
                                            onChange={(e) => handleFilterChange(filterName, val, e.target.checked)}
                                            />
                                            {capitalizeFirstLetter(val)} ({values[val]})
                                        </label>
                                        ))}
                                    </div>
                                    ))}
                                    
                                </>
                            }


                        </div>

                    </div>

                    
                    
                    <div className="productsContainer__gridCategoriesProducts__productsContainer">

                        <div className='productsContainer__routeSelect__select'>
                            <select className='productsContainer__routeSelect__select__prop' value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                <option value="asc" className=''>Precio: menor a mayor</option>
                                <option value="desc" className=''>Precio: mayor a menor</option>
                            </select>
                        </div>
                        <div className="productsContainer__gridCategoriesProducts__productsContainer__productsList">
                            {
                            isLoadingProducts ? (
                                <div className="catalogContainer__grid__catalog__isLoadingLabel">
                                Cargando productos&nbsp;&nbsp;<Spinner />
                                </div>
                            ) : (
                                products.length > 0 ? (
                                <>
                                    {products.map((product) => (
                                    <ItemProduct
                                        key={product._id}
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
                                <div className="productsContainer__nonProducts">
                                    Aún no hay productos con los filtros seleccionados
                                </div>
                                )
                            )
                            }
                        </div>

                    </div>
                
                </div>

            </div>}

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

export default ProductsContainer