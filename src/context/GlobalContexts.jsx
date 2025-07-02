// src/context/GlobalContexts.jsx

import React from "react";
import { CPanelProductsContext } from "./CPanelProductsContext";
import { CPanelSalesContext } from "./CPanelSalesContext";
import { ShoppingCartContext } from "./ShoppingCartContext";
import { ThemeProvider } from "./ThemeProviderContext";
import { IsLoggedInContext } from "./IsLoggedContext";
import { FavoritesProvider } from "./FavoritesContext";


const GlobalContexts = ({ children }) => {
    return (
        <FavoritesProvider>
            <CPanelProductsContext>
                <CPanelSalesContext>
                    <ShoppingCartContext>
                        <ThemeProvider>
                            <IsLoggedInContext>
                                {children}
                            </IsLoggedInContext>
                        </ThemeProvider>
                    </ShoppingCartContext>
                </CPanelSalesContext>
            </CPanelProductsContext>
        </FavoritesProvider>
    );
};

export default GlobalContexts;
