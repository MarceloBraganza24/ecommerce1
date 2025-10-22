import {useEffect,useState} from 'react'
import NavBar from './NavBar'
import Footer from './Footer'
import { Link,useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const SignIn = () => {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loadingBtnSignin, setLoadingBtnSignin] = useState(false);
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingStoreSettings, setIsLoadingStoreSettings] = useState(true);
    const [credentials, setCredentials] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    });
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        specialChar: false
    });
    const SERVER_URL = import.meta.env.VITE_API_URL;

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

    const handleChange = (event) => {
        const { name, value } = event.target;
        
        if ((name === "first_name" || name === "last_name") && !/^[a-zA-Z\s]*$/.test(value)) {
          return; // No actualiza el estado si el valor tiene caracteres no permitidos
        }
        setCredentials({ ...credentials, [name]: value });
        setPasswordValidation({
            length: value.length >= 8,
            lowercase: /[a-z]/.test(value),
            uppercase: /[A-Z]/.test(value),
            number: /[0-9]/.test(value),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        });
    };

    const getPasswordStrength = () => {
        const values = Object.values(passwordValidation);
        const score = values.filter(Boolean).length;
        return score; // 0 a 5
    };

    const validateForm = () => {
        const { first_name,last_name,email,password } = credentials;
    
        if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim()) {
            toast('Debes completar todos los campos!', {
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
            return false;
        }
    
        return true;
    };

    const handleSubmit = async (e) => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        const user_datetime = currentDate;
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setLoadingBtnSignin(true);
            const response = await fetch(`${SERVER_URL}api/sessions/signIn`, {
                method: 'POST',         
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: credentials.first_name,
                    last_name: credentials.last_name,
                    email: credentials.email,
                    password: credentials.password,
                    user_datetime
                })
            })
            const data = await response.json();
            if (response.ok) {
                navigate("/login");
                toast('Te has registrado exitosamente!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
            if(data.error === 'There is already a user with that email') {
                toast('Ya existe un usuario con ese email!', {
                    position: "top-right",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    className: "custom-toast",
                });
                setLoadingBtnSignin(false);
            }
        } catch (error) {
            console.error('Error:', error);
            setLoadingBtnSignin(false);
        }
    };

    useEffect(() => {
        fetchStoreSettings()
    }, []);

    if (isLoadingStoreSettings) {
        return (
            <div className="loadingContainer">
                <Spinner/>
            </div>
        );
    }

    return (

        <>

            <div className='signInContainer'>

                <div className='signInContainer__formContainer'>

                    <div className='signInContainer__formContainer__form'>

                        <div className='signInContainer__formContainer__form__title'>
                            <div className='signInContainer__formContainer__form__title__prop'>Registro de usuario</div>
                        </div>

                        <div className='signInContainer__formContainer__form__inputContainer'>
                            <div className='signInContainer__formContainer__form__inputContainer__input'>
                                <input className='signInContainer__formContainer__form__inputContainer__input__prop' type="text" value={credentials.first_name} onChange={handleChange} placeholder='Nombre' name="first_name"  />
                            </div>
                        </div>

                        <div className='signInContainer__formContainer__form__inputContainer'>
                            <div className='signInContainer__formContainer__form__inputContainer__input'>
                                <input className='signInContainer__formContainer__form__inputContainer__input__prop' type="text" value={credentials.last_name} onChange={handleChange} placeholder='Apellido' name="last_name"  />
                            </div>
                        </div>

                        <div className='signInContainer__formContainer__form__inputContainer'>
                            <div className='signInContainer__formContainer__form__inputContainer__input'>
                                <input className='signInContainer__formContainer__form__inputContainer__input__prop' type="email" value={credentials.email} onChange={handleChange} placeholder='Email' name="email"  />
                            </div>
                        </div>

                        <div className='signInContainer__formContainer__form__inputPassContainer'>
                            <div className='signInContainer__formContainer__form__inputPassContainer__inputPass'>
                                <input
                                    className='signInContainer__formContainer__form__inputPassContainer__inputPass__prop'
                                    type={passwordVisible ? 'text' : 'password'}
                                    placeholder='Contraseña'
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    />
                            </div>
                            <div className='signInContainer__formContainer__form__inputPassContainer__inputPassEye'>
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className='signInContainer__formContainer__form__inputPassContainer__inputPassEye__propEye'
                                    >
                                    {passwordVisible ? '👁️' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {
                            credentials.password &&
                            <>
                                <div className='signInContainer__formContainer__form__passwordValidation'>
                                    <p style={{ color: passwordValidation.length ? 'green' : 'red' }}>
                                        • Al menos 8 caracteres
                                    </p>
                                    <p style={{ color: passwordValidation.lowercase ? 'green' : 'red' }}>
                                        • Una letra minúscula
                                    </p>
                                    <p style={{ color: passwordValidation.uppercase ? 'green' : 'red' }}>
                                        • Una letra mayúscula
                                    </p>
                                    <p style={{ color: passwordValidation.number ? 'green' : 'red' }}>
                                        • Un número
                                    </p>
                                    <p style={{ color: passwordValidation.specialChar ? 'green' : 'red' }}>
                                        • Un carácter especial (!@#$%)
                                    </p>
                                </div>
                                <div className="signInContainer__formContainer__form__passwordStrengthBar" style={{ height: '6px', backgroundColor: '#ccc', borderRadius: '4px' }}>
                                    <div
                                        style={{
                                            width: `${getPasswordStrength() * 20}%`,
                                            height: '100%',
                                            backgroundColor:
                                            getPasswordStrength() <= 2 ? 'red' :
                                            getPasswordStrength() === 3 ? 'orange' :
                                            getPasswordStrength() === 4 ? 'yellowgreen' :
                                            'green',
                                            transition: 'width 0.3s ease'
                                        }}
                                        />
                                </div>
                            </>
                        }

                        <div className='signInContainer__formContainer__form__btn'>
                            {loadingBtnSignin ? (
                                <button
                                disabled
                                className='signInContainer__formContainer__form__btn__prop'
                                >
                                <Spinner/>
                                </button>
                            ) : (
                                <button
                                onClick={handleSubmit}
                                className='signInContainer__formContainer__form__btn__prop'
                                >
                                Registrarse
                                </button>
                            )}
                            <Link to={"/logIn"} className='signInContainer__formContainer__form__btn__prop'>
                                Iniciar sesión
                            </Link>
                        </div>

                    </div>

                </div>

                <div className='signInContainer__logoContainer'>

                    <div className='signInContainer__logoContainer__title'>
                        <div className='signInContainer__logoContainer__title__prop'>Bienvenidos/as a <br /> "{storeSettings?.storeName}"</div>
                    </div>

                    <div className='signInContainer__logoContainer__logo'>
                        {storeSettings?.siteImages?.logoStore &&
                            <img
                            className='signInContainer__logoContainer__logo__prop'
                            src={`${storeSettings?.siteImages?.logoStore}`}
                            alt="logo_tienda"
                            />
                        }
                    </div>  

                    <div className='signInContainer__logoContainer__phrase'>
                        <div className='signInContainer__logoContainer__phrase__prop'>"Registra tu cuenta y disfruta de una experiencia única con nuestros productos especialmente para ti"</div>
                    </div>

                </div>  

            </div>  

        </>

    )

}

export default SignIn