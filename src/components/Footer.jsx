import React from 'react'
import { Link } from 'react-router-dom'

const Footer = ({sellerAddresses,socialNetworks,isLoadingSellerAddresses,logo_store,aboutText,phoneNumbers,contactEmail}) => {

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleGoToUrl = (url) => {
        window.open(url, "_blank");
    }

    return (

        <>
        
            <div className='footerContainer'>

                <div className='footerContainer__logoPhraseContainer'>

                    <div className='footerContainer__logoPhraseContainer__logoPhrase'>

                        <Link to={'/'} onClick={scrollToTop} className='footerContainer__logoPhraseContainer__logoPhrase__logo'>
                            {logo_store ? (
                                <img
                                className='footerContainer__logoPhraseContainer__logoPhrase__logo__prop'
                                src={`http://localhost:8081/${logo_store}`}
                                alt="logo_tienda"
                                />
                            ) : null}
                        </Link>

                        <div className='footerContainer__logoPhraseContainer__logoPhrase__phrase'>
                            <div className="footerContainer__logoPhraseContainer__logoPhrase__phrase__prop">{aboutText}</div>
                        </div>

                    </div>

                </div>

                <div className='footerContainer__faqContainer'>
                    
                    <div className='footerContainer__faqContainer__faq'>

                        <div className='footerContainer__faqContainer__faq__title'>Enlaces</div>
                        <Link to={"/#catalog"} className='footerContainer__faqContainer__faq__links'>
                            - Catálogo
                        </Link>
                        <Link to={"/about"} className='footerContainer__faqContainer__faq__links'>
                            - Sobre nosotros
                        </Link>
                        <Link to={"/contact"} className='footerContainer__faqContainer__faq__links'>
                            - Contacto
                        </Link>
                        <Link to={"/cart"} className='footerContainer__faqContainer__faq__links'>
                            - Carrito de compras
                        </Link>
                        <Link to={"/logIn"} className='footerContainer__faqContainer__faq__links'>
                            - Log In
                        </Link>

                    </div>

                </div>

                <div className='footerContainer__contactContainer'>

                    <div className='footerContainer__contactContainer__contact'>

                        <div className='footerContainer__contactContainer__contact__title'>
                            <div className='footerContainer__contactContainer__contact__title__prop'>Encuentranos</div>
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
                                - {phone}
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