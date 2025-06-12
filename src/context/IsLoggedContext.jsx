import { createContext, useState } from "react"

export const IsLoggedContext = createContext(null)

export const IsLoggedInContext = ({children}) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = () => {
        setIsLoggedIn(true);
    };
    
    const logout = () => {
        setIsLoggedIn(false);
    };

    return (

        <IsLoggedContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </IsLoggedContext.Provider>

    )

}