import {useContext,useState,useEffect} from 'react'
import { Link, useLocation,useNavigate } from 'react-router-dom'
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import SmartLink from './SmartLink';
import { fetchWithAuth } from '../components/FetchWithAuth';
import { useAuth } from '../context/AuthContext';

const NavBar = ({user,setSelectedAddress,setUser,isLoadingAuth,isScrollForced,products,cartIcon,hexToRgba,primaryColor,userCart,logo_store,storeName,isLoggedIn,categories,isLoading,role,first_name,cookieValue,fetchUser,setShowLogOutContainer,showLogOutContainer}) => {
    const location = useLocation();
    const { logout,loadingFetchLogOut } = useAuth();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [showCategories, setShowCategories] = useState(false);
    const [loadingBtnLogOut, setLoadingBtnLogOut] = useState(false);
    const SERVER_URL = import.meta.env.VITE_API_URL;

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [forcedShow, setForcedShow] = useState(false);

    const [showHMenuOptions, setShowHMenuOptions] = useState(false);

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
        
    const handleBtnShowHMenuOptions = () => {

        if(showHMenuOptions) {
            setShowHMenuOptions(false)
        } else {
            setShowHMenuOptions(true)
        }

    }

    useEffect(() => {
        const handleScrollShowHMenuOptions = () => setShowHMenuOptions(false);
        window.addEventListener("scroll", handleScrollShowHMenuOptions);
        return () => {
            window.removeEventListener("scroll", handleScrollShowHMenuOptions);
        } 
    }, []);

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


            <div className={`header ${showNavbar ? "header__show" : "header__hide"}`}>
                
                {
                    role &&
                    <div className='hMenuContainer'>
                            <div onClick={handleBtnShowHMenuOptions} className='hMenuContainer__hMenu'>
                                <div className='hMenuContainer__hMenu__line'></div>
                                <div className='hMenuContainer__hMenu__line'></div>
                                <div className='hMenuContainer__hMenu__line'></div>
                            </div>
                    </div>
                }

                <div className='header__gridUp'>

                    <div className='header__gridUp__inputSearch'>

                        <input
                            className='header__gridUp__inputSearch__input'
                            placeholder='Buscar productos'
                            type='text'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setShowDropdown(filteredProducts.length > 0)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // da tiempo para hacer click
                        />

                        {showDropdown && (
                            <div className='header__gridUp__inputSearch__productsListContainer'>
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        className='header__gridUp__inputSearch__productsListContainer__productItem'
                                        onClick={() => navigate(`/item/${product._id}`)}
                                    >
                                        <div className='header__gridUp__inputSearch__productsListContainer__productItem__image'>
                                            <img
                                            src={`${product.images?.[0]}` || '/default-image.jpg'}
                                            alt={product.title}
                                            className='header__gridUp__inputSearch__productsListContainer__productItem__image__prop'
                                            />
                                        </div>
                                        <div className='header__gridUp__inputSearch__productsListContainer__productItem__titleContainer'>
                                            <div className='header__gridUp__inputSearch__productsListContainer__productItem__titleContainer__descriptionEllipsis'>
                                                <div className='header__gridUp__inputSearch__productsListContainer__productItem__titleContainer__descriptionEllipsis__item'>{capitalizeFirstLetter(product.title)}</div>
                                            </div>
                                            <div className='header__gridUp__inputSearch__productsListContainer__productItem__titleContainer__descriptionEllipsis'>
                                                <div className='header__gridUp__inputSearch__productsListContainer__productItem__titleContainer__descriptionEllipsis__item'>{capitalizeFirstLetter(product.description)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    <SmartLink to={'/'} className='header__gridUp__logoContainer'>
                        {logo_store ? (
                            <img
                            className='header__gridUp__logoContainer__prop'
                            src={`${logo_store}`}
                            alt='logo_tienda'
                            />
                        ) : null}
                    </SmartLink>

                    <div className='header__gridUp__links'>

                        {
                            isLoadingAuth ?
                                null 
                            :
                            user ?
                                <>
                                    <div className='header__gridUp__links__itemName'>Bienvenido/a <br />{capitalizeFirstLetter(user.first_name)}</div>
                                    <div onClick={() => navigate('/cart')} className='header__gridUp__links__itemCart'>
                                        <img
                                        className='header__gridUp__links__itemCart__logo'
                                        src={cartIcon}
                                        alt=''
                                        />
                                        {isLoadingUser || quantity === null ? (
                                        <Spinner />
                                    ) : (
                                        <div className='header__gridUp__links__itemCart__number'>
                                            {!isLoggedIn || isLoggedIn === undefined ? 0 : quantity}
                                        </div>
                                        )}
                                    </div>
                                    {loadingFetchLogOut ? (
                                        <div
                                        disabled
                                        className='header__gridUp__links__itemLogOut'
                                        >
                                        <Spinner/>
                                        </div>
                                    ) : (
                                        <div
                                        onClick={handleBtnLogOut}
                                        className='header__gridUp__links__itemLogOut'
                                        >
                                        SALIR
                                        </div>
                                    )}
                                </>
                            :
                                <>
                                    <div className='header__gridUp__linksNoLogin'>
                                        <Link to='/logIn' className='header__gridUp__linksNoLogin__itemBorder'>
                                            INICIAR SESIÓN
                                        </Link>
                                        <Link to='/signIn' className='header__gridUp__linksNoLogin__item'>
                                            REGISTRARSE
                                        </Link>
                                    </div>
                                </>
                        }
                        

                    </div>

                </div>

                <div className='header__menu'>
                    <SmartLink to={'/'} className={`header__menu__item header__menu__itemBorder ${location.pathname === '/' ? 'activeLink' : ''}`}>
                        INICIO
                    </SmartLink>
                    <Link to='/favorites' className={`header__menu__item header__menu__itemBorder ${location.pathname === '/favorites' ? 'activeLink' : ''}`}>
                        FAVORITOS
                    </Link>
                    <Link to='/products' className={`header__menu__item header__menu__itemBorder ${location.pathname === '/favorites' ? 'activeLink' : ''}`}>
                        PRODUCTOS
                    </Link>
                    <Link to='/about' className={`header__menu__item header__menu__itemBorder ${location.pathname === '/about' ? 'activeLink' : ''}`}>
                        SOBRE NOSOTROS
                    </Link>
                    <Link to='/contact' className={`header__menu__item ${location.pathname === '/contact' ? 'activeLink' : ''}`}>
                        CONTACTO
                    </Link>
                </div>


            </div>

            {!showNavbar && (
                <div className="navbar-tab" onClick={handleTabClick} role="button" tabIndex={0} aria-label="Mostrar menú">
                ☰
                </div>
            )}
            
            <div className={`hMenuOptionsContainer ${showHMenuOptions ? 'active' : ''}`}>
                <div className='hMenuOptionsContainer__btnCloseMenu'>
                    <div onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__btnCloseMenu__btn'>X</div>
                </div>

                {role === 'admin' ? (
                    <>
                        <Link to={`/cpanel/products`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PANEL DE PRODUCTOS</Link>
                        <Link to={`/tickets`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- VENTAS</Link>
                        <Link to={`/cpanel`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PANEL DE CONTROL</Link>
                        <Link to={`/bin`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PAPELERA</Link>
                        <Link to={`/myData`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- MIS DATOS</Link>
                    </>
                ) :
                role === 'premium' ? (
                    <>
                        <Link to={`/cpanel/products`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PANEL DE PRODUCTOS</Link>
                        <Link to={`/tickets`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- VENTAS</Link>
                        <Link to={`/bin`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PAPELERA</Link>
                        <Link to={`/myData`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- MIS DATOS</Link>
                    </>
                )
                : (
                    <>
                        <Link to={`/myPurchases`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- MIS COMPRAS</Link>
                        <Link to={`/myData`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- MIS DATOS</Link>
                    </>
                )}
            </div>

        </>

    )
}

export default NavBar