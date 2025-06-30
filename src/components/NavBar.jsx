import {useContext,useState,useEffect} from 'react'
import { Link, useLocation,useNavigate } from 'react-router-dom'
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import SmartLink from './SmartLink';

const NavBar = ({user,setSelectedAddress,setUser,isLoadingAuth,isScrollForced,products,cartIcon,hexToRgba,primaryColor,userCart,logo_store,storeName,isLoggedIn,categories,isLoading,role,first_name,cookieValue,fetchUser,setShowLogOutContainer,showLogOutContainer}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [showCategories, setShowCategories] = useState(false);

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
                const res = await fetch(`http://localhost:8081/api/products/navbar-search?search=${searchTerm}`)
                const data = await res.json();
                //console.log(data)
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
            if(showCategories) {
                setShowCategories(false)
            }
            setShowHMenuOptions(true)
        }

    }

    useEffect(() => {
        const handleScrollShowHMenuOptions = () => setShowHMenuOptions(false);
        const handleScrollShowCategories = () => setShowCategories(false);
        window.addEventListener("scroll", handleScrollShowCategories);
        window.addEventListener("scroll", handleScrollShowHMenuOptions);
        return () => {
            window.removeEventListener("scroll", handleScrollShowCategories);
            window.removeEventListener("scroll", handleScrollShowHMenuOptions);
        } 
    }, []);

    const handleBtnLogOut = async () => {
        const response = await fetch(`http://localhost:8081/api/sessions/logout`, {
            method: 'POST',         
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // 👈 Esto es clave
        })
        const data = await response.json();
        if(response.ok) {
            toast('Gracias por visitar nuestra página', {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
            setUser&&setUser(null)
            setSelectedAddress&&setSelectedAddress(null)
            setTimeout(() => {
                navigate('/')
                window.location.reload()
            }, 2000);
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
                                            src={`http://localhost:8081/${product.images?.[0]}` || '/default-image.jpg'}
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
                                        {/* <span className='header__gridUp__inputSearch__productsListContainer__productItem__price'>${product.price}</span>
                                        <span className='header__gridUp__inputSearch__productsListContainer__productItem__stock'>{product.stock ?? 'N/A'}u.</span> */}
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    <SmartLink to={'/'} className='header__gridUp__logoContainer'>
                        {logo_store ? (
                            <img
                            className='header__gridUp__logoContainer__prop'
                            src={`http://localhost:8081/${logo_store}`}
                            alt='logo_tienda'
                            />
                        ) : null}
                        <p className='header__gridUp__logoContainer__storeName'>{storeName}</p>
                    </SmartLink>

                    <div className='header__gridUp__links'>

                        {
                            isLoadingAuth ?
                                null 
                            :
                            user ?
                                <>
                                    <div className='header__gridUp__links__itemName'>Bienvenido/a <br />{user.first_name}</div>
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
                                        <div onClick={handleBtnLogOut} className='header__gridUp__links__itemLogOut'>SALIR</div>
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

                    {/* WRAPPER agregado */}
                    <div
                    className='menuCategoriesWrapper'
                    onMouseEnter={() => setShowCategories(true)}
                    onMouseLeave={() => setShowCategories(false)}
                    >
                        {/* <div className={`header__menu__item header__menu__itemBorder ${location.pathname.startsWith('/category') ? 'activeLink' : ''}`}> */}
                        <div className={`header__menu__item header__menu__itemBorder ${showCategories ? 'hoverLink' : ''} ${location.pathname.startsWith('/category') ? 'activeLink' : ''}`}>
                            CATEGORÍAS
                        </div>

                        <div
                            className='categoriesContainer'
                            style={{ display: showCategories ? 'flex' : 'none' }}
                        >
                            <div className='categoriesContainer__grid'>
                            {categories && categories.length > 0 ? (
                                categories.map((category) => (
                                <Link
                                    key={category._id}
                                    to={`/category/${category.name.toLowerCase()}`}
                                    onClick={() => setShowCategories(false)}
                                    className='categoriesContainer__grid__item'
                                >
                                    - {category.name.toUpperCase()}
                                </Link>
                                ))
                            ) : (
                                <>
                                <p className='categoriesContainer__category'>Aún no hay categorías</p>
                                <Link to='/cpanel' className='categoriesContainer__addCategoryLink'>
                                    Agregar categoría
                                </Link>
                                </>
                            )}
                            </div>
                        </div>
                    </div>

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
                        <Link to={`/cpanel/products`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PRODUCTOS</Link>
                        <Link to={`/cpanel`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PANEL DE CONTROL</Link>
                        <Link to={`/tickets`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- VENTAS</Link>
                        <Link to={`/bin`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- PAPELERA</Link>
                    </>
                ) : (
                    <Link to={`/myPurchases`} onClick={() => setShowHMenuOptions(false)} className='hMenuOptionsContainer__option'>- MIS COMPRAS</Link>
                )}
            </div>

        </>

    )
}

export default NavBar