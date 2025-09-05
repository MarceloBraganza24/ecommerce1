import { createContext, useState } from "react"
import { toast } from "react-toastify"

export const ProductsContext = createContext(null)

export const CPanelProductsContext = ({children}) => {

    const [product, setProduct] = useState({
        images: [],
        title: '',
        description: '',
        price: '',
        stock: '',
        state: '',
        category: '',
        camposDinamicos: [],
        isFeatured: false
    });

    const [nuevoCampo, setNuevoCampo] = useState({ key: '', value: '' });

    const [variantes, setVariantes] = useState([]);

    const [nuevaVariante, setNuevaVariante] = useState({
        campos: {},
        price: '',
        stock: ''
    });

    return (

        <ProductsContext.Provider
            value={{
            product,
            setProduct,
            nuevoCampo,
            setNuevoCampo,
            variantes,
            setVariantes,
            nuevaVariante,
            setNuevaVariante
        }}
        >
            {children}
        </ProductsContext.Provider>

    )

}