import React from 'react'
import { Link,useLocation, useNavigate } from 'react-router-dom'
import SmartLink from './SmartLink';

const Footer = ({isLoggedIn,sellerAddresses,socialNetworks,logo_store,aboutText,phoneNumbers,contactEmail}) => {
    // const navigate = useNavigate();
    // const location = useLocation();

    const handleGoToUrl = (url) => {
        window.open(url, "_blank");
    }

    /* const handleGoToCatalog = (e) => {
        e.preventDefault();
        if (location.pathname === '/') {
            const el = document.getElementById('catalogContainer');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            sessionStorage.setItem('scrollToId', 'catalogContainer');
            navigate('/');
        }
    }; */

    return (

        <>
        
            <div className='footerContainer'>

                <div className='footerContainer__logoPhraseContainer'>

                    <div className='footerContainer__logoPhraseContainer__logoPhrase'>

                        <SmartLink to={'/'} className='footerContainer__logoPhraseContainer__logoPhrase__logo'>
                            {logo_store ? (
                                <img
                                className='footerContainer__logoPhraseContainer__logoPhrase__logo__prop'
                                src={`http://localhost:8081/${logo_store}`}
                                alt="logo_tienda"
                                />
                            ) : null}
                        </SmartLink>

                        <div className='footerContainer__logoPhraseContainer__logoPhrase__phrase'>
                            <div className="footerContainer__logoPhraseContainer__logoPhrase__phrase__prop">{aboutText}</div>
                        </div>

                    </div>

                </div>

                <div className='footerContainer__faqContainer'>
                    
                    <div className='footerContainer__faqContainer__faq'>

                        <div className='footerContainer__faqContainer__faq__title'>Enlaces</div>
                        <SmartLink
                            to="/"
                            className='footerContainer__faqContainer__faq__links'
                            >   
                            - Inicio
                        </SmartLink>
                        <Link to={"/about"} className='footerContainer__faqContainer__faq__links'>
                            - Sobre nosotros
                        </Link>
                        <Link to={"/contact"} className='footerContainer__faqContainer__faq__links'>
                            - Contacto
                        </Link>
                        {
                            isLoggedIn &&
                            <Link to={"/cart"} className='footerContainer__faqContainer__faq__links'>
                                - Carrito de compras
                            </Link>
                        }
                        {
                            !isLoggedIn &&
                            <Link to={"/logIn"} className='footerContainer__faqContainer__faq__links'>
                                - Iniciar Sesión
                            </Link>
                        }

                    </div>

                </div>

                <div className='footerContainer__contactContainer'>

                    <div className='footerContainer__contactContainer__contact'>

                        <div className='footerContainer__contactContainer__contact__title'>
                            <div className='footerContainer__contactContainer__contact__title__prop'>Encuéntranos</div>
                        </div>

                        <div className='footerContainer__contactContainer__contact__contactProps'>

                            {sellerAddresses.map((address) => (
                                <div className='footerContainer__contactContainer__contact__contactProps__prop'>
                                    - {address.street} {address.street_number}, {address.locality}, {address.province}
                                </div>
                            ))}

                            <div className='footerContainer__contactContainer__contact__contactProps__prop' style={{marginTop:'1vh'}}>Teléfonos</div>

                            {phoneNumbers?.map((phone, index) => (
                            <div
                                key={index}
                                className="footerContainer__contactContainer__contact__contactProps__prop"
                            >
                                - {phone.number}
                            </div>
                            ))}

                            <div className='footerContainer__contactContainer__contact__contactProps__prop' style={{marginTop:'1vh'}}>Correos electrónicos de contacto</div>

                            {contactEmail?.map(({ email, label, _id }) => (
                                <div key={_id} className="footerContainer__contactContainer__contact__contactProps__prop">
                                    - 📧 {label}: {email}
                                </div>
                            ))}

                        </div>

                    </div>

                </div>

            </div>

            <div className='separatorContainer'>
                <div className='separatorContainer__separator'></div>
            </div>

            <div className='footerContainer__socialNetworks'>
                <div className='footerContainer__socialNetworks__title'>
                    <div className='footerContainer__socialNetworks__title__prop'>Redes sociales</div>
                </div>
                <div className='footerContainer__socialNetworks__list'>
                    {socialNetworks?.map(({ name,logo, url, _id }) => (
                        <>
                            <div className='footerContainer__socialNetworks__list__socialNetwork'>

                                <div className='footerContainer__socialNetworks__list__socialNetwork__logo'>
                                    <img onClick={() => handleGoToUrl(url)} class="footerContainer__socialNetworks__list__socialNetwork__logo__prop" src={`http://localhost:8081/${logo}`} alt={'.'}/>
                                </div>

                                <div className='footerContainer__socialNetworks__list__socialNetwork__labelContainer'>
                                    <div onClick={() => handleGoToUrl(url)} className='footerContainer__socialNetworks__list__socialNetwork__labelContainer__label'>{name}</div>
                                </div>

                            </div>
                        </>
                    ))}
                </div>
            </div>

        </>

    )

}

export default Footer