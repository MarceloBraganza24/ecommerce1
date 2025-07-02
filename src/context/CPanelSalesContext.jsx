import { createContext, useState } from "react"
import { toast } from "react-toastify"

export const SalesContext = createContext(null)

export const CPanelSalesContext = ({children}) => {
    
    const [addedProducts, setAddedProducts] = useState([]);
    const [selectedVariantsMap, setSelectedVariantsMap] = useState({});

    const resetSale = () => {
        setAddedProducts([]);
        setSelectedVariantsMap({});
    };

    return (

        <SalesContext.Provider 
            value={{
                addedProducts,
                setAddedProducts,
                selectedVariantsMap,
                setSelectedVariantsMap,
                resetSale,
            }}
        >
            {children}
        </SalesContext.Provider>

    )

}