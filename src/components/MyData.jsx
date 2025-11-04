import {useEffect,useState} from 'react'
import NavBar from './NavBar'
import NavbarMobile from './NavbarMobile'
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import cartWhiteIcon from '../assets/cart_white.png';
import cartBlackIcon from '../assets/cart_black.png';

const MyData = () => {
    const SERVER_URL = import.meta.env.VITE_API_URL;
    const [isLoading, setIsLoading] = useState(true);
    const { user, loadingUser: isLoadingAuth,fetchCurrentUser } = useAuth();
    const [storeSettings, setStoreSettings] = useState({});
    const [categories, setCategories] = useState([]);
    const [userCart, setUserCart] = useState({});
    const [showLogOutContainer, setShowLogOutContainer] = useState(false);
    const [cartIcon, setCartIcon] = useState(`${cartWhiteIcon}`);
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [isLoadingSubmitMyData, setIsLoadingSubmitMyData] = useState(false);
    const [userCredentials, setUserCredentials] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
    });

    const handleUserCredentialsChange = (event) => {
        const { name, value } = event.target;
        
        if ((name === "first_name" || name === "last_name") && !/^[a-zA-Z\s]*$/.test(value)) {
          return; // No actualiza el estado si el valor tiene caracteres no permitidos
        }
        setUserCredentials({ ...userCredentials, [name]: value });
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

    useEffect(() => {
        if (user?._id) {
            setUserCredentials({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            })
        }
    }, [user]);

    function hexToRgba(hex, opacity) {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

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

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${SERVER_URL}api/categories`);
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

    const fetchStoreSettings = async () => {
        try {
            setIsLoadingStoreSettings(true)
            const response = await fetch(`${SERVER_URL}api/settings`);
            const data = await response.json();
            //console.log(data)
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

    const handleBtnSubmitMyData = async () => {
        if(userCredentials.first_name == user.first_name && userCredentials.last_name == user.last_name) {
            toast('No tienes cambios para guardar!', {
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
            return;
        }
        try {
            setIsLoadingSubmitMyData(true)
            const obj = {
                first_name: userCredentials.first_name,
                last_name: userCredentials.last_name,
                email: userCredentials.email,
                role: userCredentials.role
            }
            const res = await fetch(`${SERVER_URL}api/users/${user._id}`, {
                method: 'PATCH',        
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            });

            const data = await res.json();
            if(res.ok) {
                toast('Has actualizado los cambios', {
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
                fetchCurrentUser();
            } else {
                toast('Ha ocurrido un error al querer guardar los cambios, intente nuevamente!', {
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
            setIsLoadingSubmitMyData(false)
        }
        
    }



    useEffect(() => {
        fetchCurrentUser();
        fetchCategories();
        fetchStoreSettings();
        window.scrollTo(0, 0);
    }, []);

    return (

        <>

            <NavbarMobile
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

            <div className='navbarContainer'>
                <NavBar
                isLoading={isLoading}
                isLoadingAuth={isLoadingAuth}
                user={user}
                isLoggedIn={user?.isLoggedIn || false}
                role={user?.role || null}
                first_name={user?.first_name || ''}
                categories={categories}
                userCart={userCart}
                showLogOutContainer={showLogOutContainer}
                hexToRgba={hexToRgba}
                logo_store={storeSettings?.siteImages?.logoStore || ""}
                primaryColor={storeSettings?.primaryColor || ""}
                cartIcon={cartIcon}
                storeName={storeSettings?.storeName || ""}
                />
            </div>

            <div className='myDataContainer'>

                <div className='myDataContainer__myData'>
                    
                    <div className='myDataContainer__myData__title'>
                        <div className='myDataContainer__myData__title__prop'>Mis datos</div>
                    </div>

                    <div className='myDataContainer__myData__labelInput'>
                        <div className='myDataContainer__myData__labelInput__label'>Nombre</div>
                        <div className='myDataContainer__myData__labelInput__input'>
                            <input value={userCredentials.first_name} type="text" className='myDataContainer__myData__labelInput__input__prop' onChange={handleUserCredentialsChange} placeholder='Nombre' name="first_name" />
                        </div>
                    </div>

                    <div className='myDataContainer__myData__labelInput'>
                        <div className='myDataContainer__myData__labelInput__label'>Apellido</div>
                        <div className='myDataContainer__myData__labelInput__input'>
                            <input value={userCredentials.last_name} type="text" className='myDataContainer__myData__labelInput__input__prop' onChange={handleUserCredentialsChange} placeholder='Apellido' name="last_name" />
                        </div>
                    </div>

                    <div className='myDataContainer__myData__labelInput'>
                        <div className='myDataContainer__myData__labelInput__label'>Email</div>
                        <div className='myDataContainer__myData__labelInput__input'>
                            <input value={userCredentials.email} type="email" disabled className='myDataContainer__myData__labelInput__input__propDisabled' placeholder='Email' />
                        </div>
                    </div>

                    {
                        (user?.role == 'admin' || user?.role == 'premium') &&

                        <div className='myDataContainer__myData__labelInput'>
                            <div className='myDataContainer__myData__labelInput__label'>Rol</div>
                            <div className='myDataContainer__myData__labelInput__input'>
                                <input value={userCredentials.role} type="text" disabled className='myDataContainer__myData__labelInput__input__propDisabled' />
                            </div>
                        </div>
                    }

                    <div className='myDataContainer__myData__btn'>
                        {isLoadingSubmitMyData ? (
                            <button
                            disabled
                            className='myDataContainer__myData__btn__prop'
                            >
                            <Spinner/>
                            </button>
                        ) : (
                            <button
                            onClick={handleBtnSubmitMyData}
                            className='myDataContainer__myData__btn__prop'
                            >
                            Guardar
                            </button>
                        )}
                    </div>
                    
                </div>
                
            </div>
        
        </>

    )

}

export default MyData