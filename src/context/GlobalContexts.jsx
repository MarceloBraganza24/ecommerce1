// src/context/GlobalContexts.jsx

import React from "react";
import { CPanelProductsContext } from "./CPanelProductsContext";
import { CPanelSalesContext } from "./CPanelSalesContext";
import { ShoppingCartContext } from "./ShoppingCartContext";
import { ThemeProvider } from "./ThemeProviderContext";
import { IsLoggedInContext } from "./IsLoggedContext";
import { FavoritesProvider } from "./FavoritesContext";
import { AuthProvider } from './AuthContext.jsx';


const GlobalContexts = ({ children }) => {
    return (
        <AuthProvider>
            <IsLoggedInContext>
                <FavoritesProvider>
                    <CPanelProductsContext>
                        <CPanelSalesContext>
                            <ShoppingCartContext>
                                <ThemeProvider>
                                        {children}
                                </ThemeProvider>
                            </ShoppingCartContext>
                        </CPanelSalesContext>
                    </CPanelProductsContext>
                </FavoritesProvider>
            </IsLoggedInContext>
        </AuthProvider>
    );
};

export default GlobalContexts;
