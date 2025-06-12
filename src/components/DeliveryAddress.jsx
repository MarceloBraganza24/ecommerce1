import React from 'react';
import { Link } from 'react-router-dom';
import Spinner from './Spinner';

const DeliveryAddress = ({deliveryAddressFormData,isLoadingDeliveryForm}) => {

    const corregirCapitalizacion = (texto) => {
        if (!texto) return '';
    
        const excepciones = ['de', 'del', 'la', 'el', 'y', 'en', 'a', 'los', 'las', 'por', 'con', 'para', 'al', 'un', 'una'];
    
        return texto
            .toLocaleLowerCase('es-AR')
            .split(' ')
            .map((palabra, index) => {
                if (excepciones.includes(palabra) && index !== 0) {
                    return palabra;
                }
                return palabra.charAt(0).toUpperCase() + palabra.slice(1);
            })
            .join(' ');
    };

    return (

        <>
            <div className='deliveryAddressContainer'>

                <div className='deliveryAddressContainer__label'>Enviar a:</div>
                {
                    isLoadingDeliveryForm ? 
                        <>
                            <div className="deliveryAddressContainer__spinner">
                                <Spinner/>
                            </div>
                        </>
                    :
                    deliveryAddressFormData.street ?
                    <div className='deliveryAddressContainer__address'>{corregirCapitalizacion(deliveryAddressFormData.street)} {corregirCapitalizacion(deliveryAddressFormData.street_number)}, {corregirCapitalizacion(deliveryAddressFormData.locality)}</div>
                    :
                    <Link to={"/deliveryForm"} className='deliveryAddressContainer__address'>
                        agregar dirección
                    </Link>
                }
                <Link to={"/deliveryForm"} className='deliveryAddressContainer__btnEdit'>
                    Editar
                </Link>
            </div>
        </>

    )

}

export default DeliveryAddress



