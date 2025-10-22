import React, { useState, useEffect } from 'react'
import { Link,useSearchParams  } from 'react-router-dom';
import { toast } from "react-toastify";
import Spinner from './Spinner';

const ResetPass = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        specialChar: false
    });
    const [showSpinner, setShowSpinner] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [storeName, setStoreName] = useState('');
    const [loadingBtnResetPass, setLoadingBtnResetPass] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoadingValidateToken, setIsLoadingValidateToken] = useState(true);
    const SERVER_URL = import.meta.env.VITE_API_URL;

    useEffect( async () => {
        if (token) {
            await fetchValidateToken();
        }
    }, [token]);

    useEffect(() => {
        fetchStoreName();
    }, []);

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        setPasswordValidation({
            length: value.length >= 8,
            lowercase: /[a-z]/.test(value),
            uppercase: /[A-Z]/.test(value),
            number: /[0-9]/.test(value),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        });
    };

    const fetchValidateToken = async () => {
        try {
            const response = await fetch(`${SERVER_URL}api/users/validate-reset-token?token=${token}`);
            const data = await response.json();
            if (response.ok) {
                setIsValid(true);
            } else {
                setIsValid(false);
                toast('El token no es válido! Vuelva a generar el link', {
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
            setIsLoadingValidateToken(false)
        }
    };

    const fetchStoreName = async () => {
        try {
            const response = await fetch(`${SERVER_URL}api/settings`);
            const data = await response.json();
            if (response.ok) {
                setStoreName(data.storeName)
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

    const ConfirmationResetPassModal = ({handleResetPassModalLocal}) => {

        const resetPass = async () => {

            setShowSpinner(true);
            const response = await fetch(`${SERVER_URL}api/users/reset-pass?password=${password}`, {
                method: 'POST',         
                credentials: 'include', // 🔥 necesario para que la cookie llegue al backend
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const data = await response.json();
            if(response.ok) {
                toast('La contraseña se modificó correctamente!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2500);
            }
            if(data.error === 'no token provide') {
                toast('El link ha expirado!', {
                    position: "top-right",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                setTimeout(() => {
                    window.location.href = '/sendMail';
                }, 2500);
            } else if(data.error === 'do not enter the same password') {
                toast('No puedes ingresar la misma contraseña!', {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                setShowSpinner(false);
            }

        }

        const handleBtnConfirmationResetPassBtnNo = () => {
            handleResetPassModalLocal(false);
        }

        return (
            <>
                <div className='confirmationResetPassModalContainer'>
                    <div className='confirmationResetPassModalContainer__ask'>¿Estás seguro que deseas confirmar los cambios?</div>
                    <div className='confirmationResetPassModalContainer__askMobile'>
                        <div className='confirmationResetPassModalContainer__askMobile__ask'>¿Estás seguro que deseas</div>
                        <div className='confirmationResetPassModalContainer__askMobile__ask'>confirmar los cambios?</div>
                    </div>
                    <div className='confirmationResetPassModalContainer__btnsContainer'>
                        <div className='confirmationResetPassModalContainer__btnsContainer__btns'>
                            <div></div>
                        </div>
                        <div className='confirmationResetPassModalContainer__btnsContainer__btns'>
                            <button onClick={resetPass} className='confirmationResetPassModalContainer__btnsContainer__btns__prop'>Si</button>
                        </div>
                        <div className='confirmationResetPassModalContainer__btnsContainer__btns'>
                            <button onClick={handleBtnConfirmationResetPassBtnNo} className='confirmationResetPassModalContainer__btnsContainer__btns__prop'>No</button>
                        </div>
                        <div className='confirmationResetPassModalContainer__btnsContainer__btns'>
                            {showSpinner&&<Spinner/>}
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const [resetPassModalLocal, handleResetPassModalLocal] = useState(false);

    const handleBtnOpenResetPassModal = () => {
        if(!password) {
            toast('Debes ingresar una contraseña!', {
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
        } else {
            handleResetPassModalLocal(true);
        }
    }
    
    const isStrongPassword = (password) => {
        const minLength = /.{8,}/;
        const hasLowercase = /[a-z]/;
        const hasUppercase = /[A-Z]/;
        const hasNumber = /[0-9]/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

        return (
            minLength.test(password) &&
            hasLowercase.test(password) &&
            hasUppercase.test(password) &&
            hasNumber.test(password) &&
            hasSpecialChar.test(password)
        );
    };


    const resetPass = async () => {
        if(!password) {
            toast('Debes ingresar una contraseña!', {
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
            return;
        }
        if (!isStrongPassword(password)) {
            toast('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.', {
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
            return;
        }
        try {
            setLoadingBtnResetPass(true);
            const response = await fetch(`${SERVER_URL}api/users/reset-pass?password=${password}`, {
                method: 'POST',         
                credentials: 'include', // 🔥 necesario para que la cookie llegue al backend
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const data = await response.json();
            if(response.ok) {
                toast('La contraseña se modificó correctamente!', {
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
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2500);
            }
            if(data.error === 'no token provide') {
                toast('El link ha expirado!', {
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
                setTimeout(() => {
                    window.location.href = '/sendMail';
                }, 2500);
            } else if(data.error === 'do not enter the same password') {
                toast('No puedes ingresar la misma contraseña!', {
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
            }
        } catch (error) {
            console.error('Error al restaurar el producto:', error);
        }/* finally {
            setLoadingBtnResetPass(false);
        } */

    }

    const getPasswordStrength = () => {
        const values = Object.values(passwordValidation);
        const score = values.filter(Boolean).length;
        return score; // 0 a 5
    };

    if (isLoadingValidateToken) {
        return (
            <div className="loadingContainer">
                <Spinner/>
            </div>
        );
    }

    return (
        <>
            {
                isValid ?
                <>
                    <div className='resetPassContainer'>
                        <div className='resetPassContainer__credentials'>
                            <div className='resetPassContainer__credentials__phrase'>
                                <div className='resetPassContainer__credentials__phrase__title'>{storeName}</div>
                            </div>
                            <div className='resetPassContainer__credentials__phrase'>
                                <div className='resetPassContainer__credentials__phrase__ask'>Ingrese su nueva contraseña</div>
                            </div>
                            <div className='resetPassContainer__credentials__form'>
                                <div className='resetPassContainer__credentials__form__label-input'>
                                    <div className='resetPassContainer__credentials__form__label-input__label'>Contraseña:</div>
                                    <div className='resetPassContainer__credentials__form__label-input__input'>
                                         <input
                                            className='resetPassContainer__credentials__form__label-input__input__prop'
                                            type={passwordVisible ? 'text' : 'password'}
                                            placeholder='Contraseña'
                                            onChange={handlePasswordChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                            className='resetPassContainer__credentials__form__label-input__input__toggleBtn'
                                        >
                                            {passwordVisible ? '👁️' : '👁️'}
                                        </button>
                                    </div>
                                    {
                                        password &&
                                        <>
                                            <div className='resetPassContainer__credentials__form__label-input__passwordValidation'>
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
                                            <div className="resetPassContainer__credentials__form__label-input__passwordStrengthBar" style={{ height: '6px', backgroundColor: '#ccc', borderRadius: '4px', marginTop: '8px' }}>
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
                                </div> 
                                <div className='resetPassContainer__credentials__form__btn'>
                                    {loadingBtnResetPass ? (
                                        <button
                                        disabled
                                        className='resetPassContainer__credentials__form__btn__prop'
                                        >
                                        <Spinner/>
                                        </button>
                                    ) : (
                                        <button
                                        onClick={resetPass}
                                        className='resetPassContainer__credentials__form__btn__prop'
                                        >
                                        Confirmar cambios
                                        </button>
                                    )}
                                </div>       
                            </div>
                            <div className='resetPassContainer__credentials__form__btn'>
                            </div>  
                        </div>
                    </div>
                    {
                        resetPassModalLocal&&
                        <ConfirmationResetPassModal handleResetPassModalLocal={handleResetPassModalLocal}/>
                    }
                </>
                :
                <>
                    <div className='resetPassContainer'>
                        <div className='resetPassContainer__linkExpiredContaienr'>
                            <div className='resetPassContainer__linkExpiredContaienr__phrase'>
                                <div className='resetPassContainer__linkExpiredContaienr__phrase__title'>{storeName}</div>
                            </div>
                            <div className='resetPassContainer__linkExpiredContaienr__label'>
                                <div className='resetPassContainer__linkExpiredContaienr__label__prop'>El link ha expirado</div>
                            </div>
                            <div className='resetPassContainer__linkExpiredContaienr__phrase__ask'>¿Deseas volver a enviar el link?</div>
                            <Link to={"/sendMail"} className='resetPassContainer__linkExpiredContaienr__link'>
                                Has click aquí
                            </Link>
                        </div>
                    </div>
                </>
            }
            
        </>
    )
}

export default ResetPass