import {useContext,useState,useEffect} from 'react'
import { Link,useNavigate } from 'react-router-dom'
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const NavBar = ({products,cartIcon,hexToRgba,primaryColor,userCart,logo_store,storeName,isLoggedIn,categories,isLoading,role,first_name,cookieValue,fetchUser,setShowLogOutContainer,showLogOutContainer}) => {
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

    useEffect(() => {
        if (searchTerm.trim().length === 0) {
            setFilteredProducts([]);
            setShowDropdown(false);
            return;
        }

        const filtered = products.filter(product =>
            product.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredProducts(filtered);
        setShowDropdown(filtered.length > 0);
    }, [searchTerm, products]);

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

    const [showHMenuOptions, setShowHMenuOptions] = useState(false);

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

    const handleBtnShowCategories = () => {
        if(showCategories) {
            setShowCategories(false)
        } else {
            if(showHMenuOptions) {
                setShowHMenuOptions(false)
            }
            setShowCategories(true)
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

    return (

        <>

            <div className='header'>

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
                                        <span className='header__gridUp__inputSearch__productsListContainer__productItem__title'>{product.title}</span>
                                        <span className='header__gridUp__inputSearch__productsListContainer__productItem__price'>${product.price}</span>
                                        <span className='header__gridUp__inputSearch__productsListContainer__productItem__stock'>{product.stock ?? 'N/A'}u.</span>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    <Link to='/' className='header__gridUp__logoContainer'>
                    {logo_store ? (
                        <img
                        className='header__gridUp__logoContainer__prop'
                        src={`http://localhost:8081/${logo_store}`}
                        alt='logo_tienda'
                        />
                    ) : null}
                    <p className='header__gridUp__logoContainer__storeName'>{storeName}</p>
                    </Link>

                    <div className='header__gridUp__links'>
                    <Link to='/logIn' className='header__gridUp__links__item'>
                        LOG IN
                    </Link>
                    <Link to='/signIn' className='header__gridUp__links__item'>
                        REGISTRARSE
                    </Link>
                    <div className='header__gridUp__links__itemCart'>
                        <img
                        onClick={() => (window.location.href = '/cart')}
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
                    </div>
                </div>

                <div className='header__menu'>
                    <Link to='/' className='header__menu__item header__menu__itemBorder'>
                        INICIO
                    </Link>

                    {/* WRAPPER agregado */}
                    <div
                    className='menuCategoriesWrapper'
                    onMouseEnter={() => setShowCategories(true)}
                    onMouseLeave={() => setShowCategories(false)}
                    >
                        <div className='header__menu__item header__menu__itemBorder'>
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

                    <Link to='/about' className='header__menu__item header__menu__itemBorder'>
                        SOBRE NOSOTROS
                    </Link>
                    <Link to='/contact' className='header__menu__item'>
                        CONTACTO
                    </Link>
                </div>
            </div>


            
            {/* <div className={`hMenuOptionsContainer ${showHMenuOptions ? 'active' : ''}`}>
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
            </div> */}

        </>

    )
}

export default NavBar