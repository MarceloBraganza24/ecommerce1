import {useContext,useState,useEffect} from 'react'
import SmartLink from './SmartLink'
import { User,Search,X,LogOut } from "lucide-react";
import { Link,useNavigate  } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const NavbarMobile = ({user,setSelectedAddress,setUser,isLoadingAuth,isScrollForced,products,cartIcon,hexToRgba,primaryColor,userCart,logo_store,storeName,isLoggedIn,categories,isLoading,role,first_name,cookieValue,fetchUser,setShowLogOutContainer,showLogOutContainer}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [quantity, setQuantity] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [showInputSearch, setShowInputSearch] = useState(false);
    const SERVER_URL = import.meta.env.VITE_API_URL;
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [forcedShow, setForcedShow] = useState(false);
    const [showHMenuOptions, setShowHMenuOptions] = useState(false);
    const navigate = useNavigate();
    const { logout,loadingFetchLogOut } = useAuth();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const iconSize = windowWidth < 640 ? 20 : windowWidth < 769 ? 24 : 30;

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!userCart || !Array.isArray(userCart.products)) {
                setQuantity(0);
                setIsLoadingUser(false);
            }
        }, 1000);
        if (Array.isArray(userCart.products)) {
            const totalCount = userCart.products.reduce((sum, p) => sum + p.quantity, 0);
            setQuantity(totalCount);
            setIsLoadingUser(false);
            clearTimeout(timeout); // Cancela el timeout si ya tenemos info
        }
        return () => clearTimeout(timeout); // Limpieza por si desmonta
    }, [userCart]);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleBtnSearchProducts = () => {
        if(showInputSearch) {
            setShowInputSearch(false)
        } else {
            setShowInputSearch(true)
        }
    };

    useEffect(() => {
        if (searchTerm.trim().length === 0) {
            setFilteredProducts([]);
            setShowDropdown(false);
            return;
        }

        const fetchFilteredProducts = async () => {
            try {
                const res = await fetch(`${SERVER_URL}api/products/navbar-search?search=${searchTerm}`)
                const data = await res.json();
                setFilteredProducts(data.data); // si usás paginación con mongoose-paginate
                setShowDropdown(data.data.length > 0);
            } catch (err) {
                console.error('Error al buscar productos:', err);
            }
        };

        const timeout = setTimeout(fetchFilteredProducts, 300); // debounce
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (isScrollForced) {
                // 👇 Nunca mostrar navbar si está forzado oculto
                if (showNavbar) setShowNavbar(false);
                return;
            }

            if (forcedShow) return;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setShowNavbar(false); // scroll hacia abajo
                setShowInputSearch(false)
                setShowHMenuOptions(false)
            } else {
                setShowNavbar(true); // scroll hacia arriba
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY, forcedShow,isScrollForced]);

    const handleTabClick = () => {
        setShowNavbar(true);
        setForcedShow(true);

        // Opcional: después de 5 segundos, permitir que vuelva a ocultarse con scroll
        setTimeout(() => {
            setForcedShow(false);
        }, 1500);
    };

    const handleBtnShowHMenuOptions = () => {

        if(showHMenuOptions) {
            setShowHMenuOptions(false)
        } else {
            setShowHMenuOptions(true)
        }

    }

    const handleIconLogin = () => {
        navigate("/login");
    }

    const handleIconCart = () => {
        if(!user) {
            toast('Debes iniciar sesión para ver tu carrito!', {
                position: "top-right",
                autoClose: 1500,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
        navigate("/cart");
    }

    const handleBtnLogOut = async () => {
        const success = await logout();
        if (success) {
            navigate("/");
            toast('Gracias por visitar nuestra página', {
                position: "top-right",
                autoClose: 1500,
                theme: "dark",
                className: "custom-toast",
            });
        }
    }

    return (

        <>

            <div className={`headerMobile ${showNavbar ? "headerMobile__show" : "headerMobile__hide"}`}>

                <div className='headerMobile__left'>

                    <div className='headerMobile__left__hMenuContainer'>

                        <div onClick={handleBtnShowHMenuOptions} className='headerMobile__left__hMenuContainer__hMenu'>
                            <div className='headerMobile__left__hMenuContainer__hMenu__line'></div>
                            <div className='headerMobile__left__hMenuContainer__hMenu__line'></div>
                            <div className='headerMobile__left__hMenuContainer__hMenu__line'></div>
                        </div>

                    </div>

                    <div className='headerMobile__left__logoContainer'>
                        <SmartLink to={'/'} className='headerMobile__left__logoContainer__logo'>
                            {logo_store ? (
                                <img
                                className='headerMobile__left__logoContainer__logo__prop'
                                src={`${logo_store}`}
                                alt='logo_tienda'
                                />
                            ) : null}
                        </SmartLink>
                    </div>

                </div>

                <div className='headerMobile__right'>

                    <div className='headerMobile__right__icons'>

                        <div onClick={handleBtnSearchProducts} className='headerMobile__right__icons__icon'>
                            {
                                showInputSearch ?
                                <>
                                    <X size={iconSize}/>
                                </>
                                :
                                <Search size={iconSize}/>
                            }
                        </div>

                        <div className='headerMobile__right__icons__icon'>
                            {!isLoadingAuth && (
                                isLoggedIn ? <LogOut onClick={handleBtnLogOut} size={iconSize} /> : <User onClick={handleIconLogin} size={iconSize} />
                            )}
                        </div>

                        <div className='headerMobile__right__icons__iconCart'>
                            <img
                            onClick={handleIconCart}
                            className='headerMobile__right__icons__iconCart__prop'
                            src={cartIcon}
                            alt=''
                            />
                            <div className='headerMobile__right__icons__iconCart__number'>
                                {!isLoggedIn || isLoggedIn === undefined ? 0 : quantity}
                            </div>
                        </div>

                    </div>

                </div>


            </div>

            {
                showHMenuOptions &&

                <div className={`hMenuOptionsContainer ${showHMenuOptions ? 'active' : ''}`}>
                    <div className='hMenuOptionsContainer__btnCloseMenu'>
                        <div onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__btnCloseMenu__btn'>X</div>
                    </div>

                    {role === 'admin' ? (
                        <>
                            <Link to={`/cpanel/products`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PANEL DE PRODUCTOS</Link>
                            <Link to={`/tickets`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- VENTAS</Link>
                            <Link to={`/products`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PRODUCTOS</Link>
                            <Link to={`/favorites`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- FAVORITOS</Link>
                            <Link to={`/about`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- SOBRE NOSOTROS</Link>
                            <Link to={`/contact`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- CONTACTO</Link>
                            <Link to={`/cpanel`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PANEL DE CONTROL</Link>
                            <Link to={`/bin`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PAPELERA</Link>
                        </>
                    ) :
                    role === 'premium' ? (
                        <>
                            <Link to={`/cpanel/products`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PANEL DE PRODUCTOS</Link>
                            <Link to={`/tickets`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- VENTAS</Link>
                            <Link to={`/products`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PRODUCTOS</Link>
                            <Link to={`/favorites`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- FAVORITOS</Link>
                            <Link to={`/about`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- SOBRE NOSOTROS</Link>
                            <Link to={`/contact`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- CONTACTO</Link>
                            <Link to={`/bin`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PAPELERA</Link>
                        </>
                    )
                    :
                    role === 'user' ? (
                        <>
                        <Link to={`/products`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PRODUCTOS</Link>
                        <Link to={`/favorites`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- FAVORITOS</Link>
                        <Link to={`/myPurchases`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- MIS COMPRAS</Link>
                        <Link to={`/about`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- SOBRE NOSOTROS</Link>
                        <Link to={`/contact`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- CONTACTO</Link>
                        </>
                    )
                    : (
                        <>
                        <Link to={`/products`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PRODUCTOS</Link>
                        <Link to={`/about`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- SOBRE NOSOTROS</Link>
                        <Link to={`/contact`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- CONTACTO</Link>
                        <Link to={`/login`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- INICIAR SESIÓN</Link>
                        </>
                    )}
                </div>
            }

            {
                showInputSearch &&

                <div className='headerMobile__inputSearchContainer'>

                    <div className='headerMobile__inputSearchContainer__input'>
                        <input
                            className='headerMobile__inputSearchContainer__input__prop'
                            placeholder='Buscar productos'
                            type='text'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setShowDropdown(filteredProducts.length > 0)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // da tiempo para hacer click
                            />
                    </div>

                    {showDropdown && (
                        <div className='headerMobile__inputSearchContainer__productsListContainer'>
                            {filteredProducts.map((product) => (
                                <div
                                    key={product._id}
                                    className='headerMobile__inputSearchContainer__productsListContainer__productItem'
                                    onClick={() => navigate(`/item/${product._id}`)}
                                >
                                    <div className='headerMobile__inputSearchContainer__productsListContainer__productItem__image'>
                                        <img
                                        src={`${product.images?.[0]}` || '/default-image.jpg'}
                                        alt={product.title}
                                        className='headerMobile__inputSearchContainer__productsListContainer__productItem__image__prop'
                                        />
                                    </div>
                                    <div className='headerMobile__inputSearchContainer__productsListContainer__productItem__titleContainer'>
                                        <div className='headerMobile__inputSearchContainer__productsListContainer__productItem__titleContainer__descriptionEllipsis'>
                                            <div className='headerMobile__inputSearchContainer__productsListContainer__productItem__titleContainer__descriptionEllipsis__item'>{capitalizeFirstLetter(product.title)}</div>
                                        </div>
                                        <div className='headerMobile__inputSearchContainer__productsListContainer__productItem__titleContainer__descriptionEllipsis'>
                                            <div className='headerMobile__inputSearchContainer__productsListContainer__productItem__titleContainer__descriptionEllipsis__item'>{capitalizeFirstLetter(product.description)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            }
            {!showNavbar && (
                <div className="navbar-tab" onClick={handleTabClick} role="button" tabIndex={0} aria-label="Mostrar menú">
                ☰
                </div>
            )}

        </>

    )

}

export default NavbarMobile