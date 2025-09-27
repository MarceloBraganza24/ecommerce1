import React, { useState,useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import Spinner from './Spinner';

const SendMailPass = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [storeName, setStoreName] = useState('');
    const [showSpinner, setShowSpinner] = useState(false);
    const [loadingBtnRecieveLink, setLoadingBtnRecieveLink] = useState(false);
    const SERVER_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchStoreName();
    }, []);

    const fetchStoreName = async () => {
        try {
            const response = await fetch(`${SERVER_URL}api/settings`);
            const data = await response.json();
            if (response.ok) {
                setStoreName(data?.storeName)
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
        }
    };

    const handleInputEmail = (e) => {
        const texto = e.target.value;
        setEmail(texto)
    }
    
    const handleBtnRecieveLink = async () => {
        if(!email) {
            toast('Debes ingresar tu email!', {
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
            return;
        }
        try {
            setLoadingBtnRecieveLink(true);
            const response = await fetch(`${SERVER_URL}api/users/password-link`, {
                method: 'POST',         
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 🔥 esto es fundamental
                body: JSON.stringify({email})
            })
            const data = await response.json();
            if (response.ok) {
                navigate("/login");
                toast('Se ha enviado el link a su correo electrónico!', {
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
            } else {
                if (data.error === 'user not found') {
                    toast('El email no está registrado todavía, registrate ahora mismo!', {
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
                } else {
                    toast('No se ha podido generar el link. Inténtalo más tarde.', {
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
            }
        } catch (error) {
            console.error('Error al restaurar el producto:', error);
        }finally {
            setLoadingBtnRecieveLink(false);
        }

    };

    return (
        <>
            <div className='sendMailContainer'>
                <div className='sendMailContainer__credentials'>
                    <div className='sendMailContainer__credentials__phrase'>
                        <div className='sendMailContainer__credentials__phrase__title'>{storeName}</div>
                    </div>
                    <div className='sendMailContainer__credentials__phrase'>
                        <div className='sendMailContainer__credentials__phrase__h2'>Ingrese su email para recibir un link y así poder cambiar la contraseña</div>
                    </div>
                    <div className='sendMailContainer__credentials__form'>
                        <div className='sendMailContainer__credentials__form__label-input'>
                            <div className='sendMailContainer__credentials__form__label-input__label'>Email</div>
                            <div className='sendMailContainer__credentials__form__label-input__input'>
                                <input className='sendMailContainer__credentials__form__label-input__input__prop' type='email' placeholder='Email' onChange={handleInputEmail}/>
                            </div>
                        </div> 
                        <div className='sendMailContainer__credentials__form__btn'>
                            {loadingBtnRecieveLink ? (
                                <button
                                disabled
                                className='sendMailContainer__credentials__form__btn__prop'
                                >
                                <Spinner/>
                                </button>
                            ) : (
                                <button
                                onClick={handleBtnRecieveLink}
                                className='sendMailContainer__credentials__form__btn__prop'
                                >
                                Recibir link
                                </button>
                            )}
                        </div>
                        <div className='sendMailContainer__credentials__form__btn'>
                            <Link to={"/signIn"} className='sendMailContainer__credentials__form__btn__prop'>
                                Registrarse                            
                            </Link>     
                        </div>
                        <div className='sendMailContainer__credentials__form__btn'>
                            <Link to={"/login"} className='sendMailContainer__credentials__form__btn__prop'>
                                Iniciar sesión                            
                            </Link>     
                        </div> 
                    </div>
                </div>
            </div>
        </>
    )
}

export default SendMailPass