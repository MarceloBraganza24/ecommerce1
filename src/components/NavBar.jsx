import {useContext,useState,useEffect} from 'react'
import { Link } from 'react-router-dom'
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const NavBar = ({cartIcon,hexToRgba,primaryColor,userCart,logo_store,storeName,isLoggedIn,categories,isLoading,role,first_name,cookieValue,fetchUser,setShowLogOutContainer,showLogOutContainer}) => {
    const [quantity, setQuantity] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

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
    const [showCategories, setShowCategories] = useState(false);

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
                        <input className='header__gridUp__inputSearch__input' placeholder='Buscar productos' type="text" />
                    </div>
                    
                    <Link to={"/"} className='header__gridUp__logoContainer'>
                        {logo_store ? (
                            <img
                            className='header__gridUp__logoContainer__prop'
                            src={`http://localhost:8081/${logo_store}`}
                            alt="logo_tienda"
                            />
                        ) : null}
                        <p className='header__gridUp__logoContainer__storeName'>{storeName}</p>
                    </Link>

                    <div className='header__gridUp__inputsearch'>login logout</div>

                </div>

                <div className='header__menu'>
                    <div className='header__menu__item'>Inicio</div>
                </div>

                {/* <div className='header__logo-menu'>

                    <div className='header__logo-menu__hMenuContainer'>
                        {
                            isLoading ?
                            <Spinner/>
                            :
                            showLogOutContainer &&
                            <div onClick={handleBtnShowHMenuOptions} className='header__logo-menu__hMenuContainer__hMenu'>
                                <div className='header__logo-menu__hMenuContainer__hMenu__line'></div>
                                <div className='header__logo-menu__hMenuContainer__hMenu__line'></div>
                                <div className='header__logo-menu__hMenuContainer__hMenu__line'></div>
                            </div>
                        }
                    </div>

                    <Link to={"/"} className='header__logo-menu__logoContainer'>
                        {logo_store ? (
                            <img
                            className='header__logo-menu__logoContainer__logo'
                            src={`http://localhost:8081/${logo_store}`}
                            alt="logo_tienda"
                            />
                        ) : null}
                    </Link>

                    <div className='header__logo-menu__menuContainer'>

                        <Link to={"/#catalog"} className='header__logo-menu__menuContainer__item'>
                            CATÁLOGO
                        </Link>

                        <div onClick={handleBtnShowCategories} className='header__logo-menu__menuContainer__categoriesSelect'>CATEGORÍAS</div>

                    </div>

                </div>

                <div className='header__rightMenu'>
                    
                    <div className='header__rightMenu__menu'>

                        <Link to={"/about"} className='header__rightMenu__menu__item'>
                            SOBRE NOSOTROS
                        </Link>
                        <Link to={"/contact"} className='header__rightMenu__menu__item'>
                            CONTACTO
                        </Link>

                        <div className='header__rightMenu__menu__cart'>

                            <Link to={"/cart"} className='header__rightMenu__menu__cart__logo'>
                                <img className='header__rightMenu__menu__cart__logo__prop' src={cartIcon} alt="" />
                            </Link>
                            <div className='header__rightMenu__menu__cart__number'>
                                {
                                    isLoadingUser || quantity === null ?
                                        <Spinner />
                                    :
                                    <div className='header__rightMenu__menu__cart__number__prop'>
                                        {
                                            !isLoggedIn || isLoggedIn === undefined ?
                                                0
                                            : 
                                                quantity
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                        {
                            isLoading ?
                            <div className='header__rightMenu__menu__spinner'>
                                <Spinner/>
                            </div>
                            : isLoggedIn ?
                            <>
                                <div className='header__rightMenu__menu__name'>BIENVENIDO/A<br />{first_name?capitalizeFirstLetter(first_name):''}</div>
                            </>
                            :
                            <Link to={"/logIn"} className='header__rightMenu__menu__itemLogin'>
                                LOG IN
                            </Link>
                        }

                    </div>

                </div> */}
                
            </div>
            
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


            <div className={`categoriesContainer ${showCategories ? 'open' : ''}`}>
                <div className='categoriesContainer__btnCloseMenu'>
                    <div
                        onClick={() => setShowCategories(false)}
                        className='categoriesContainer__btnCloseMenu__btn'
                    >
                        X
                    </div>
                </div>

                {categories && categories.length > 0 ? (
                    categories.map((category) => (
                        <Link
                            key={category._id}
                            to={`/category/${category.name.toLowerCase()}`}
                            onClick={() => setShowCategories(false)}
                            className="categoriesContainer__category"
                        >
                            - {category.name.toUpperCase()}
                        </Link>
                    ))
                ) : (
                    <>
                        <p className="categoriesContainer__category">Aún no hay categorías</p>
                        <Link to={`/cpanel`} className="categoriesContainer__addCategoryLink">
                            Agregar categoría
                        </Link>
                    </>
                )}
            </div>


        </>

    )
}

export default NavBar